# JobMatch AI Backend Foundation

This directory contains the production-ready multi-tenant SaaS backend for JobMatch AI built with FastAPI, SQLAlchemy, and PostgreSQL.

## Features Implemented
- **Multi-Tenant Architecture:** Full tenant isolation for Recruiter Workspaces.
- **JWT Authentication:** Argon2 password hashing and secure bearer tokens.
- **Role-Based Authorization:** Strictly divided `STUDENT` and `RECRUITER` roles.
- **Student Global Context:** Students can discover `PUBLISHED` jobs across all recruiter tenants.
- **Tenant Authorization:** Recruiter endpoints automatically scope queries to the authenticated user's `tenant_id`.
- **Core Models:** Users, Tenants, Companies, Profiles, Jobs, Applications, MatchResults.

## Setup Instructions

### 1. Configure Environment
A `.env.example` file is provided. Create your own `.env` file in the `Backend/` directory with your actual PostgreSQL credentials. 

```env
DATABASE_URL=postgresql+psycopg2://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB
SECRET_KEY=your_secure_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 2. Install Dependencies
```bash
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Database Migrations
Run Alembic to create the initial database schema (requires valid `DATABASE_URL` in `.env`):
```bash
alembic upgrade head
```

### 4. Seed Data
Populate the database with initial skills, students, and two separate Recruiter tenants:
```bash
python scripts/seed.py
```

### 5. Run Server
```bash
uvicorn app.main:app --reload
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 6. Run Tests
The test suite uses an in-memory SQLite database to verify Tenant Isolation and JWT authorization independently of your PostgreSQL setup.
```bash
python -m pytest -v tests/
```
