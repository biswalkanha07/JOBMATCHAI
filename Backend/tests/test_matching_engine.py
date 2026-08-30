import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from app.models.tenant import Tenant
from app.models.recruiter import RecruiterProfile
from app.models.student import StudentProfile, Skill, StudentSkill, Education, Experience, Project
from app.models.job import Job, MatchResult
from app.models.user import User
from app.services.embedding_service import embedding_service
import os
import random

# Use the real PostgreSQL DB so pgvector works
engine = create_engine("postgresql+psycopg2://postgres:Kanha%402025@127.0.0.1:5432/jobmatch")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

def test_deterministic_scoring(db):
    # identical student + identical job data must produce identical scores
    
    tenant = Tenant(name="Test Tenant", slug="test-tenant")
    db.add(tenant)
    db.commit()
    
    job1 = Job(
        tenant_id=tenant.id, title="Software Engineer", status="PUBLISHED",
        description="Looking for Python backend developer", required_qualifications="Python",
        minimum_experience=2
    )
    job2 = Job(
        tenant_id=tenant.id, title="Software Engineer", status="PUBLISHED",
        description="Looking for Python backend developer", required_qualifications="Python",
        minimum_experience=2
    )
    
    emb = embedding_service.generate_job_embedding(job1, ["Python"], [])
    job1.embedding = emb
    job2.embedding = emb
    
    db.add_all([job1, job2])
    db.commit()
    
    student1 = StudentProfile(first_name="Alice", last_name="A", about_me="I am a Python developer")
    student2 = StudentProfile(first_name="Alice", last_name="A", about_me="I am a Python developer")
    
    student_emb = embedding_service.generate_student_embedding(student1, ["Python"], [], [], [])
    student1.embedding = student_emb
    student2.embedding = student_emb
    
    db.add_all([student1, student2])
    db.commit()
    
    from app.services.matching_service import matching_service
    
    # Check student to job matching
    matches_s1 = matching_service.match_student_to_jobs(db, student1)
    matches_s2 = matching_service.match_student_to_jobs(db, student2)
    
    score_s1_j1 = next((m.overall_score for m in matches_s1 if m.job_id == job1.id), None)
    score_s2_j1 = next((m.overall_score for m in matches_s2 if m.job_id == job1.id), None)
    score_s1_j2 = next((m.overall_score for m in matches_s1 if m.job_id == job2.id), None)
    
    assert score_s1_j1 is not None
    assert score_s1_j1 == score_s2_j1
    assert score_s1_j1 == score_s1_j2

def test_tenant_isolation(db):
    tenantA = Tenant(name="Tenant A", slug="tenant-a")
    tenantB = Tenant(name="Tenant B", slug="tenant-b")
    db.add_all([tenantA, tenantB])
    db.commit()
    
    jobA = Job(tenant_id=tenantA.id, title="Job A", status="PUBLISHED")
    jobA.embedding = embedding_service.generate_job_embedding(jobA, [], [])
    jobB = Job(tenant_id=tenantB.id, title="Job B", status="PUBLISHED")
    jobB.embedding = embedding_service.generate_job_embedding(jobB, [], [])
    db.add_all([jobA, jobB])
    db.commit()
    
    student = StudentProfile(first_name="Bob", last_name="B", about_me="A great student.")
    student.embedding = embedding_service.generate_student_embedding(student, [], [], [], [])
    db.add(student)
    db.commit()
    
    from app.services.matching_service import matching_service
    
    # Match job to students for Recruiter A (tenantA)
    matchesA = matching_service.match_job_to_students(db, jobA, tenantA.id)
    assert len(matchesA) > 0
    assert matchesA[0].tenant_id == tenantA.id
    
    # Verify Recruiter A's match result does not leak to Tenant B
    for match in matchesA:
        assert match.tenant_id == tenantA.id
        
def test_positive_and_negative_matching(db):
    # Setup
    tenant = Tenant(name="Test Tenant 2", slug="test-tenant-2")
    db.add(tenant)
    db.commit()
    
    job_python = Job(
        tenant_id=tenant.id, title="Python Dev", status="PUBLISHED",
        description="Backend python developer", required_qualifications="Python",
        minimum_experience=2
    )
    job_python.embedding = embedding_service.generate_job_embedding(job_python, ["Python"], [])
    db.add(job_python)
    db.commit()
    
    student_python = StudentProfile(first_name="Py", last_name="Dev", about_me="Python developer")
    student_python.embedding = embedding_service.generate_student_embedding(student_python, ["Python"], [], [], [])
    
    student_nurse = StudentProfile(first_name="Nur", last_name="Se", about_me="Pediatric nurse")
    student_nurse.embedding = embedding_service.generate_student_embedding(student_nurse, ["Nursing"], [], [], [])
    
    db.add_all([student_python, student_nurse])
    db.commit()
    
    from app.services.matching_service import matching_service
    
    matches = matching_service.match_job_to_students(db, job_python, tenant.id)
    
    score_py = next((m.overall_score for m in matches if m.student_id == student_python.id), 0)
    score_nurse = next((m.overall_score for m in matches if m.student_id == student_nurse.id), 0)
    
    assert score_py > score_nurse

def test_edge_cases(db):
    tenant = Tenant(name="Edge Tenant", slug="edge-tenant")
    db.add(tenant)
    db.commit()
    
    # Draft job
    job_draft = Job(
        tenant_id=tenant.id, title="Draft Job", status="DRAFT"
    )
    job_draft.embedding = embedding_service.generate_job_embedding(job_draft, [], [])
    
    # Missing embedding student
    student_missing = StudentProfile(first_name="No", last_name="Emb")
    
    db.add_all([job_draft, student_missing])
    db.commit()
    
    from app.services.matching_service import matching_service
    
    # Student matching should not find DRAFT jobs
    # We must give student an embedding to test job filtering
    student_has_emb = StudentProfile(first_name="Yes", last_name="Emb")
    student_has_emb.embedding = embedding_service.generate_student_embedding(student_has_emb, [], [], [], [])
    db.add(student_has_emb)
    db.commit()
    
    matches_for_student = matching_service.match_student_to_jobs(db, student_has_emb)
    draft_match = next((m for m in matches_for_student if m.job_id == job_draft.id), None)
    assert draft_match is None # DRAFT job should not be recommended
    
    # Student with no embedding should return empty
    matches_no_emb = matching_service.match_student_to_jobs(db, student_missing)
    assert len(matches_no_emb) == 0
