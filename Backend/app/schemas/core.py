from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# --- Skills ---
class SkillBase(BaseModel):
    name: str

class SkillResponse(SkillBase):
    id: int
    category: Optional[str] = None
    model_config = {"from_attributes": True}

# --- Student ---
class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    location: Optional[str] = None
    about_me: Optional[str] = None
    preferred_job_role: Optional[str] = None
    expected_salary_min: Optional[int] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    skills: List[SkillResponse] = []
    model_config = {"from_attributes": True}

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    student_profile: Optional[StudentProfileResponse] = None
    model_config = {"from_attributes": True}

# --- Recruiter & Tenant ---
class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    tenant_id: int
    model_config = {"from_attributes": True}

class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    company: Optional[CompanyResponse] = None
    model_config = {"from_attributes": True}

class RecruiterProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    tenant_id: int
    tenant: Optional[TenantResponse] = None
    model_config = {"from_attributes": True}

# --- Job ---
class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    status: str = "DRAFT"

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    tenant_id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class PublicJobResponse(JobBase):
    id: int
    company_name: Optional[str] = None # Will populate this manually or via relationship
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Applications ---
class ApplicationCreate(BaseModel):
    job_id: int

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    job: Optional[JobResponse] = None
    model_config = {"from_attributes": True}

class RecruiterApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    student: Optional[StudentProfileResponse] = None
    model_config = {"from_attributes": True}
