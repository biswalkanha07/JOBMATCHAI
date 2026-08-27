import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job } from '../../api/jobs';
import './Jobs.css';

export const StudentJobs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>(
    location.pathname.includes('recommended') ? 'recommended' : 'all'
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(location.pathname.includes('recommended') ? 'recommended' : 'all');
  }, [location]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (activeTab === 'all') {
        setLoading(true);
        try {
          const publicJobs = await jobsApi.getPublicJobs();
          setJobs(publicJobs);
        } catch (err) {
          console.error("Failed to fetch jobs", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchJobs();
  }, [activeTab]);

  const handleTabChange = (tab: 'all' | 'recommended') => {
    setActiveTab(tab);
    if (tab === 'recommended') {
      navigate('/student/jobs/recommended');
    } else {
      navigate('/student/jobs');
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Jobs</h1>
        <div className="jobs-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            All Jobs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => handleTabChange('recommended')}
          >
            Recommended For You
          </button>
        </div>
      </div>

      <div className="jobs-toolbar">
        <input type="text" className="search-input" placeholder="Search by job title, company, or skills..." />
        <div className="filters">
          <select className="filter-select">
            <option>Location</option>
            <option>Remote</option>
            <option>On-site</option>
          </select>
          <select className="filter-select">
            <option>Job Type</option>
            <option>Full-time</option>
            <option>Internship</option>
          </select>
          <Button variant="outline">Filters</Button>
        </div>
      </div>

      <div className="jobs-list">
        {activeTab === 'all' && (
          <>
            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length > 0 ? (
              jobs.map(job => (
                <Card key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-info">
                      <div className="company-logo">{job.title.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <h3>{job.title}</h3>
                        <p className="company-name">{job.location || 'Remote'}</p>
                      </div>
                    </div>
                    <Button variant="outline">Save</Button>
                  </div>
                  <div className="job-details">
                    {job.salary_range && <span className="detail-item">{job.salary_range}</span>}
                  </div>
                  <div className="job-card-footer" style={{ marginTop: '1rem' }}>
                    <span className="posted-date">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                    <Button onClick={() => navigate(`/student/jobs/${job.id}`)}>View Details</Button>
                  </div>
                </Card>
              ))
            ) : (
              <p>No jobs available.</p>
            )}
          </>
        )}

        {activeTab === 'recommended' && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>AI Recommendations Coming Soon</h2>
            <p>The ML Recommendation Engine is deferred for the next phase. Currently, view All Jobs to find opportunities.</p>
            <Button onClick={() => handleTabChange('all')} style={{ marginTop: '1rem' }}>Browse All Jobs</Button>
          </div>
        )}
      </div>
    </div>
  );
};
