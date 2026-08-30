# 🚀 JobMatch AI

> **AI-powered job matching platform that intelligently connects students with relevant job opportunities and helps recruiters identify the most suitable candidates.**

<p align="center">
  <img src="https://img.shields.io/badge/AI-Job%20Matching-7C3AED?style=for-the-badge" alt="AI Job Matching">
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/pgvector-Semantic%20Search-FF6B35?style=for-the-badge" alt="pgvector">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SentenceTransformers-Semantic%20AI-FFB000?style=flat-square" alt="Sentence Transformers">
  <img src="https://img.shields.io/badge/Testing-Pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white" alt="Pytest">
  <img src="https://img.shields.io/badge/Frontend-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-22C55E?style=flat-square" alt="Status">
</p>

---

## 📌 Overview

**JobMatch AI** is a full-stack AI-powered recruitment and job-matching platform designed to connect students/job seekers with relevant opportunities while giving recruiters intelligent candidate insights.

The platform analyzes candidate profiles and job requirements using a combination of:

* 🧠 Semantic similarity
* 🎯 Deterministic profile matching
* 🛠️ Skill comparison
* 🎓 Education matching
* 💼 Experience matching
* 📁 Project relevance
* 📍 Location matching
* 🏢 Work-mode compatibility
* 💰 Salary compatibility
* ✅ Eligibility checks

The result is a transparent and explainable **0–100% job/candidate match score**.

---

# ✨ Key Features

## 👨‍🎓 Student Features

### 🔐 Authentication

* Student registration
* Secure login
* Authentication and authorization
* Protected student routes

### 👤 Profile Management

Students can maintain:

* Personal information
* Education
* Skills
* Experience
* Projects
* Preferred job roles
* Preferred locations
* Work-mode preferences
* Salary expectations

### 🧠 AI Profile Analysis

The system analyzes the student's profile and creates a structured representation used by the recommendation engine.

### 🎯 Personalized Job Recommendations

Jobs are dynamically ranked according to the student's profile.

Example:

```text
┌─────────────────────────────────────┐
│ AI Engineer                         │
│                                     │
│        ⭐ 92% MATCH                 │
│                                     │
│ ✓ Python                            │
│ ✓ Machine Learning                  │
│ ✓ SQL                               │
│ ⚠ TensorFlow                       │
│ ⚠ Deep Learning                     │
│                                     │
│ [ View Details ]                    │
└─────────────────────────────────────┘
```

### 📊 Explainable Matching

Instead of showing only a percentage, JobMatch AI explains **why** a job matches.

Example:

```text
92% Profile Match

✓ Strong Python match
✓ Machine Learning experience
✓ Relevant ML project
✓ Preferred role match
✓ Location compatible
✓ Work mode compatible

⚠ TensorFlow missing
⚠ Deep Learning missing
```

### 🔎 Complete Job Details

Students can see recruiter-provided job information including:

* Job title
* Company
* Department
* Description
* Responsibilities
* Required skills
* Preferred skills
* Education requirements
* Experience range
* Salary range
* Location
* Work mode
* Employment type
* Other available job information

### 📝 Job Applications

Students can:

* Apply for jobs
* View applications
* Track application status
* Save jobs where supported

---

# 🧑‍💼 Recruiter Features

## 🏢 Job Creation

Recruiters can create jobs with detailed requirements:

```text
Job Title
Department
Description
Responsibilities
Required Skills
Preferred Skills
Education
Minimum Experience
Maximum Experience
Minimum Salary
Maximum Salary
Location
Work Mode
Employment Type
```

## 👥 Applicant Management

Recruiters can view applicants for each job.

Example:

```text
AI Engineer

Applicants: 12

┌──────────────────────────────────┐
│ Pritam                           │
│                                  │
│ ⭐ 92% Profile Match             │
│                                  │
│ ✓ Python                         │
│ ✓ Machine Learning               │
│ ✓ SQL                            │
│ ⚠ TensorFlow                    │
│                                  │
│ ✓ Eligible                       │
│                                  │
│ [ View Profile ]                 │
└──────────────────────────────────┘
```

## 📈 Candidate Match Analysis

Recruiters can see:

* Overall match percentage
* Semantic match
* Skills match
* Experience match
* Education match
* Project relevance
* Location compatibility
* Work-mode compatibility
* Salary compatibility
* Matched skills
* Missing skills
* Eligibility

---

# 📸 Application Match Snapshot

One of the key features of JobMatch AI is the **application-time match snapshot**.

When a student applies:

```text
Student Profile
      +
Specific Job
      ↓
Matching Engine
      ↓
Match Calculation
      ↓
Snapshot Saved
      ↓
Application
```

For example:

```text
Pritam applies for AI Engineer

Application Match:
92%
```

If the student later changes their profile, the recruiter can still see the **original application-time match**.

This preserves historical recruitment context.

---

# 🧠 Recommendation Engine

JobMatch AI uses a hybrid recommendation architecture.

```text
                 STUDENT PROFILE
                       │
                       ▼
              PROFILE ANALYSIS
                       │
                       ▼
              PROFILE NORMALIZATION
                       │
                       ▼
               ELIGIBILITY CHECK
                       │
                       ▼
                  JOB DATA
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Semantic Matching    Deterministic Matching
             │                   │
             ▼                   ▼
         pgvector          Structured Rules
             │                   │
             └─────────┬─────────┘
                       ▼
                 MATCH SCORE
                       │
                       ▼
             EXPLANATION + INSIGHTS
                       │
                       ▼
                RANKED RESULTS
```

---

# 📊 Match Scoring

The current scoring architecture combines semantic and deterministic signals.

| Component           |   Weight |
| ------------------- | -------: |
| 🧠 Semantic Match   |  **25%** |
| 🛠️ Skills Match    |  **30%** |
| 💼 Experience Match |  **15%** |
| 🎓 Education Match  |  **10%** |
| 📍 Location Match   |  **10%** |
| 🏢 Work Mode Match  |   **5%** |
| 💰 Salary Match     |   **5%** |
| **Total**           | **100%** |

> The scoring weights are centralized and configurable.

---

# 🧩 Skill Matching

JobMatch AI normalizes common skill variations.

For example:

```text
ML
Machine Learning
machine-learning
MachineLearning
```

can be normalized into the same skill concept where appropriate.

Similarly:

```text
JS
JavaScript
Javascript
```

are normalized consistently.

The system avoids unsafe equivalences such as:

```text
Java ≠ JavaScript
```

---

# 🎯 Eligibility Engine

Eligibility is evaluated separately from recommendation scoring.

Example:

```text
Student:
Fresher

Job:
0–2 Years

Result:
✅ Eligible
```

But:

```text
Student:
Fresher

Job:
5+ Years Required

Result:
❌ Not Eligible
```

This prevents a candidate from receiving a misleading high recommendation simply because they possess some matching skills.

---

# 🔍 Matched & Missing Skills

For each recommendation/application, the system can identify:

### Matched

```text
✓ Python
✓ Machine Learning
✓ SQL
✓ Scikit-learn
```

### Missing

```text
⚠ TensorFlow
⚠ Deep Learning
```

This makes the recommendation actionable for students and useful for recruiters.

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Modern component-based UI
* Responsive design

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Alembic

## Database

* PostgreSQL
* pgvector

## AI / ML

* SentenceTransformers
* `all-MiniLM-L6-v2`
* Vector embeddings
* Cosine similarity
* Hybrid semantic + deterministic matching

## Testing

* Pytest
* Frontend test tooling
* API testing
* Build validation
* E2E validation where configured

---

# 📁 Project Structure

> The exact structure may vary depending on the current implementation.

```text
JobmatchAi/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── job.py
│   │   │   ├── user.py
│   │   │   └── ...
│   │   │
│   │   ├── schemas/
│   │   │   └── core.py
│   │   │
│   │   ├── services/
│   │   │   └── matching_service.py
│   │   │
│   │   ├── api/
│   │   │   └── ...
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── student/
│   │   │   └── recruiter/
│   │   └── ...
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## 1️⃣ Prerequisites

Install the following:

| Software   | Recommended                     |
| ---------- | ------------------------------- |
| Python     | 3.11+                           |
| Node.js    | 18+                             |
| npm        | 9+                              |
| PostgreSQL | 14+                             |
| Git        | Latest                          |
| pgvector   | Compatible PostgreSQL extension |

Verify:

```bash
python --version
node --version
npm --version
psql --version
git --version
```

---

# 📥 Clone Repository

```bash
git clone https://github.com/6Pritam/JobmatchAi.git
cd JobmatchAi
```

> Replace the repository URL if your repository location is different.

---

# 🐍 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄️ PostgreSQL Setup

Create a PostgreSQL database.

Example:

```sql
CREATE DATABASE jobmatch_ai;
```

Enable pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Verify:

```sql
SELECT extname FROM pg_extension;
```

You should see:

```text
vector
```

---

# 🔐 Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobmatch_ai

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

CORS_ORIGINS=http://localhost:5173
```

> Never commit real passwords, secret keys, API keys, or production credentials.

Add `.env` to `.gitignore`.

---

# 🗃️ Database Migration

If the project uses Alembic:

```bash
alembic upgrade head
```

Check the migration state:

```bash
alembic current
```

---

# 🚀 Start Backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

# ⚛️ Frontend Setup

Open a new terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Frontend Environment

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Use the actual environment variable expected by the project if it differs.

---

# ▶️ Start Frontend

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🧪 Running Tests

## Backend

From the backend directory:

```bash
pytest
```

Verbose:

```bash
pytest -v
```

Run a specific test:

```bash
pytest tests/test_matching.py -v
```

---

## Frontend

Check the available scripts:

```bash
npm run
```

Then run the project's configured test command, for example:

```bash
npm test
```

or:

```bash
npm run test
```

---

# 🔎 Code Quality

Run backend checks configured by the project.

Examples:

```bash
ruff check .
```

```bash
mypy .
```

For frontend:

```bash
npm run lint
```

```bash
npm run build
```

---

# 🏗️ Production Build

Build the frontend:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# 🔄 Development Workflow

Recommended development flow:

```text
1. Clone repository
        ↓
2. Configure PostgreSQL
        ↓
3. Enable pgvector
        ↓
4. Configure backend .env
        ↓
5. Run migrations
        ↓
6. Start FastAPI
        ↓
7. Install frontend dependencies
        ↓
8. Configure frontend .env
        ↓
9. Start Vite
        ↓
10. Open application
```

---

# 🧪 End-to-End Testing

A complete recommendation flow should look like:

```text
┌──────────────────────┐
│ Recruiter Creates Job│
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Job Requirements     │
│ Skills               │
│ Salary               │
│ Experience           │
│ Location             │
│ Work Mode            │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Student Profile      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Eligibility Check    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Matching Engine      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Match Percentage     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Student Applies      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Match Snapshot Saved │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Recruiter Reviews    │
│ Applicant             │
└──────────────────────┘
```

---

# 📊 Example Match Result

```text
╔══════════════════════════════════════╗
║          AI ENGINEER                 ║
╠══════════════════════════════════════╣
║                                      ║
║          ⭐ 92% MATCH                 ║
║                                      ║
║ Skills              91%              ║
║ Experience         100%              ║
║ Education           90%              ║
║ Projects            95%              ║
║ Location           100%              ║
║ Work Mode          100%              ║
║ Salary              80%              ║
║                                      ║
║ ✓ Python                             ║
║ ✓ Machine Learning                   ║
║ ✓ SQL                                ║
║                                      ║
║ ⚠ TensorFlow                        ║
║ ⚠ Deep Learning                      ║
║                                      ║
║ ✅ Eligible                          ║
╚══════════════════════════════════════╝
```

> Example values above are illustrative only. The application calculates real scores dynamically.

---

# 🔌 API Documentation

Once the backend is running, open:

```text
/docs
```

FastAPI automatically provides interactive Swagger documentation.

You can use it to:

* Explore endpoints
* Authenticate
* Create jobs
* Retrieve jobs
* Test applications
* Inspect recommendation responses
* Validate API schemas

---

# 🔒 Security

JobMatch AI follows application-level security practices including:

* Authentication
* Authorization
* Protected routes
* Tenant/user isolation
* Input validation
* Database-backed permissions
* No exposure of unrelated student profiles
* No hardcoded production credentials

### Environment Security

Never commit:

```text
.env
API keys
database passwords
secret keys
JWT secrets
production credentials
```

---

# 🧠 Why Hybrid Matching?

A pure keyword system can miss context.

For example:

```text
Machine Learning Engineer
```

and:

```text
AI/ML Engineer
```

may be semantically related even when the wording differs.

JobMatch AI combines:

```text
Semantic Understanding
        +
Structured Requirements
        +
Eligibility Rules
        +
Weighted Scoring
```

This provides better matching while keeping the final result understandable.

---

# 🏆 Advantages

### For Students

✅ Personalized job recommendations
✅ Transparent match percentages
✅ Matched skills
✅ Missing skills
✅ Eligibility insights
✅ Complete job information
✅ Better understanding of skill gaps

### For Recruiters

✅ Applicant match percentage
✅ Candidate-job comparison
✅ Matched skills
✅ Missing skills
✅ Eligibility visibility
✅ Historical application match snapshot
✅ Faster candidate screening

---

# 🧪 Quality Assurance

The project includes validation for:

```text
✓ Skill matching
✓ Skill normalization
✓ Experience matching
✓ Education matching
✓ Project relevance
✓ Role relevance
✓ Location matching
✓ Work-mode matching
✓ Salary compatibility
✓ Eligibility
✓ Match percentage
✓ Recommendation ranking
✓ Application snapshots
✓ Authentication
✓ Authorization
✓ Tenant isolation
✓ API behavior
✓ Production frontend build
```

---

# 🚀 Future Improvements

Potential future enhancements:

* 🤖 Advanced personalized ranking
* 📈 Recommendation feedback loops
* 📊 Recruiter analytics
* 🔔 Job recommendation notifications
* 🧠 Improved semantic models
* 🗺️ Geographic distance-based matching
* 📱 Mobile application
* 📧 Personalized job alerts
* 📚 Skill-gap learning recommendations
* 📈 Recommendation performance analytics

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git fork
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Follow the existing project architecture.

### 4. Run tests

```bash
pytest
```

and:

```bash
npm run build
```

### 5. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

### 6. Push

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

---

# 🐛 Troubleshooting

## PostgreSQL connection error

Check:

```text
PostgreSQL is running
DATABASE_URL is correct
Database exists
Username/password are correct
Port is correct
```

Default PostgreSQL port:

```text
5432
```

---

## pgvector error

Ensure the extension is installed and enabled:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Backend won't start

Try:

```bash
pip install -r requirements.txt
```

Then:

```bash
uvicorn app.main:app --reload
```

Check the terminal traceback for the exact configuration error.

---

## Frontend won't start

Try:

```bash
rm -rf node_modules
npm install
npm run dev
```

On Windows PowerShell, remove `node_modules` using:

```powershell
Remove-Item -Recurse -Force node_modules
```

Then:

```bash
npm install
npm run dev
```

---

## API connection problem

Check the frontend environment configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Also confirm that FastAPI is running.

---

# 📜 License

Add your preferred license here.

Example:

```text
MIT License
```

---

# 👨‍💻 Author

**Pritam**

Built as an AI-powered recruitment and job-matching platform.

---

# ⭐ Support

If you find this project useful:

⭐ Star the repository
🍴 Fork it
🐛 Report issues
💡 Suggest improvements
🤝 Contribute

---

<p align="center">

### 🚀 JobMatch AI

**Match smarter. Hire better. Build better careers.**

</p>
