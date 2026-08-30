from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import date, datetime

# --- Skills ---
class SkillBase(BaseModel):
    name: str

class SkillCreate(BaseModel):
    name: str

class SkillResponse(SkillBase):
    id: int
    category: Optional[str] = None
    model_config = {"from_attributes": True}

class StudentSkillBase(BaseModel):
    proficiency: Optional[str] = None
    years_of_experience: Optional[float] = None
    last_used: Optional[int] = None
    priority: Optional[str] = None

class StudentSkillCreate(StudentSkillBase):
    skill_name: str

class StudentSkillResponse(StudentSkillBase):
    skill: SkillResponse
    model_config = {"from_attributes": True}

# --- Resume ---
class ResumeResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    version: Optional[int] = None
    is_primary: Optional[bool] = None
    visibility: Optional[str] = None
    uploaded_at: datetime
    model_config = {"from_attributes": True}

# --- Education ---
class EducationBase(BaseModel):
    education_level: Optional[str] = None
    degree: str
    specialization: Optional[str] = None
    institution: str
    university_or_board: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_studying: bool = False
    percentage: Optional[float] = None
    cgpa: Optional[float] = None
    grading_system: Optional[str] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Experience ---
class ExperienceBase(BaseModel):
    job_title: str
    company_name: str
    employment_type: Optional[str] = None
    company_location: Optional[str] = None
    industry: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_working: bool = False
    description: Optional[str] = None
    skills_used: Optional[List[str]] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Projects ---
class ProjectBase(BaseModel):
    name: str
    project_type: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_active: bool = False
    technologies: Optional[List[str]] = None
    responsibilities: Optional[str] = None
    team_size: Optional[int] = None
    project_status: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Student ---
class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    career_status: Optional[str] = None
    profile_headline: Optional[str] = None
    about_me: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    personal_website: Optional[str] = None
    
    preferred_job_roles: Optional[List[str]] = None
    preferred_work_locations: Optional[List[str]] = None
    work_mode: Optional[List[str]] = None
    employment_type: Optional[List[str]] = None
    preferred_industries: Optional[List[str]] = None
    expected_salary_min: Optional[int] = None
    expected_salary_max: Optional[int] = None
    currency: Optional[str] = "USD"
    willing_to_relocate: Optional[bool] = False
    notice_period: Optional[str] = None
    job_search_status: Optional[str] = None

class StudentProfileUpdate(StudentProfileBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: Optional[int] = None
    skill_associations: List[StudentSkillResponse] = []
    education: List[EducationResponse] = []
    experience: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    resumes: List[ResumeResponse] = []
    completion_percentage: Optional[int] = 0
    model_config = {"from_attributes": True}

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    student_profile: Optional[StudentProfileResponse] = None
    recruiter_profile: Optional['RecruiterProfileResponse'] = None
    model_config = {"from_attributes": True}

# --- Recruiter & Tenant ---
class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

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
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    tenant_id: int
    tenant: Optional[TenantResponse] = None
    model_config = {"from_attributes": True}

class RecruiterProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    status: str = "DRAFT"
    department: Optional[str] = None
    category: Optional[str] = None
    responsibilities: Optional[str] = None
    required_qualifications: Optional[str] = None
    preferred_qualifications: Optional[str] = None
    work_mode: Optional[str] = None
    number_of_openings: Optional[int] = None
    minimum_experience: Optional[int] = None
    maximum_experience: Optional[int] = None
    minimum_salary: Optional[int] = None
    maximum_salary: Optional[int] = None
    currency: str = "USD"
    salary_period: Optional[str] = None
    salary_disclosed: bool = True
    minimum_education: Optional[str] = None
    preferred_degree: Optional[str] = None
    preferred_field_of_study: Optional[str] = None
    application_deadline: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    tenant_id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class PublicJobResponse(JobBase):
    id: int
    company_name: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Applications ---
class ApplicationCreate(BaseModel):
    job_id: int

class ApplicationStatusUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None
    job: Optional[JobResponse] = None
    model_config = {"from_attributes": True}

class RecruiterApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    student: Optional[StudentProfileResponse] = None
    match_result: Optional['MatchResultResponse'] = None
    job: Optional[JobResponse] = None
    model_config = {"from_attributes": True}

# --- Match Results ---
class MatchResultResponse(BaseModel):
    id: Optional[int] = None
    student_id: int
    job_id: int
    tenant_id: int
    overall_score: Optional[float] = None
    skill_score: Optional[float] = None
    text_score: Optional[float] = None
    education_score: Optional[float] = None
    experience_score: Optional[float] = None
    project_score: Optional[float] = None
    location_score: Optional[float] = 0.0
    work_mode_score: Optional[float] = 0.0
    salary_score: Optional[float] = 0.0
    is_eligible: Optional[bool] = True
    matched_skills: Optional[str] = None
    missing_skills: Optional[str] = None
    explanation: Optional[str] = None
    job: Optional[JobResponse] = None
    student: Optional[StudentProfileResponse] = None
    
    model_config = {"from_attributes": True}
