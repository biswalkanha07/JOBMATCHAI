from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.database import get_db
from app.schemas.core import (
    StudentProfileResponse, ApplicationCreate, ApplicationResponse,
    StudentProfileUpdate, EducationCreate, EducationResponse,
    ExperienceCreate, ExperienceResponse, ProjectCreate, ProjectResponse,
    StudentSkillCreate, StudentSkillResponse, ResumeResponse, MatchResultResponse
)
from app.services.matching_service import matching_service
from app.models.student import StudentProfile, Education, Experience, Project, Skill, StudentSkill, Resume
from fastapi import UploadFile, File, Form
import os
import shutil
import uuid
from app.api.deps import get_current_student
from app.services.embedding_service import embedding_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def calculate_completion(profile: StudentProfile) -> int:
    completion = 0
    if profile.first_name and profile.last_name:
        completion += 20
    if len(profile.resumes) > 0:
        completion += 20
    if len(profile.education) > 0:
        completion += 20
    if len(profile.experience) > 0 or profile.career_status == "Fresher":
        completion += 15
    if len(profile.skill_associations) > 0:
        completion += 15
    if len(profile.projects) > 0:
        completion += 10
    return min(completion, 100)

@router.get("/me/profile", response_model=StudentProfileResponse)
def get_my_profile(
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    current_student.completion_percentage = calculate_completion(current_student)
    return current_student

def _update_student_embedding(db: Session, student: StudentProfile):
    try:
        skills = [s.name for s in student.skills] if hasattr(student, "skills") else []
        education = [f"{e.degree} at {e.institution}" for e in student.education] if hasattr(student, "education") else []
        experience = [f"{e.job_title} at {e.company_name}" for e in student.experience] if hasattr(student, "experience") else []
        projects = [p.name for p in student.projects] if hasattr(student, "projects") else []
        
        embedding = embedding_service.generate_student_embedding(student, skills, education, experience, projects)
        if embedding:
            student.embedding = embedding
            db.commit()
            db.refresh(student)
    except Exception as e:
        logger.error(f"Failed to generate embedding for student {student.id}: {e}")

@router.patch("/me/profile", response_model=StudentProfileResponse)
def update_my_profile(
    data: StudentProfileUpdate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_student, key, value)
    
    db.commit()
    db.refresh(current_student)
    current_student.completion_percentage = calculate_completion(current_student)
    
    _update_student_embedding(db, current_student)
        
    return current_student

# --- Education ---
@router.post("/me/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def add_education(
    data: EducationCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    education = Education(**data.model_dump(), student_id=current_student.id)
    db.add(education)
    db.commit()
    db.refresh(education)
    _update_student_embedding(db, current_student)
    return education

@router.delete("/me/education/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    id: int,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    education = db.query(Education).filter(Education.id == id, Education.student_id == current_student.id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education record not found")
    db.delete(education)
    db.commit()
    _update_student_embedding(db, current_student)

# --- Experience ---
@router.post("/me/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def add_experience(
    data: ExperienceCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    experience = Experience(**data.model_dump(), student_id=current_student.id)
    db.add(experience)
    db.commit()
    db.refresh(experience)
    _update_student_embedding(db, current_student)
    return experience

@router.delete("/me/experience/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    id: int,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    experience = db.query(Experience).filter(Experience.id == id, Experience.student_id == current_student.id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience record not found")
    db.delete(experience)
    db.commit()
    _update_student_embedding(db, current_student)

# --- Projects ---
@router.post("/me/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def add_project(
    data: ProjectCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    project = Project(**data.model_dump(), student_id=current_student.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    _update_student_embedding(db, current_student)
    return project

@router.delete("/me/projects/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    id: int,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == id, Project.student_id == current_student.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    _update_student_embedding(db, current_student)

# --- Skills ---
@router.post("/me/skills", response_model=StudentSkillResponse, status_code=status.HTTP_201_CREATED)
def add_skill(
    data: StudentSkillCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(func.lower(Skill.name) == data.skill_name.lower()).first()
    if not skill:
        skill = Skill(name=data.skill_name)
        db.add(skill)
        db.flush()
    
    existing = db.query(StudentSkill).filter(
        StudentSkill.student_id == current_student.id,
        StudentSkill.skill_id == skill.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Skill already added")
        
    student_skill = StudentSkill(
        student_id=current_student.id,
        skill_id=skill.id,
        proficiency=data.proficiency,
        years_of_experience=data.years_of_experience,
        last_used=data.last_used,
        priority=data.priority
    )
    db.add(student_skill)
    db.commit()
    db.refresh(student_skill)
    _update_student_embedding(db, current_student)
    
    return student_skill

@router.delete("/me/skills/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_skill(
    id: int,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    assoc = db.query(StudentSkill).filter(
        StudentSkill.student_id == current_student.id,
        StudentSkill.skill_id == id
    ).first()
    
    if not assoc:
        raise HTTPException(status_code=404, detail="Skill not found in profile")
    
    db.delete(assoc)
    db.commit()
    _update_student_embedding(db, current_student)

# --- Resume ---
UPLOAD_DIR = "uploads/resumes"

@router.post("/me/resume", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    
    if is_primary:
        db.query(Resume).filter(Resume.student_id == current_student.id).update({"is_primary": False})
        
    resume = Resume(
        student_id=current_student.id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size,
        is_primary=is_primary
    )
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/me/resume/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    id: int,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == id, Resume.student_id == current_student.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()

# --- Applications ---
@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    data: ApplicationCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    from app.models.job import Job, Application
    
    job = db.query(Job).filter(Job.id == data.job_id, Job.status == "PUBLISHED").first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not published")
        
    existing_app = db.query(Application).filter(
        Application.student_id == current_student.id,
        Application.job_id == job.id
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this job")
        
    distance = None
    if current_student.embedding and job.embedding:
        distance = db.query(
            StudentProfile.embedding.cosine_distance(job.embedding)
        ).filter(StudentProfile.id == current_student.id).scalar()

    match_result = matching_service._create_match_result(current_student, job, distance, job.tenant_id)
    db.add(match_result)
    db.flush()

    application = Application(
        student_id=current_student.id,
        job_id=job.id,
        status="APPLIED",
        match_result_id=match_result.id
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/applications", response_model=List[ApplicationResponse])
def get_my_applications(
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    from app.models.job import Application
    apps = db.query(Application).filter(Application.student_id == current_student.id).all()
    return apps

@router.get("/me/recommended-jobs", response_model=List[MatchResultResponse])
def get_recommended_jobs(
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    matches = matching_service.match_student_to_jobs(db, current_student)
    return matches
