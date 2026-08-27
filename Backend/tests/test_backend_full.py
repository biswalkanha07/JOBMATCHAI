import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Override to use SQLite for tests
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test_secret_key"
os.environ["JWT_ALGORITHM"] = "HS256"

from app.main import app
from app.db.database import Base, get_db

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
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

def test_health_endpoints(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200

def test_student_registration_and_login(client):
    res = client.post(
        "/api/v1/auth/register/student",
        json={
            "email": "student1@test.com",
            "password": "password",
            "first_name": "Test",
            "last_name": "Student",
            "phone": "1234567890",
            "location": "NY"
        }
    )
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["email"] == "student1@test.com"
    assert user_data["role"] == "STUDENT"
    assert "password_hash" not in user_data
    
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "student1@test.com", "password": "password"}
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_recruiter_tenant_isolation(client):
    # Recruiter A
    client.post("/api/v1/auth/register/recruiter", json={
        "email": "a@test.com", "password": "password", 
        "first_name": "A", "last_name": "A", "company_name": "Company A"
    })
    token_a = client.post("/api/v1/auth/login", json={"email": "a@test.com", "password": "password"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Recruiter B
    client.post("/api/v1/auth/register/recruiter", json={
        "email": "b@test.com", "password": "password", 
        "first_name": "B", "last_name": "B", "company_name": "Company B"
    })
    token_b = client.post("/api/v1/auth/login", json={"email": "b@test.com", "password": "password"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Job A
    res = client.post("/api/v1/recruiter/jobs/", json={"title": "Job A"}, headers=headers_a)
    assert res.status_code == 200
    job_a_id = res.json()["id"]
    
    # Job B
    res = client.post("/api/v1/recruiter/jobs/", json={"title": "Job B"}, headers=headers_b)
    job_b_id = res.json()["id"]

    # Verify A cannot see B's job
    res = client.get(f"/api/v1/recruiter/jobs/{job_b_id}", headers=headers_a)
    assert res.status_code == 404
    
def test_public_jobs_discovery(client):
    # Recruiter creates one PUBLISHED job and one DRAFT
    client.post("/api/v1/auth/register/recruiter", json={
        "email": "c@test.com", "password": "password", 
        "first_name": "C", "last_name": "C", "company_name": "Company C"
    })
    token = client.post("/api/v1/auth/login", json={"email": "c@test.com", "password": "password"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/api/v1/recruiter/jobs/", json={"title": "Published Job", "status": "PUBLISHED"}, headers=headers)
    client.post("/api/v1/recruiter/jobs/", json={"title": "Draft Job", "status": "DRAFT"}, headers=headers)
    
    # Unauthenticated user lists public jobs
    res = client.get("/api/v1/public/jobs/")
    assert res.status_code == 200
    jobs = res.json()
    assert any(j["title"] == "Published Job" for j in jobs)
    assert not any(j["title"] == "Draft Job" for j in jobs)

def test_student_cannot_access_recruiter_endpoints(client):
    client.post("/api/v1/auth/register/student", json={
        "email": "student2@test.com", "password": "password",
        "first_name": "Test", "last_name": "Student"
    })
    token = client.post("/api/v1/auth/login", json={"email": "student2@test.com", "password": "password"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/recruiter/jobs/", headers=headers)
    assert res.status_code == 403
