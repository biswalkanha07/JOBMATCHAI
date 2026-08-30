import pytest
from app.models.student import StudentProfile
from app.models.job import Job
from app.services.embedding_service import embedding_service
import numpy as np

def test_embedding_generation_student():
    student = StudentProfile(preferred_job_roles=["Software Engineer"], about_me="I love coding.")
    skills = ["Python", "SQL"]
    education = ["BSc Computer Science at MIT"]
    experience = ["Intern at Google"]
    projects = ["Personal Website"]
    
    embedding = embedding_service.generate_student_embedding(student, skills, education, experience, projects)
    
    assert embedding is not None
    assert isinstance(embedding, list)
    assert len(embedding) == 384
    
    # Check if empty generates None
    empty_student = StudentProfile()
    empty_emb = embedding_service.generate_student_embedding(empty_student, [], [], [], [])
    assert empty_emb is None

def test_embedding_generation_job():
    job = Job(title="Data Scientist", description="Looking for a data scientist.", required_qualifications="Python, SQL")
    required = ["Python", "SQL"]
    preferred = ["AWS"]
    
    embedding = embedding_service.generate_job_embedding(job, required, preferred)
    
    assert embedding is not None
    assert isinstance(embedding, list)
    assert len(embedding) == 384

def test_embedding_distance():
    text1 = "Backend Developer specializing in Python and PostgreSQL"
    text2 = "Looking for a Python Backend Engineer with database experience"
    text3 = "Nurse with 5 years experience in pediatric care"
    
    emb1 = embedding_service.generate_embedding(text1)
    emb2 = embedding_service.generate_embedding(text2)
    emb3 = embedding_service.generate_embedding(text3)
    
    assert emb1 is not None and emb2 is not None and emb3 is not None
    
    # Calculate cosine similarity (1 - cosine distance)
    # Since embeddings from sentence-transformers are usually normalized, dot product is equivalent to cosine similarity
    v1 = np.array(emb1)
    v2 = np.array(emb2)
    v3 = np.array(emb3)
    
    # normalize
    v1 = v1 / np.linalg.norm(v1)
    v2 = v2 / np.linalg.norm(v2)
    v3 = v3 / np.linalg.norm(v3)
    
    sim_1_2 = np.dot(v1, v2)
    sim_1_3 = np.dot(v1, v3)
    
    # Backend Dev should be closer to Backend Engineer job than to Nurse
    assert sim_1_2 > sim_1_3
