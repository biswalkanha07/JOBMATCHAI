import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { jobsApi, type Job, type DashboardStats } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, statsData] = await Promise.all([
          jobsApi.getRecruiterJobs(),
          jobsApi.getDashboardStats()
        ]);
        setJobs(jobsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="greeting">Welcome back, {user?.recruiter_profile?.tenant?.company?.name || 'Recruiter'} 👋</h1>
          <p className="subtitle">Here's your recruitment overview.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-grid full-width">
        <Card className="stat-card">
          <h4>Active Jobs</h4>
          <div className="stat-value">{stats?.active_jobs || 0}</div>
        </Card>
        <Card className="stat-card">
          <h4>Total Jobs</h4>
          <div className="stat-value">{stats?.total_jobs || 0}</div>
        </Card>
        <Card className="stat-card">
          <h4>Total Applications</h4>
          <div className="stat-value">{stats?.total_applications || 0}</div>
        </Card>
        <Card className="stat-card">
          <h4>Pending Evaluation</h4>
          <div className="stat-value text-warning">{stats?.pending_evaluation || 0}</div>
        </Card>
        <Card className="stat-card">
          <h4>Shortlisted</h4>
          <div className="stat-value text-success">{stats?.shortlisted || 0}</div>
        </Card>
        <Card className="stat-card">
          <h4>Rejected</h4>
          <div className="stat-value text-danger">{stats?.rejected || 0}</div>
        </Card>
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
