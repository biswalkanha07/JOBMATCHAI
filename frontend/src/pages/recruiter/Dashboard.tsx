import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { jobsApi, type Job } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsApi.getRecruiterJobs();
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="greeting">Welcome back, {user?.recruiter_profile?.company_name || 'Recruiter'} 👋</h1>
          <p className="subtitle">Here's your recruitment overview.</p>
        </div>
      </div>

      <div className="dashboard-grid recruiter-grid">
        {/* Analytics Cards */}
        <div className="analytics-grid full-width">
          <Card className="stat-card">
            <h4>Active Jobs</h4>
            <div className="stat-value">{activeJobs}</div>
          </Card>
          <Card className="stat-card">
            <h4>Total Jobs</h4>
            <div className="stat-value">{jobs.length}</div>
          </Card>
          <Card className="stat-card">
            <h4>Pending Evaluation</h4>
            <div className="stat-value text-warning">--</div>
          </Card>
          <Card className="stat-card">
            <h4>Matched Candidates</h4>
            <div className="stat-value text-primary">Pending ML</div>
          </Card>
          <Card className="stat-card">
            <h4>Shortlisted</h4>
            <div className="stat-value text-success">--</div>
          </Card>
          <Card className="stat-card">
            <h4>Rejected</h4>
            <div className="stat-value text-danger">--</div>
          </Card>
        </div>
      </div>

      {/* Recent Job Postings */}
      <div className="dashboard-section">
        <h2>Recent Job Postings</h2>
        <Card className="table-card">
          <div className="table-responsive">
            {loading ? (
              <p style={{ padding: '1rem' }}>Loading jobs...</p>
            ) : jobs.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Posted Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 5).map(job => (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong></td>
                      <td><span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span></td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td><a href="#" onClick={(e) => { e.preventDefault(); navigate(`/recruiter/candidates?jobId=${job.id}`); }}>View Candidates</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: '1rem' }}>No jobs created yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
