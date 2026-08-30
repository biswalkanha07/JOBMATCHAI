from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Table, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db.database import Base

class StudentSkill(Base):
    __tablename__ = "student_skills"
    student_id = Column(Integer, ForeignKey('student_profiles.id', ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True)
    proficiency = Column(String)
    years_of_experience = Column(Float)
    last_used = Column(Integer)
    priority = Column(String)
    
    skill = relationship("Skill")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    date_of_birth = Column(Date)
    profile_picture = Column(String)
    location = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    about_me = Column(String)
    
    # New fields matching DB
    gender = Column(String)
    career_status = Column(String)
    profile_headline = Column(String)
    linkedin_url = Column(String)
    github_url = Column(String)
    portfolio_url = Column(String)
    personal_website = Column(String)
    
    # Preferences matching DB
    preferred_job_roles = Column(JSON)
    preferred_work_locations = Column(JSON)
    preferred_industries = Column(JSON)
    notice_period = Column(String)
    job_search_status = Column(String)
    
    employment_type = Column(JSON)
    work_mode = Column(JSON)
    expected_salary_min = Column(Integer)
    expected_salary_max = Column(Integer)
    currency = Column(String, default="USD")
    willing_to_relocate = Column(Boolean, default=False)
    
    embedding = Column(Vector(384), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="student_profile")
    education = relationship("Education", back_populates="student", cascade="all, delete-orphan")
    experience = relationship("Experience", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")
    skills = relationship("Skill", secondary="student_skills", back_populates="students")
    skill_associations = relationship("StudentSkill", cascade="all, delete-orphan", overlaps="skills,students")
    applications = relationship("Application", back_populates="student")

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    degree = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    location = Column(String)
    description = Column(String)
    
    # Matching DB columns
    education_level = Column(String)
    specialization = Column(String)
    university_or_board = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    currently_studying = Column(Boolean, default=False)
    percentage = Column(Float)
    cgpa = Column(Float)
    grading_system = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="education")

class Experience(Base):
    __tablename__ = "experience"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    job_title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    employment_type = Column(String)
    company_location = Column(String)
    industry = Column(String)
    skills_used = Column(JSON)
    start_date = Column(Date)
    end_date = Column(Date)
    currently_working = Column(Boolean, default=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="experience")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    role = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    project_url = Column(String)
    github_url = Column(String)
    live_demo_url = Column(String)
    
    # Matching DB columns
    project_type = Column(String)
    currently_active = Column(Boolean, default=False)
    technologies = Column(JSON)
    responsibilities = Column(String)
    team_size = Column(Integer)
    project_status = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="projects")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    version = Column(Integer)
    is_primary = Column(Boolean, default=False)
    visibility = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="resumes")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    students = relationship("StudentProfile", secondary="student_skills", back_populates="skills")
