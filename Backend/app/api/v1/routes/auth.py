from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import LoginData, Token, StudentRegistration, RecruiterRegistration
from app.schemas.core import UserResponse
from app.models.user import User
from app.models.student import StudentProfile
from app.models.recruiter import RecruiterProfile, Company
from app.models.tenant import Tenant
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
import uuid

router = APIRouter()

@router.post("/register/student", response_model=UserResponse)
def register_student(data: StudentRegistration, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        role="STUDENT"
    )
    db.add(user)
    db.flush() # To get user.id

    profile = StudentProfile(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        preferred_job_roles=data.preferred_job_roles,
        location=data.location
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user

@router.post("/register/recruiter", response_model=UserResponse)
def register_recruiter(data: RecruiterRegistration, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        role="RECRUITER"
    )
    db.add(user)
    db.flush()

    # Create Tenant Workspace
    tenant = Tenant(
        name=f"{data.company_name} Workspace",
        slug=str(uuid.uuid4())[:8],
        created_by=user.id
    )
    db.add(tenant)
    db.flush()

    # Create Company
    company = Company(
        tenant_id=tenant.id,
        name=data.company_name,
        website=data.company_website
    )
    db.add(company)

    profile = RecruiterProfile(
        user_id=user.id,
        tenant_id=tenant.id,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone
    )
    db.add(profile)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token = create_access_token(subject=user.id, role=user.role)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
