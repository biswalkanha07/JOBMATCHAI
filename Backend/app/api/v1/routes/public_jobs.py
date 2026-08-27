from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.core import PublicJobResponse
from app.models.job import Job

router = APIRouter()

@router.get("/", response_model=List[PublicJobResponse])
def get_public_jobs(db: Session = Depends(get_db)):
    # Students and public can discover ALL published jobs from ALL tenants
    jobs = db.query(Job).filter(Job.status == "PUBLISHED").all()
    # In a real scenario, we would join with Company to populate company_name
    return jobs

@router.get("/{job_id}", response_model=PublicJobResponse)
def get_public_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id, Job.status == "PUBLISHED").first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
