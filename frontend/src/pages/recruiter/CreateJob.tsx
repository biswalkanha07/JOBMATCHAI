import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi } from '../../api/jobs';
import './CreateJob.css';

export const RecruiterCreateJob: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep(2);
  };

  const handlePublish = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const salary_range = minSalary && maxSalary ? `${minSalary} - ${maxSalary} LPA` : undefined;
      await jobsApi.createRecruiterJob({
        title,
        location,
        salary_range,
        description,
        status
      });
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create job');
      setLoading(false);
    }
  };

  return (
    <div className="create-job-container">
      <div className="dashboard-header">
        <h1>Create Job</h1>
        <p className="subtitle">Post a new opportunity to find the best talent.</p>
      </div>

      <div className="create-job-layout">
        <div className="form-content">
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          {activeStep === 1 ? (
            <Card className="form-card">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Job Title *</label>
                  <input type="text" className="form-input" placeholder="e.g. Machine Learning Engineer" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-input">
                    <option>Engineering</option>
                    <option>Data Science</option>
                    <option>Product</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select className="form-input">
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Work Mode</label>
                  <select className="form-input">
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-input" placeholder="e.g. Bangalore, India" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>

              <h2 style={{ marginTop: '2rem' }}>Salary & Experience</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Minimum Experience (Years)</label>
                  <input type="number" className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Maximum Experience (Years)</label>
                  <input type="number" className="form-input" placeholder="5" />
                </div>
                <div className="form-group">
                  <label>Minimum Salary (LPA)</label>
                  <input type="number" className="form-input" placeholder="8" value={minSalary} onChange={e => setMinSalary(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Maximum Salary (LPA)</label>
                  <input type="number" className="form-input" placeholder="15" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <Button variant="outline" onClick={() => navigate('/recruiter/jobs')}>Cancel</Button>
                <Button onClick={handleNext} disabled={!title}>Next: Description & Skills</Button>
              </div>
            </Card>
          ) : (
            <Card className="form-card">
              <h2>Description & Skills</h2>
              <div className="form-group full-width">
                <label>Job Description</label>
                <textarea className="form-input" rows={6} placeholder="Describe the role and responsibilities..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                <label>Required Skills</label>
                <div className="skills-input-area">
                  <input type="text" className="form-input" placeholder="Type a required skill and press Enter" />
                  <Button variant="outline">Add</Button>
                </div>
                <div className="skills-list">
                  <span className="skill-chip success">Python <button>×</button></span>
                  <span className="skill-chip success">Machine Learning <button>×</button></span>
                </div>
              </div>

              <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                <label>Preferred Skills</label>
                <div className="skills-input-area">
                  <input type="text" className="form-input" placeholder="Type a preferred skill and press Enter" />
                  <Button variant="outline">Add</Button>
                </div>
                <div className="skills-list">
                  <span className="skill-chip">Docker <button>×</button></span>
                  <span className="skill-chip">AWS <button>×</button></span>
                </div>
              </div>

              <div className="form-actions">
                <Button variant="outline" onClick={() => setActiveStep(1)} disabled={loading}>Back</Button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="outline" onClick={() => handlePublish('DRAFT')} disabled={loading}>Save Draft</Button>
                  <Button onClick={() => handlePublish('PUBLISHED')} disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Job'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="side-preview">
          <Card className="preview-card">
            <h3>Job Preview</h3>
            <p className="preview-hint">This is how candidates will see this job.</p>
            
            <div className="preview-content">
              <h4>{title || 'Job Title'}</h4>
              <p className="preview-company">Your Company • {location || 'Remote'}</p>
              
              <div className="preview-meta">
                <span>Full-time</span>
                <span>0-5 Yrs</span>
              </div>
              
              <div className="preview-skills">
                <strong>Required:</strong>
                <div className="skills-list small">
                  <span className="skill-chip success">Python</span>
                  <span className="skill-chip success">Machine Learning</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
