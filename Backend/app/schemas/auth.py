from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    role: Optional[str] = None

class LoginData(BaseModel):
    email: EmailStr
    password: str

class StudentRegistration(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    preferred_job_role: Optional[str] = None
    location: Optional[str] = None

class RecruiterRegistration(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    company_name: str
    company_website: Optional[str] = None
