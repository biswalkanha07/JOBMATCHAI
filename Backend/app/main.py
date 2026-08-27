from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes import auth, public_jobs, students, recruiter_jobs

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(public_jobs.router, prefix=f"{settings.API_V1_STR}/public/jobs", tags=["public"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["students"])
app.include_router(recruiter_jobs.router, prefix=f"{settings.API_V1_STR}/recruiter/jobs", tags=["recruiter_jobs"])

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db

@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
def health_check():
    return {"status": "ok"}

@app.get(f"{settings.API_V1_STR}/health/db", tags=["health"])
def health_check_db(db: Session = Depends(get_db)):
    try:
        # Execute a simple query to ensure the connection is valid
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")
