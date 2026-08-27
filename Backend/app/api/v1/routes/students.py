from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.core import StudentProfileResponse, ApplicationCreate, ApplicationResponse
from app.models.student import StudentProfile
from app.api.deps import get_current_student

router = APIRouter()

@router.get("/me/profile", response_model=StudentProfileResponse)
def get_my_profile(
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # This automatically uses the central User's identity to fetch the student profile
    return current_student

@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    data: ApplicationCreate,
    current_student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    from app.models.job import Job, Application
    
    # Verify job exists and is published
    job = db.query(Job).filter(Job.id == data.job_id, Job.status == "PUBLISHED").first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not published")
        
    # Prevent duplicate applications
    existing_app = db.query(Application).filter(
        Application.student_id == current_student.id,
        Application.job_id == job.id
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this job")
        
    application = Application(
        student_id=current_student.id,
        job_id=job.id,
        status="APPLIED"
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
