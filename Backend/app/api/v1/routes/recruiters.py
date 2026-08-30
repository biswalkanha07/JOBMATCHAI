from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.api.deps import get_current_user
from app.schemas.core import RecruiterProfileResponse, RecruiterProfileUpdate, CompanyResponse, CompanyUpdate

router = APIRouter()

@router.get("/me/profile", response_model=RecruiterProfileResponse)
def get_recruiter_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "RECRUITER":
        raise HTTPException(status_code=403, detail="Not authorized as recruiter")
        
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
        
    return profile

@router.put("/me/profile", response_model=RecruiterProfileResponse)
def update_recruiter_profile(
    profile_update: RecruiterProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "RECRUITER":
        raise HTTPException(status_code=403, detail="Not authorized as recruiter")
        
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
        
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/company", response_model=CompanyResponse)
def update_company(
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "RECRUITER":
        raise HTTPException(status_code=403, detail="Not authorized as recruiter")
        
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile or not profile.tenant_id:
        raise HTTPException(status_code=404, detail="Tenant not found for this recruiter")
        
    company = db.query(Company).filter(Company.tenant_id == profile.tenant_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    update_data = company_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
        
    db.commit()
    db.refresh(company)
    return company
