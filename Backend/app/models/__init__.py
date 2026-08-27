from app.db.database import Base
from app.models.user import User
from app.models.tenant import Tenant
from app.models.recruiter import RecruiterProfile, Company
from app.models.student import StudentProfile, Education, Experience, Project, Resume, Skill, student_skill_association
from app.models.job import Job, Application, MatchResult, job_skill_association
