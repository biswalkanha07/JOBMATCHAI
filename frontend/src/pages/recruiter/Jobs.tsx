import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job } from '../../api/jobs';

export const RecruiterJobs: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Jobs</h1>
        <Button onClick={() => navigate('/recruiter/jobs/create')}>Create Job</Button>
      </div>

      <Card className="table-card" style={{ marginTop: '1rem' }}>
        <div className="jobs-toolbar" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <input type="text" className="search-input" placeholder="Search jobs..." />
        </div>
        <div className="table-responsive">
          {loading ? (
            <p style={{ padding: '1rem' }}>Loading jobs...</p>
          ) : jobs.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td><strong>{job.title}</strong></td>
                    <td>{job.location || 'Remote'}</td>
                    <td><span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span></td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/recruiter/candidates?jobId=${job.id}`)}>
                        View Candidates
                      </Button>
                    </td>
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
  );
};
