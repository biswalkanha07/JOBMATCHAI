import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job } from '../../api/jobs';
import { recruiterApi, type RecruiterApplication } from '../../api/recruiter';
import './MatchProfiles.css';

export const RecruiterMatchProfiles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || '');
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsApi.getRecruiterJobs();
        setJobs(data);
        if (!initialJobId && data.length > 0) {
          setSelectedJobId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      setSearchParams({ jobId: selectedJobId });
      const fetchApps = async () => {
        setLoadingApps(true);
        try {
          const data = await recruiterApi.getJobApplications(parseInt(selectedJobId, 10));
          setApplications(data);
        } catch (err) {
          console.error('Failed to fetch applications', err);
        } finally {
          setLoadingApps(false);
        }
      };
      fetchApps();
    }
  }, [selectedJobId, setSearchParams]);

  return (
    <div className="match-profiles-container">
      <div className="dashboard-header">
        <h1>Candidates</h1>
        <p className="subtitle">Review candidates applied to your jobs.</p>
      </div>

      <div className="job-selector-area">
        <label>Select Job:</label>
        <select 
          className="job-select form-input" 
          value={selectedJobId} 
          onChange={(e) => setSelectedJobId(e.target.value)}
          disabled={loadingJobs}
        >
          {loadingJobs && <option>Loading...</option>}
          {!loadingJobs && jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title} - {job.location || 'Remote'}</option>
          ))}
          {!loadingJobs && jobs.length === 0 && <option>No jobs available</option>}
        </select>
      </div>

      <div className="candidates-list">
        {loadingApps ? (
          <p>Loading candidates...</p>
        ) : applications.length > 0 ? (
          applications.map(app => (
            <Card key={app.id} className="candidate-card">
              <div className="candidate-header">
                <div className="candidate-info">
                  <div className="avatar large">
                    {app.student?.first_name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3>{app.student ? `${app.student.first_name} ${app.student.last_name}` : 'Student Candidate'}</h3>
                    <p className="candidate-role">{app.student?.preferred_job_role || 'No Preferred Role'} • {app.student?.location || 'No Location'}</p>
                  </div>
                </div>
                <div className="match-score-badge">
                  <span className="score">Pending ML</span>
                  <span className="label">Match</span>
                </div>
              </div>

              <div className="candidate-stats">
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className="stat-val">{app.status}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Applied Date</span>
                  <span className="stat-val">{new Date(app.applied_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="candidate-actions">
                <Button variant="outline" onClick={() => alert('View Profile feature deferred')}>View Profile</Button>
                <div className="action-group">
                  <Button variant="danger" className="reject-btn">Reject</Button>
                  <Button className="accept-btn">Shortlist</Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p>No applications found for this job.</p>
        )}
      </div>
    </div>
  );
};
