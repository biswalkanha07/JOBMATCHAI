import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job } from '../../api/jobs';
import { studentApi } from '../../api/student';
import './JobDetails.css';

export const StudentJobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          const fetchedJob = await jobsApi.getPublicJob(parseInt(id, 10));
          setJob(fetchedJob);
        }
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setApplyLoading(true);
    setApplyError(null);
    try {
      await studentApi.applyToJob(job.id);
      alert('Application submitted successfully.');
      setIsApplying(false);
    } catch (err: any) {
      setApplyError(err.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div>Loading job details...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="job-details-container">
      <div className="main-content">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          &larr; Back to Jobs
        </Button>
        
        <Card className="job-header-card">
          <div className="job-header-info">
            <div className="job-company-logo">{job.title.substring(0, 2).toUpperCase()}</div>
            <div className="job-title-group">
              <h1>{job.title}</h1>
              <p className="job-company-name">{job.location || 'Remote'}</p>
            </div>
          </div>
          <div className="job-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Employment Type</span>
              <span className="meta-value">Full-time</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Salary</span>
              <span className="meta-value">{job.salary_range || 'Not Disclosed'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Posted</span>
              <span className="meta-value">{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="content-section">
            <h2>About the Job</h2>
            <p>
              {job.description || 'No description provided.'}
            </p>
          </div>
        </Card>
      </div>

      <div className="side-panel">
        <Card className="action-card">
          <Button fullWidth onClick={() => setIsApplying(true)}>Apply Now</Button>
          <Button variant="outline" fullWidth>Save Job</Button>
        </Card>
      </div>

      {isApplying && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <h2>Apply for {job.title}?</h2>
            <p>Your current profile and resume will be submitted with this application.</p>
            
            {applyError && <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{applyError}</div>}
            
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsApplying(false)}>Cancel</Button>
              <Button onClick={handleApply} disabled={applyLoading}>
                {applyLoading ? 'Submitting...' : 'Confirm Application'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
