import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { jobsApi, type Job } from '../../api/jobs';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicJobs, setPublicJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await jobsApi.getPublicJobs();
        setPublicJobs(jobs);
      } catch (err) {
        console.error('Failed to fetch public jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="container nav-content">
          <div className="logo">JobMatch AI</div>
          <nav className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#public-jobs">Latest Jobs</a>
          </nav>
          <div className="nav-actions">
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="primary" onClick={() => navigate('/register')}>Register</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <h1>Find the Right Job. <br /> Find the Right Talent.</h1>
              <p>JobMatch AI uses your skills, education, experience, projects, and resume to create highly relevant job and candidate matches powered by AI.</p>
              <div className="hero-buttons">
                <Button size="lg" onClick={() => navigate('/register')}>Find Jobs</Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>Hire Talent</Button>
              </div>
            </div>
            <div className="hero-visual">
              {/* Premium Dashboard Visual Mock */}
              <Card className="visual-card">
                <div className="visual-match">
                  <span className="match-score">94% Match</span>
                  <div className="match-skills">
                    <span className="skill-chip">Python</span>
                    <span className="skill-chip">Machine Learning</span>
                    <span className="skill-chip">Pandas</span>
                    <span className="skill-chip">SQL</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="features-section bg-light">
          <div className="container">
            <h2 className="section-title">Platform Features</h2>
            <div className="features-grid">
              <Card className="feature-card">
                <h3>AI Job Recommendations</h3>
                <p>Get ranked job recommendations based on your full profile.</p>
              </Card>
              <Card className="feature-card">
                <h3>Smart Talent Matching</h3>
                <p>Find the best candidates tailored exactly to job requirements.</p>
              </Card>
              <Card className="feature-card">
                <h3>Resume-Based Matching</h3>
                <p>Deep parsing to align your resume with real opportunities.</p>
              </Card>
              <Card className="feature-card">
                <h3>Explainable Match Scores</h3>
                <p>Understand exactly why a job or candidate is a strong match.</p>
              </Card>
              <Card className="feature-card">
                <h3>Skill Gap Analysis</h3>
                <p>Identify which skills you need to land your dream role.</p>
              </Card>
              <Card className="feature-card">
                <h3>Recruiter Candidate Ranking</h3>
                <p>Sort through applicants instantly based on fit.</p>
              </Card>
            </div>
          </div>
        </section>

        <section id="public-jobs" className="public-jobs-section" style={{ padding: '4rem 0' }}>
          <div className="container">
            <h2 className="section-title">Latest Open Opportunities</h2>
            {loading ? (
              <p>Loading jobs...</p>
            ) : publicJobs.length > 0 ? (
              <div className="features-grid" style={{ marginTop: '2rem' }}>
                {publicJobs.map((job) => (
                  <Card key={job.id} className="feature-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                    <h3>{job.title}</h3>
                    {job.location && <p><strong>Location:</strong> {job.location}</p>}
                    {job.salary_range && <p><strong>Salary:</strong> {job.salary_range}</p>}
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      {job.description ? job.description.substring(0, 100) + '...' : 'No description provided.'}
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                      <Button variant="outline" size="sm">Apply Now</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No published jobs available yet.</p>
            )}
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section bg-light">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <div className="workflow-grid">
              <div className="workflow-column">
                <h3>For Students</h3>
                <ol className="workflow-list">
                  <li>Build Profile</li>
                  <li>Upload Resume</li>
                  <li>Get Recommendations</li>
                  <li>Apply</li>
                </ol>
              </div>
              <div className="workflow-column">
                <h3>For Recruiters</h3>
                <ol className="workflow-list">
                  <li>Create Job</li>
                  <li>Define Requirements</li>
                  <li>Find Matching Candidates</li>
                  <li>Review & Shortlist</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <h2>Ready to transform your recruitment or job search?</h2>
            <div className="footer-actions">
              <Button size="lg" variant="primary" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
            <p className="copyright">&copy; 2026 JobMatch AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
