import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Set environment variables for testing before loading app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test_secret_key"
os.environ["JWT_ALGORITHM"] = "HS256"

from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_password_hash

# Setup in-memory SQLite for testing
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

@pytest.fixture
def student_token_headers(client, db):
    # Register a student
    client.post(
        "/api/v1/auth/register/student",
        json={
            "email": "student@test.com",
            "password": "password",
            "first_name": "Test",
            "last_name": "Student"
        }
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.com", "password": "password"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def recruiter_token_headers(client, db):
    client.post(
        "/api/v1/auth/register/recruiter",
        json={
            "email": "recruiter@test.com",
            "password": "password",
            "first_name": "Test",
            "last_name": "Recruiter",
            "company_name": "Test Company"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "recruiter@test.com", "password": "password"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
