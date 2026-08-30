import re
import json
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import StudentProfile
from app.models.job import Job, MatchResult

# Default Weights configuration
DEFAULT_WEIGHTS = {
    'skills': 0.35,
    'experience': 0.20,
    'projects': 0.15,
    'role': 0.10,
    'education': 0.05,
    'location': 0.05,
    'work_mode': 0.05,
    'certifications': 0.05
}

class MatchingService:
    def check_eligibility(self, student: StudentProfile, job: Job) -> bool:
        if job.minimum_experience and job.minimum_experience > 0:
            total_months = 0
            if getattr(student, "experience", None):
                for exp in student.experience:
                    start = exp.start_date
                    end = exp.end_date or date.today()
                    if start:
                        months = (end.year - start.year) * 12 + (end.month - start.month)
                        total_months += max(0, months)
            total_years = total_months / 12.0
            if total_years < job.minimum_experience:
                return False
        return True
        
    def _is_skill_in_text(self, skill: str, text: str) -> bool:
        # Whole word matching to prevent "Java" matching "JavaScript"
        skill_clean = skill.strip()
        if not skill_clean:
            return False
        # Escape regex characters in skill just in case
        pattern = rf"\b{re.escape(skill_clean)}\b"
        return bool(re.search(pattern, text, re.IGNORECASE))

    def calculate_experience_score(self, student: StudentProfile, min_experience: int, max_experience: int = None):
        if not min_experience or min_experience <= 0:
            # Not Available - will be excluded from weights
            return None, {"requirement": "Experience", "status": "Not Available", "evidence": "No minimum experience required by job.", "category": "experience"}
            
        total_months = 0
        if getattr(student, "experience", None):
            for exp in student.experience:
                start = exp.start_date
                end = exp.end_date or date.today()
                if start:
                    months = (end.year - start.year) * 12 + (end.month - start.month)
                    total_months += max(0, months)
                
        total_years = total_months / 12.0
        
        if total_years >= min_experience:
            return 1.0, {"requirement": f"{min_experience}+ years", "status": "Strong Match", "evidence": f"Candidate has {total_years:.1f} years of experience.", "category": "experience"}
        elif total_years > 0:
            score = total_years / min_experience
            return score, {"requirement": f"{min_experience}+ years", "status": "Partial Match", "evidence": f"Candidate has {total_years:.1f} years, which is below the {min_experience} years requirement.", "category": "experience"}
        else:
            return 0.0, {"requirement": f"{min_experience}+ years", "status": "Missing", "evidence": "No professional experience found in profile.", "category": "experience"}

    def calculate_skill_score(self, student: StudentProfile, job: Job):
        req_skills_raw = [s.strip() for s in (job.required_qualifications or "").split(",") if s.strip()]
        pref_skills_raw = [s.strip() for s in (job.preferred_qualifications or "").split(",") if s.strip()]
        
        # We also want to treat job.required_qualifications and job.preferred_qualifications separately
        
        student_skills_set = {s.name.lower() for s in student.skills} if getattr(student, "skills", None) else set()
        
        # Gather full text evidence
        project_texts = " ".join([p.description.lower() for p in student.projects if p.description]) if getattr(student, "projects", None) else ""
        exp_texts = " ".join([e.description.lower() for e in student.experience if e.description]) if getattr(student, "experience", None) else ""
        
        details = []
        
        matched_req = []
        missing_req = []
        
        for req in req_skills_raw:
            req_lower = req.lower()
            # 1. Exact match in skills array
            if req_lower in student_skills_set:
                matched_req.append(req)
                details.append({"requirement": req, "status": "Strong Match", "evidence": "Listed directly in technical skills.", "category": "skills"})
            # 2. Whole word match in experience
            elif self._is_skill_in_text(req, exp_texts):
                matched_req.append(req)
                details.append({"requirement": req, "status": "Strong Match", "evidence": "Evidence found in professional experience.", "category": "skills"})
            # 3. Whole word match in projects
            elif self._is_skill_in_text(req, project_texts):
                matched_req.append(req)
                details.append({"requirement": req, "status": "Strong Match", "evidence": "Evidence found in project descriptions.", "category": "skills"})
            else:
                missing_req.append(req)
                details.append({"requirement": req, "status": "Missing", "evidence": "No reliable evidence found in profile.", "category": "skills"})
                
        matched_pref = []
        for pref in pref_skills_raw:
            pref_lower = pref.lower()
            if pref_lower in student_skills_set or self._is_skill_in_text(pref, exp_texts) or self._is_skill_in_text(pref, project_texts):
                matched_pref.append(pref)
                details.append({"requirement": pref, "status": "Strong Match", "evidence": "Evidence found in profile (Preferred).", "category": "skills"})
            else:
                # Preferred skills missing are marked as Missing but impact score less
                details.append({"requirement": pref, "status": "Missing", "evidence": "No evidence found (Preferred skill).", "category": "skills"})
        
        # If no skills required at all, mark as Not Available
        if not req_skills_raw and not pref_skills_raw:
            return None, [], [], [{"requirement": "Skills", "status": "Not Available", "evidence": "Job does not specify required skills.", "category": "skills"}]
            
        req_score = len(matched_req) / len(req_skills_raw) if req_skills_raw else 1.0
        pref_score = len(matched_pref) / len(pref_skills_raw) if pref_skills_raw else 1.0
        
        if req_skills_raw and pref_skills_raw:
            overall_skill_score = (req_score * 0.8) + (pref_score * 0.2)
        elif req_skills_raw:
            overall_skill_score = req_score
        else:
            overall_skill_score = pref_score
            
        matched_all = matched_req + matched_pref
        missing_all = missing_req + [p for p in pref_skills_raw if p not in matched_pref]
        
        return overall_skill_score, matched_all, missing_all, details

    def calculate_education_score(self, student: StudentProfile, job: Job):
        if not getattr(job, "minimum_education", None):
            return None, {"requirement": "Education", "status": "Not Available", "evidence": "Job does not require a specific degree.", "category": "education"}
            
        has_degree = len(student.education) > 0 if getattr(student, "education", None) else False
        if has_degree:
            return 1.0, {"requirement": f"Education: {job.minimum_education}", "status": "Strong Match", "evidence": "Candidate has listed educational degrees.", "category": "education"}
        else:
            return 0.0, {"requirement": f"Education: {job.minimum_education}", "status": "Missing", "evidence": "No education history provided.", "category": "education"}

    def calculate_project_score(self, student: StudentProfile, job: Job, semantic_score: float):
        req_skills_raw = [s.strip() for s in (job.required_qualifications or "").split(",") if s.strip()]
        
        if not getattr(student, "projects", None) or len(student.projects) == 0:
            if not req_skills_raw:
                return None, {"requirement": "Projects", "status": "Not Available", "evidence": "No projects listed, but no specific skills required.", "category": "projects"}
            return 0.0, {"requirement": "Projects", "status": "Missing", "evidence": "No projects listed in profile.", "category": "projects"}
            
        project_texts = " ".join([p.description.lower() for p in student.projects if p.description])
        
        # Calculate overlap with required skills directly
        matched_tech = []
        for req in req_skills_raw:
            if self._is_skill_in_text(req, project_texts):
                matched_tech.append(req)
                
        # Base score on direct tech overlap
        tech_score = len(matched_tech) / len(req_skills_raw) if req_skills_raw else 0.5
        
        # Final score blends direct tech overlap (70%) with semantic domain relevance (30%)
        final_score = (tech_score * 0.7) + (semantic_score * 0.3)
        
        status = "Strong Match" if final_score > 0.7 else "Partial Match" if final_score > 0.3 else "Missing"
        
        evidence_text = f"Candidate projects demonstrate overlap with {len(matched_tech)} job technologies." if matched_tech else "Projects have general semantic relevance but lack specific required technologies."
        
        return final_score, {"requirement": "Projects Match", "status": status, "evidence": evidence_text, "category": "projects"}
        
    def calculate_role_score(self, student: StudentProfile, job: Job, semantic_score: float):
        # Compare job.title directly against student title/headline
        job_title = (job.title or "").lower()
        student_headline = (student.profile_headline or "").lower()
        pref_roles = [r.lower() for r in student.preferred_job_roles] if getattr(student, "preferred_job_roles", None) else []
        
        # 1. Exact or partial match in preferred roles
        has_direct_match = any(job_title in r or r in job_title for r in pref_roles)
        # 2. Match in headline
        has_headline_match = (job_title in student_headline) or (student_headline and student_headline in job_title)
        
        if has_direct_match or has_headline_match:
            score = 0.8 + (semantic_score * 0.2)
            evidence = "Job title strongly aligns with candidate preferred roles or headline."
            status = "Strong Match"
        else:
            # Fall back to semantic
            score = semantic_score
            status = "Partial Match" if score > 0.5 else "Missing"
            evidence = "Role alignment based purely on semantic similarity of profile to job description."
            
        return score, {"requirement": "Job Role Alignment", "status": status, "evidence": evidence, "category": "role"}

    def calculate_location_score(self, student: StudentProfile, job: Job):
        job_loc = (job.location or "").lower()
        if not job_loc:
            return None, {"requirement": "Location", "status": "Not Available", "evidence": "Job does not specify a location requirement.", "category": "location"}
            
        is_job_remote = "remote" in job_loc
        student_locs = [str(l).lower() for l in student.preferred_work_locations] if getattr(student, "preferred_work_locations", None) else []
            
        if not student_locs:
            if getattr(student, "willing_to_relocate", False):
                return 0.8, {"requirement": f"Location: {job.location}", "status": "Partial Match", "evidence": "Student is willing to relocate.", "category": "location"}
            return None, {"requirement": f"Location: {job.location}", "status": "Not Available", "evidence": "Candidate did not specify location preferences.", "category": "location"}
            
        for loc in student_locs:
            if loc in job_loc or job_loc in loc:
                return 1.0, {"requirement": f"Location: {job.location}", "status": "Strong Match", "evidence": "Candidate preferred location matches job.", "category": "location"}
                
        if is_job_remote and "remote" in student_locs:
            return 1.0, {"requirement": "Remote Work", "status": "Strong Match", "evidence": "Both job and candidate prefer remote.", "category": "location"}
            
        return 0.0, {"requirement": f"Location: {job.location}", "status": "Missing", "evidence": "Candidate location preferences do not match.", "category": "location"}

    def calculate_work_mode_score(self, student: StudentProfile, job: Job):
        job_mode = (job.work_mode or "").lower()
        if not job_mode:
            return None, {"requirement": "Work Mode", "status": "Not Available", "evidence": "Job does not specify a work mode.", "category": "work_mode"}
            
        student_modes = [str(m).lower() for m in student.work_mode] if getattr(student, "work_mode", None) else []
            
        if not student_modes:
            return None, {"requirement": f"Work Mode: {job.work_mode}", "status": "Not Available", "evidence": "Candidate did not specify work mode preferences.", "category": "work_mode"}
            
        for mode in student_modes:
            if mode in job_mode or job_mode in mode:
                return 1.0, {"requirement": f"Work Mode: {job.work_mode}", "status": "Strong Match", "evidence": "Work mode preference matches.", "category": "work_mode"}
                
        return 0.0, {"requirement": f"Work Mode: {job.work_mode}", "status": "Missing", "evidence": "Candidate prefers different work modes.", "category": "work_mode"}

    def calculate_salary_score(self, student: StudentProfile, job: Job):
        student_min = getattr(student, "expected_salary_min", None)
        job_max = job.maximum_salary
        job_min = job.minimum_salary
        
        if not student_min or (not job_max and not job_min):
            return None, {"requirement": "Salary Expectation", "status": "Not Available", "evidence": "Salary details missing from job or candidate.", "category": "certifications"}
            
        eff_job_max = job_max or (job_min * 1.5 if job_min else 0)
        
        if student_min <= eff_job_max:
            return 1.0, {"requirement": "Salary Expectation", "status": "Strong Match", "evidence": "Candidate expectations fall within job budget.", "category": "certifications"}
            
        score = max(0.0, 1.0 - ((student_min - eff_job_max) / eff_job_max))
        return score, {"requirement": "Salary Expectation", "status": "Partial Match", "evidence": "Candidate expectations slightly exceed job budget.", "category": "certifications"}

    def generate_explainability_json(self, overall: float, is_eligible: bool, skill_score: float, req_details: list, category_scores_raw: dict):
        matched = [r for r in req_details if r['status'] == 'Strong Match']
        partial = [r for r in req_details if r['status'] == 'Partial Match']
        missing = [r for r in req_details if r['status'] == 'Missing']
        not_avail = [r for r in req_details if r['status'] == 'Not Available']

        if overall >= 0.8:
            match_label = "Excellent Fit"
            summary = "Outstanding alignment with the job requirements across technical skills, experience, and role expectations."
        elif overall >= 0.6:
            match_label = "Good Fit"
            summary = "Strong alignment with the core requirements, with minor gaps or partial matches."
        else:
            match_label = "Moderate Fit"
            summary = "Partial alignment with the job requirements. Some critical skills or experience may be missing."
            
        if not is_eligible:
            match_label = "Does Not Meet Minimum Requirements"
            summary = "The candidate does not meet the strict minimum eligibility criteria (e.g., minimum experience)."

        # Determine confidence
        missing_data = len(not_avail)
        if missing_data == 0:
            confidence = "High"
        elif missing_data <= 2:
            confidence = "Medium"
        else:
            confidence = "Low"

        strengths = []
        if skill_score is not None and skill_score > 0.8: strengths.append("Strong technical skill alignment.")
        if category_scores_raw.get('experience') and category_scores_raw['experience'] > 0.8: strengths.append("Meets or exceeds experience requirements.")
        if category_scores_raw.get('role') and category_scores_raw['role'] > 0.8: strengths.append("High alignment with the job role.")

        gaps = []
        if category_scores_raw.get('experience') is not None and category_scores_raw['experience'] < 0.5: gaps.append("Experience duration is below requirements.")
        if len([m for m in missing if m['category'] == 'skills']) > 0: gaps.append("Missing some required technical skills.")

        # Ensure we pass numbers exactly to frontend (we can round to whole percentages safely here)
        return {
            "overall_match": round(overall * 100),
            "match_label": match_label,
            "confidence": confidence,
            "category_scores": {k: round(v * 100) if v is not None else 0 for k, v in category_scores_raw.items()},
            "matched_requirements": matched,
            "partial_requirements": partial,
            "missing_requirements": missing,
            "not_available_requirements": not_avail,
            "summary": summary,
            "strengths": strengths,
            "gaps": gaps
        }

    def _create_match_result(self, student, job, distance, tenant_id):
        is_eligible = self.check_eligibility(student, job)
        semantic_score = max(0.0, 1.0 - (distance or 0.0))
        
        # Calculate individual category scores and collect evidence
        # A score of None implies the category is "Not Available" / "Not Required"
        skill_score, matched_skills, missing_skills, skill_details = self.calculate_skill_score(student, job)
        exp_score, exp_detail = self.calculate_experience_score(student, job.minimum_experience, job.maximum_experience)
        proj_score, proj_detail = self.calculate_project_score(student, job, semantic_score)
        role_score, role_detail = self.calculate_role_score(student, job, semantic_score)
        edu_score, edu_detail = self.calculate_education_score(student, job)
        loc_score, loc_detail = self.calculate_location_score(student, job)
        mode_score, mode_detail = self.calculate_work_mode_score(student, job)
        sal_score, sal_detail = self.calculate_salary_score(student, job)
        
        raw_scores = {
            "skills": skill_score,
            "experience": exp_score,
            "projects": proj_score,
            "role": role_score,
            "education": edu_score,
            "location": loc_score,
            "work_mode": mode_score,
            "certifications": sal_score
        }
        
        # Calculate dynamic weights based on what is available
        total_active_weight = 0.0
        weighted_sum = 0.0
        
        for category, raw_val in raw_scores.items():
            if raw_val is not None:
                w = DEFAULT_WEIGHTS[category]
                total_active_weight += w
                weighted_sum += (raw_val * w)
                
        if total_active_weight > 0:
            overall = weighted_sum / total_active_weight
        else:
            overall = 0.0
        
        all_details = skill_details + [exp_detail, proj_detail, role_detail, edu_detail, loc_detail, mode_detail, sal_detail]
        explainability_json = self.generate_explainability_json(overall, is_eligible, skill_score, all_details, raw_scores)
        
        match = MatchResult(
            student_id=student.id,
            job_id=job.id,
            tenant_id=tenant_id,
            overall_score=overall,
            skill_score=skill_score or 0.0,
            text_score=semantic_score,
            education_score=edu_score or 0.0,
            experience_score=exp_score or 0.0,
            project_score=proj_score or 0.0,
            location_score=loc_score or 0.0,
            work_mode_score=mode_score or 0.0,
            salary_score=sal_score or 0.0,
            is_eligible=is_eligible,
            matched_skills=json.dumps(matched_skills),
            missing_skills=json.dumps(missing_skills),
            explanation=json.dumps(explainability_json)
        )
        return match

    def match_job_to_students(self, db: Session, job: Job, tenant_id: int) -> list[MatchResult]:
        if not job.embedding:
            return []
            
        results = db.query(
            StudentProfile,
            StudentProfile.embedding.cosine_distance(job.embedding).label('distance')
        ).filter(StudentProfile.embedding.isnot(None)).all()
        
        matches = []
        for student, distance in results:
            match = self._create_match_result(student, job, distance, tenant_id)
            match.student = student
            matches.append(match)
            
        matches.sort(key=lambda x: (x.is_eligible, x.overall_score), reverse=True)
        return matches

    def match_student_to_jobs(self, db: Session, student: StudentProfile) -> list[MatchResult]:
        if not student.embedding:
            return []
            
        results = db.query(
            Job,
            Job.embedding.cosine_distance(student.embedding).label('distance')
        ).filter(Job.embedding.isnot(None), Job.status == "PUBLISHED").all()
        
        matches = []
        for job, distance in results:
            match = self._create_match_result(student, job, distance, job.tenant_id)
            match.job = job
            matches.append(match)
            
        matches.sort(key=lambda x: (x.is_eligible, x.overall_score), reverse=True)
        return matches

matching_service = MatchingService()
