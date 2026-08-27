from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.core import JobResponse, JobCreate, RecruiterApplicationResponse
from app.models.job import Job
from app.models.recruiter import RecruiterProfile
from app.api.deps import get_current_recruiter_with_tenant

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
        
    apps = db.query(Application).filter(Application.job_id == job.id).all()
    return apps
