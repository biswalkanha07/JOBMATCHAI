import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import './CandidateProfile.css';

export const RecruiterCandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'move' | 'shortlist' | 'reject' | null>(null);

  const handleAction = (action: string) => {
    alert(`Candidate ${action} successfully.`);
    setActiveModal(null);
  };

  return (
    <div className="candidate-profile-container">
      <div className="main-content">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Candidates
        </Button>
        
        <Card className="candidate-header-card">
          <div className="candidate-header-info">
            <div className="candidate-avatar">PK</div>
            <div className="candidate-title-group">
              <h1>Pritam Kumar</h1>
              <p className="candidate-current-role">Machine Learning Engineer • Bangalore, India</p>
              <div className="status-badge status-review" style={{ display: 'inline-block' }}>Under Review</div>
            </div>
          </div>
          <div className="candidate-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Experience</span>
              <span className="meta-value">3 years</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Education</span>
              <span className="meta-value">B.Tech Computer Science</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Profile Completion</span>
              <span className="meta-value">100%</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="content-section">
            <h2>Resume</h2>
            <div className="resume-download">
              <div className="resume-info">
                <span className="resume-icon">📄</span>
                <div>
                  <strong>Resume.pdf</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Uploaded: August 27, 2026</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Experience</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-header">
                  <div>
                    <h3 className="timeline-title">AI Developer</h3>
                    <p className="timeline-subtitle">Tech Solutions • Full-time • Bangalore</p>
                  </div>
                  <span className="timeline-date">Jan 2024 - Present</span>
                </div>
                <p className="timeline-description">
                  Developed machine learning models for production systems. Reduced inference latency by 30%.
                </p>
                <div className="skills-list small">
                  <span className="skill-chip">Python</span>
                  <span className="skill-chip">PyTorch</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Education</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-header">
                  <div>
                    <h3 className="timeline-title">B.Tech Computer Science</h3>
                    <p className="timeline-subtitle">XYZ University</p>
                  </div>
                  <span className="timeline-date">2022 - 2026</span>
                </div>
                <p className="timeline-description">CGPA: 8.6</p>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Projects</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-header">
                  <div>
                    <h3 className="timeline-title">Resume Matcher AI</h3>
                    <p className="timeline-subtitle">Machine Learning Developer</p>
                  </div>
                  <span className="timeline-date">Jan 2026 - Present</span>
                </div>
                <p className="timeline-description">
                  Built a recommendation system using BERT embeddings and cosine similarity.
                </p>
                <div style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: 'var(--primary)', fontSize: '0.9rem', marginRight: '1rem' }}>GitHub</a>
                  <a href="#" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Live Demo</a>
                </div>
                <div className="skills-list small">
                  <span className="skill-chip">Python</span>
                  <span className="skill-chip">FastAPI</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Skills</h2>
            <div className="skills-list">
              <span className="skill-chip">Python</span>
              <span className="skill-chip">Machine Learning</span>
              <span className="skill-chip">Pandas</span>
              <span className="skill-chip">NumPy</span>
              <span className="skill-chip">SQL</span>
              <span className="skill-chip">Scikit-learn</span>
              <span className="skill-chip">FastAPI</span>
              <span className="skill-chip">React</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="side-panel">
        <Card className="action-card">
          <Button fullWidth onClick={() => setActiveModal('move')}>Move Forward</Button>
          <Button variant="outline" fullWidth onClick={() => setActiveModal('shortlist')}>Shortlist</Button>
          <Button variant="danger" fullWidth onClick={() => setActiveModal('reject')}>Reject</Button>
        </Card>

        <Card className="ai-match-card">
          <h3>MATCH ANALYSIS</h3>
          <div className="match-score-large">
            <span className="score">94%</span>
            <span className="label">Overall Match</span>
          </div>
          
          <div className="match-breakdown-list">
            <div className="breakdown-item">
              <span className="breakdown-label">Skill Match</span>
              <span className="breakdown-val">96%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Resume Similarity</span>
              <span className="breakdown-val">91%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Education Match</span>
              <span className="breakdown-val">100%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Experience Match</span>
              <span className="breakdown-val">84%</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Projects / Role</span>
              <span className="breakdown-val">93%</span>
            </div>
          </div>

          <div className="why-this-job" style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Matched Skills</h4>
            <div className="skills-list small">
              <span className="skill-chip success">Python</span>
              <span className="skill-chip success">Machine Learning</span>
              <span className="skill-chip success">Pandas</span>
              <span className="skill-chip success">SQL</span>
              <span className="skill-chip success">Scikit-learn</span>
            </div>
          </div>

          <div className="why-this-job" style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Skill Gaps</h4>
            <div className="skills-list small">
              <span className="skill-chip danger">Docker</span>
              <span className="skill-chip danger">AWS</span>
            </div>
          </div>

          <div className="why-this-job">
            <h4>Why this candidate?</h4>
            <p>
              This candidate strongly matches the technical requirements of the Machine Learning Engineer role, 
              with strong overlap in Python, Machine Learning, Pandas, SQL and Scikit-learn.
            </p>
          </div>
        </Card>
      </div>

      {activeModal === 'move' && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <h2>Move Candidate Forward?</h2>
            <p>This candidate will be moved to the next recruitment stage.</p>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={() => handleAction('moved forward')}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}

      {activeModal === 'shortlist' && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <h2>Shortlist Candidate?</h2>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button onClick={() => handleAction('shortlisted')}>Shortlist</Button>
            </div>
          </Card>
        </div>
      )}

      {activeModal === 'reject' && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <h2>Reject Candidate</h2>
            <div className="form-group full-width">
              <label>Optional reason:</label>
              <textarea className="form-input" rows={3} placeholder="Provide feedback..."></textarea>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleAction('rejected')}>Reject Candidate</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
