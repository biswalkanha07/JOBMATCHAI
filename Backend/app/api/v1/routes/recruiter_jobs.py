from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
import os
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.core import JobResponse, JobCreate, RecruiterApplicationResponse, ApplicationStatusUpdate, MatchResultResponse
from app.services.matching_service import matching_service
from app.models.job import Job
from app.models.recruiter import RecruiterProfile
from app.models.student import Resume
from app.api.deps import get_current_recruiter_with_tenant
from app.services.embedding_service import embedding_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    # Tenant Isolation: The job is forcibly associated with the recruiter's tenant_id
    job = Job(
        **job_in.model_dump(),
        tenant_id=current_recruiter.tenant_id,
        recruiter_id=current_recruiter.id
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Generate Job Embedding Safely
    try:
        required_skills = [s for s in (job.required_qualifications or "").split(",")] if job.required_qualifications else []
        preferred_skills = [s for s in (job.preferred_qualifications or "").split(",")] if job.preferred_qualifications else []
        embedding = embedding_service.generate_job_embedding(job, required_skills, preferred_skills)
        if embedding:
            job.embedding = embedding
            db.commit()
            db.refresh(job)
    except Exception as e:
        logger.error(f"Failed to generate embedding for job {job.id}: {e}")
        
    return job

@router.get("/", response_model=List[JobResponse])
def get_tenant_jobs(
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    # Tenant Isolation: Recruiters can ONLY see jobs belonging to their tenant
    jobs = db.query(Job).filter(Job.tenant_id == current_recruiter.tenant_id).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_tenant_job(
    job_id: int,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    # Tenant Isolation: Enforce that the job belongs to this recruiter's tenant
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_recruiter.tenant_id
    ).first()
    
    if not job:
        # Return 404 so we don't leak whether the job exists in another tenant
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobCreate,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_recruiter.tenant_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
        
    db.commit()
    db.refresh(job)
    
    # Re-generate Job Embedding Safely
    try:
        required_skills = [s for s in (job.required_qualifications or "").split(",")] if job.required_qualifications else []
        preferred_skills = [s for s in (job.preferred_qualifications or "").split(",")] if job.preferred_qualifications else []
        embedding = embedding_service.generate_job_embedding(job, required_skills, preferred_skills)
        if embedding:
            job.embedding = embedding
            db.commit()
            db.refresh(job)
    except Exception as e:
        logger.error(f"Failed to generate embedding for job {job.id}: {e}")
        
    return job

@router.get("/all/applications", response_model=List[RecruiterApplicationResponse])
def get_all_applications(
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    from app.models.job import Application
    from sqlalchemy.orm import joinedload
    
    # Get all jobs for this tenant
    job_ids = [job.id for job in db.query(Job.id).filter(Job.tenant_id == current_recruiter.tenant_id).all()]
    
    if not job_ids:
        return []
        
    apps = db.query(Application).options(
        joinedload(Application.student),
        joinedload(Application.match_result),
        joinedload(Application.job)
    ).filter(Application.job_id.in_(job_ids)).all()
    
    return apps

@router.get("/{job_id}/applications", response_model=List[RecruiterApplicationResponse])
def get_job_applications(
    job_id: int,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    from app.models.job import Application
    # Tenant Isolation: Enforce that the job belongs to this recruiter's tenant
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_recruiter.tenant_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    from sqlalchemy.orm import joinedload
    apps = db.query(Application).options(
        joinedload(Application.student),
        joinedload(Application.match_result),
        joinedload(Application.job)
    ).filter(Application.job_id == job.id).all()
    return apps

@router.patch("/{job_id}/applications/{app_id}/status", response_model=RecruiterApplicationResponse)
def update_application_status(
    job_id: int,
    app_id: int,
    status_update: ApplicationStatusUpdate,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    from app.models.job import Application
    # Tenant Isolation: Ensure the job belongs to this recruiter's tenant
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_recruiter.tenant_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    from sqlalchemy.orm import joinedload
    app = db.query(Application).options(
        joinedload(Application.student),
        joinedload(Application.match_result),
        joinedload(Application.job)
    ).filter(Application.id == app_id, Application.job_id == job.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = status_update.status
    db.commit()
    db.refresh(app)
    return app

@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    from app.models.job import Application
    from sqlalchemy import func
    
    tenant_jobs_query = db.query(Job.id).filter(Job.tenant_id == current_recruiter.tenant_id)
    
    active_jobs = db.query(func.count(Job.id)).filter(
        Job.tenant_id == current_recruiter.tenant_id,
        Job.status == "PUBLISHED"
    ).scalar() or 0
    
    total_jobs = db.query(func.count(Job.id)).filter(
        Job.tenant_id == current_recruiter.tenant_id
    ).scalar() or 0
    
    total_applications = db.query(func.count(Application.id)).filter(
        Application.job_id.in_(tenant_jobs_query)
    ).scalar() or 0
    
    pending_evaluation = db.query(func.count(Application.id)).filter(
        Application.job_id.in_(tenant_jobs_query),
        Application.status == "APPLIED"
    ).scalar() or 0
    
    shortlisted = db.query(func.count(Application.id)).filter(
        Application.job_id.in_(tenant_jobs_query),
        Application.status.in_(["SHORTLISTED", "INTERVIEW", "ACCEPTED"])
    ).scalar() or 0
    
    rejected = db.query(func.count(Application.id)).filter(
        Application.job_id.in_(tenant_jobs_query),
        Application.status == "REJECTED"
    ).scalar() or 0
    
    return {
        "active_jobs": active_jobs,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "pending_evaluation": pending_evaluation,
        "shortlisted": shortlisted,
        "rejected": rejected
    }

@router.get("/resume/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server")
        
    return FileResponse(
        path=resume.file_path, 
        filename=resume.file_name, 
        media_type=resume.file_type or "application/octet-stream"
    )

@router.get("/all/matches", response_model=List[MatchResultResponse])
def get_all_matches(
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    from app.models.job import Job
    # Get all jobs for this tenant
    jobs = db.query(Job).filter(Job.tenant_id == current_recruiter.tenant_id).all()
    
    if not jobs:
        return []
        
    all_matches = []
    for job in jobs:
        job_matches = matching_service.match_job_to_students(db, job, current_recruiter.tenant_id)
        all_matches.extend(job_matches)
        
    # Sort all matches by highest score first
    all_matches.sort(key=lambda m: m.overall_score, reverse=True)
    
    return all_matches

@router.get("/{job_id}/matches", response_model=List[MatchResultResponse])
def get_job_matches(
    job_id: int,
    current_recruiter: RecruiterProfile = Depends(get_current_recruiter_with_tenant),
    db: Session = Depends(get_db)
):
    # Tenant Isolation: Enforce that the job belongs to this recruiter's tenant
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_recruiter.tenant_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    matches = matching_service.match_job_to_students(db, job, current_recruiter.tenant_id)
    return matches
