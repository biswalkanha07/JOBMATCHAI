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
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          const [fetchedJob, apps] = await Promise.all([
            jobsApi.getPublicJob(parseInt(id, 10)),
            studentApi.getApplications()
          ]);
          setJob(fetchedJob);
          setHasApplied(apps.some(a => a.job_id === fetchedJob.id));
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
      setHasApplied(true);
    } catch (err: any) {
      setApplyError(err.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div>Loading job details...</div>;
  if (!job) return <div>Job not found</div>;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min != null && max != null) return `₹${min / 100000} LPA – ₹${max / 100000} LPA`;
    if (min != null) return `₹${min / 100000} LPA+`;
    if (max != null) return `Up to ₹${max / 100000} LPA`;
    return job.salary_range || 'Salary not disclosed';
  };

  const formatExperience = (min?: number | null, max?: number | null) => {
    if (min === 0 && (max === 0 || max == null)) return 'Fresher';
    if (min != null && max != null) return `${min}–${max} Years`;
    if (min != null) return `${min}+ Years`;
    if (max != null) return `Up to ${max} Years`;
    return 'Experience not specified';
  };

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
              <span className="meta-label">Location</span>
              <span className="meta-value">{job.location || 'Remote'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Work Mode</span>
              <span className="meta-value">{job.work_mode || 'Not specified'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Salary</span>
              <span className="meta-value">{formatSalary(job.minimum_salary, job.maximum_salary)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Experience</span>
              <span className="meta-value">{formatExperience(job.minimum_experience, job.maximum_experience)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Posted</span>
              <span className="meta-value">{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <div className="content-section">
            <h2>About the Job</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {job.description || 'No description provided.'}
            </p>
          </div>

          {job.responsibilities && (
            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Responsibilities</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{job.responsibilities}</p>
            </div>
          )}

          {job.required_qualifications && (
            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Required Skills</h2>
              <div className="skills-list">
                {job.required_qualifications.split(',').map((skill, index) => (
                  <span key={index} className="skill-chip success">{skill.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {job.preferred_qualifications && (
            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Preferred Skills</h2>
              <div className="skills-list">
                {job.preferred_qualifications.split(',').map((skill, index) => (
                  <span key={index} className="skill-chip">{skill.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {job.minimum_education && (
            <div className="content-section" style={{ marginTop: '2rem' }}>
              <h2>Education / Qualification</h2>
              <p>{job.minimum_education}</p>
              {job.preferred_degree && <p>{job.preferred_degree} {job.preferred_field_of_study ? `in ${job.preferred_field_of_study}` : ''}</p>}
            </div>
          )}
        </Card>
      </div>

      <div className="side-panel">
        <Card className="action-card">
          <Button fullWidth onClick={() => setIsApplying(true)} disabled={hasApplied}>
            {hasApplied ? 'Already Applied' : 'Apply Now'}
          </Button>
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
