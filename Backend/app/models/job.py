from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db.database import Base

job_skill_association = Table(
    'job_skills',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('jobs.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True),
    Column('skill_type', String, nullable=False) # 'REQUIRED' or 'PREFERRED'
)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    title = Column(String, nullable=False)
    department = Column(String)
    category = Column(String)
    
    description = Column(String)
    responsibilities = Column(String)
    required_qualifications = Column(String)
    preferred_qualifications = Column(String)
    
    location = Column(String)
    employment_type = Column(String)
    work_mode = Column(String)
    
    number_of_openings = Column(Integer)
    minimum_experience = Column(Integer)
    maximum_experience = Column(Integer)
    
    minimum_salary = Column(Integer)
    maximum_salary = Column(Integer)
    currency = Column(String, default="USD")
    salary_period = Column(String) # HOURLY, MONTHLY, YEARLY
    salary_disclosed = Column(Boolean, default=True)
    
    minimum_education = Column(String)
    preferred_degree = Column(String)
    preferred_field_of_study = Column(String)
    
    application_deadline = Column(DateTime(timezone=True))
    status = Column(String, default="DRAFT", index=True) # DRAFT, PUBLISHED, UNPUBLISHED, CLOSED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))
    
    embedding = Column(Vector(384), nullable=True)

    tenant = relationship("Tenant", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
    skills = relationship("Skill", secondary=job_skill_association)
    matches = relationship("MatchResult", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True)
    match_result_id = Column(Integer, ForeignKey("match_results.id"), nullable=True)
    status = Column(String, default="APPLIED") # APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    match_result = relationship("MatchResult")

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), index=True)
    
    overall_score = Column(Float)
    skill_score = Column(Float)
    text_score = Column(Float)
    education_score = Column(Float)
    experience_score = Column(Float)
    project_score = Column(Float)
    location_score = Column(Float, default=0.0)
    work_mode_score = Column(Float, default=0.0)
    salary_score = Column(Float, default=0.0)
    is_eligible = Column(Boolean, default=True)
    
    matched_skills = Column(String) # Storing as JSON string for now
    missing_skills = Column(String) # Storing as JSON string for now
    explanation = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    job = relationship("Job", back_populates="matches")
