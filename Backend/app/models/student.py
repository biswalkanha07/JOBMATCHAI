from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Table, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

student_skill_association = Table(
    'student_skills',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('student_profiles.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)

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
    
    # Preferences
    preferred_job_role = Column(String)
    secondary_job_role = Column(String)
    employment_type = Column(String)
    preferred_location = Column(String)
    work_mode = Column(String)
    expected_salary_min = Column(Integer)
    expected_salary_max = Column(Integer)
    currency = Column(String, default="USD")
    willing_to_relocate = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="student_profile")
    education = relationship("Education", back_populates="student", cascade="all, delete-orphan")
    experience = relationship("Experience", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    resume = relationship("Resume", back_populates="student", uselist=False, cascade="all, delete-orphan")
    skills = relationship("Skill", secondary=student_skill_association, back_populates="students")
    applications = relationship("Application", back_populates="student")

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    location = Column(String)
    start_year = Column(Integer)
    graduation_year = Column(Integer)
    grade_or_cgpa = Column(String)
    description = Column(String)
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
    location = Column(String)
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="projects")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), unique=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    student = relationship("StudentProfile", back_populates="resume")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    students = relationship("StudentProfile", secondary=student_skill_association, back_populates="skills")
