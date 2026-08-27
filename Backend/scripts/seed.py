import os
import sys

# Ensure app is in path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.database import engine, Base
from app.models.user import User
from app.models.recruiter import RecruiterProfile, Company
from app.models.tenant import Tenant
from app.models.student import StudentProfile, Skill, student_skill_association
from app.models.job import Job
from app.core.security import get_password_hash
import uuid

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        print("Seeding skills...")
        skills = [
            Skill(name="Python", category="Language"),
            Skill(name="React", category="Frontend"),
            Skill(name="FastAPI", category="Backend"),
            Skill(name="SQLAlchemy", category="Database"),
            Skill(name="PostgreSQL", category="Database"),
        ]
        db.add_all(skills)
        db.commit()

        print("Seeding Student...")
        student_user = User(
            email="student@example.com",
            password_hash=get_password_hash("password123"),
            role="STUDENT"
        )
        db.add(student_user)
        db.flush()

        student_profile = StudentProfile(
            user_id=student_user.id,
            first_name="Alice",
            last_name="Johnson",
            preferred_job_role="Software Engineer"
        )
        db.add(student_profile)
        db.commit()

        print("Seeding Tenant A (TechCorp)...")
        recruiter_a_user = User(
            email="recruiterA@techcorp.com",
            password_hash=get_password_hash("password123"),
            role="RECRUITER"
        )
        db.add(recruiter_a_user)
        db.flush()

        tenant_a = Tenant(
            name="TechCorp Workspace",
            slug=str(uuid.uuid4())[:8],
            created_by=recruiter_a_user.id
        )
        db.add(tenant_a)
        db.flush()

        company_a = Company(tenant_id=tenant_a.id, name="TechCorp")
        db.add(company_a)
        
        recruiter_a_profile = RecruiterProfile(
            user_id=recruiter_a_user.id,
            tenant_id=tenant_a.id,
            first_name="Bob",
            last_name="Smith"
        )
        db.add(recruiter_a_profile)

        job_a1 = Job(
            tenant_id=tenant_a.id,
            recruiter_id=recruiter_a_profile.id,
            title="Senior Python Engineer",
            status="PUBLISHED"
        )
        job_a2 = Job(
            tenant_id=tenant_a.id,
            recruiter_id=recruiter_a_profile.id,
            title="Backend Developer (Draft)",
            status="DRAFT"
        )
        db.add_all([job_a1, job_a2])
        db.commit()

        print("Seeding Tenant B (InnovaSys)...")
        recruiter_b_user = User(
            email="recruiterB@innovasys.com",
            password_hash=get_password_hash("password123"),
            role="RECRUITER"
        )
        db.add(recruiter_b_user)
        db.flush()

        tenant_b = Tenant(
            name="InnovaSys Workspace",
            slug=str(uuid.uuid4())[:8],
            created_by=recruiter_b_user.id
        )
        db.add(tenant_b)
        db.flush()

        company_b = Company(tenant_id=tenant_b.id, name="InnovaSys")
        db.add(company_b)
        
        recruiter_b_profile = RecruiterProfile(
            user_id=recruiter_b_user.id,
            tenant_id=tenant_b.id,
            first_name="Charlie",
            last_name="Brown"
        )
        db.add(recruiter_b_profile)

        job_b1 = Job(
            tenant_id=tenant_b.id,
            recruiter_id=recruiter_b_profile.id,
            title="Frontend React Developer",
            status="PUBLISHED"
        )
        db.add(job_b1)
        db.commit()

        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
