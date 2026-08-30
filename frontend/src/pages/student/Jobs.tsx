import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job } from '../../api/jobs';
import { studentApi, type Application, type MatchResult } from '../../api/student';
import './Jobs.css';

export const StudentJobs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'applications'>(
    location.pathname.includes('recommended') ? 'recommended' : 'all'
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<MatchResult[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActiveTab(location.pathname.includes('recommended') ? 'recommended' : 'all');
  }, [location]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [publicJobs, apps, recJobs] = await Promise.all([
          jobsApi.getPublicJobs(),
          studentApi.getApplications(),
          studentApi.getRecommendedJobs().catch(e => { console.error(e); return []; })
        ]);
        setJobs(publicJobs);
        setApplications(apps);
        setRecommendedJobs(recJobs);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Jobs</h1>
        <div className="jobs-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Jobs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended For You
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            My Applications
          </button>
        </div>
      </div>

      <div className="jobs-toolbar">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by job title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filters">
        </div>
      </div>

      <div className="jobs-list">
        {activeTab === 'all' && (
          <>
            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase())).map(job => (
                <Card key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-info">
                      <div className="company-logo">{job.title.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <h3>{job.title}</h3>
                        <p className="company-name">{job.location}</p>
                      </div>
                    </div>
                    {applications.some(a => a.job_id === job.id) && (
                      <div>
                        <span className="status-badge status-applied">Already Applied</span>
                      </div>
                    )}
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
          <>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : recommendedJobs.filter(m => m.job?.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              recommendedJobs.filter(m => m.job?.title.toLowerCase().includes(searchTerm.toLowerCase())).map(match => {
                let matchedSkills = [];
                let missingSkills = [];
                try {
                  if (match.matched_skills) matchedSkills = JSON.parse(match.matched_skills);
                  if (match.missing_skills) missingSkills = JSON.parse(match.missing_skills);
                } catch (e) {}
                
                return (
                <Card key={match.id} className="job-card" style={{ borderLeft: match.is_eligible ? '4px solid var(--primary)' : '4px solid var(--danger)' }}>
                  <div className="job-card-header">
                    <div className="job-info">
                      <div className="company-logo">{match.job?.title.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <h3>
                          {match.job?.title} 
                          <span style={{fontSize: '0.8rem', color: match.is_eligible ? 'var(--success)' : 'var(--danger)', background: match.is_eligible ? 'var(--success-light)' : '#ffebee', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px'}}>
                            {Math.round(match.overall_score * 100)}% Match {match.is_eligible ? '' : '(Not Eligible)'}
                          </span>
                        </h3>
                        <p className="company-name">{match.job?.location}</p>
                      </div>
                    </div>
                    {applications.some(a => a.job_id === match.job_id) && (
                      <div>
                        <span className="status-badge status-applied">Already Applied</span>
                      </div>
                    )}
                  </div>
                  <div className="job-details">
                    {match.job?.salary_range && <span className="detail-item">{match.job.salary_range}</span>}
                    
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <strong>Why this matches you:</strong>
                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', listStyleType: 'none', margin: 0, padding: 0 }}>
                           <li style={{ color: match.text_score > 0.5 ? 'var(--success)' : 'inherit' }}>✓ Profile context: {Math.round(match.text_score * 100)}%</li>
                           <li style={{ color: match.experience_score >= 1.0 ? 'var(--success)' : 'inherit' }}>✓ Experience: {Math.round(match.experience_score * 100)}%</li>
                           <li style={{ color: match.location_score >= 0.8 ? 'var(--success)' : 'inherit' }}>✓ Location: {Math.round(match.location_score * 100)}%</li>
                           <li style={{ color: match.work_mode_score >= 0.8 ? 'var(--success)' : 'inherit' }}>✓ Work Mode: {Math.round(match.work_mode_score * 100)}%</li>
                        </ul>
                      </div>
                      
                      <div>
                        <strong>Skills Analysis:</strong>
                        <div style={{ marginTop: '0.2rem' }}>
                          {matchedSkills.length > 0 && <div style={{ color: 'var(--success)' }}>✓ {matchedSkills.slice(0,3).join(', ')}</div>}
                          {missingSkills.length > 0 && <div style={{ color: '#d32f2f' }}>⚠ {missingSkills.slice(0,3).join(', ')}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="job-card-footer" style={{ marginTop: '1rem' }}>
                    <span className="posted-date" style={{ fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '60%' }}>
                      {(() => {
                        if (!match.explanation) return "Recommended based on your profile";
                        try {
                          const explainData = typeof match.explanation === 'string' ? JSON.parse(match.explanation) : match.explanation;
                          return explainData.summary || "Recommended based on your profile";
                        } catch (e) {
                          return match.explanation; // Fallback for older non-JSON explanations
                        }
                      })()}
                    </span>
                    <Button onClick={() => navigate(`/student/jobs/${match.job_id}`)}>View Details</Button>
                  </div>
                </Card>
              )})
            ) : (
              <p>No recommendations available yet. Update your profile to get personalized matches!</p>
            )}
          </>
        )}

        {activeTab === 'applications' && (
          <>
            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length > 0 ? (
              applications.map(app => (
                <Card key={app.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-info">
                      <div className="company-logo">{app.job?.title?.substring(0, 2).toUpperCase() || 'JB'}</div>
                      <div>
                        <h3>{app.job?.title || 'Unknown Job'}</h3>
                        <p className="company-name">{app.job?.location || 'Unknown Location'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vertical Naukri-style Status Tracker */}
                  <div className="status-tracker-vertical" style={{ margin: '1.5rem 0', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '2rem', color: 'var(--text)', fontSize: '1.1rem' }}>Your application status</h4>
                    
                    <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                      {/* Step 1: Applied */}
                      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                        <div style={{ position: 'absolute', left: '-2.5rem', top: '0.2rem', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 2 }}>✓</div>
                        <div style={{ position: 'absolute', left: '-1.85rem', top: '24px', bottom: '-2.5rem', width: '2px', background: ['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? 'var(--success)' : 'var(--border)' }}></div>
                        <strong style={{ color: 'var(--text)', display: 'block', fontSize: '1rem', fontWeight: 600 }}>Applied</strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      
                      {/* Step 2: Application Viewed */}
                      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                        <div style={{ position: 'absolute', left: '-2.5rem', top: '0.2rem', width: '24px', height: '24px', borderRadius: '50%', background: ['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? 'var(--success)' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 2 }}>{['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? '✓' : ''}</div>
                        <div style={{ position: 'absolute', left: '-1.85rem', top: '24px', bottom: '-2.5rem', width: '2px', background: ['SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? 'var(--success)' : 'var(--border)' }}></div>
                        <strong style={{ color: ['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? 'var(--text)' : 'var(--text-light)', display: 'block', fontSize: '1rem', fontWeight: 600 }}>Application Viewed</strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                           {['VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? (app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently') : ''}
                        </span>
                      </div>
                      
                      {/* Step 3: Action Taken */}
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-2.5rem', top: '0.2rem', width: '24px', height: '24px', borderRadius: '50%', background: ['SHORTLISTED', 'INTERVIEW'].includes(app.status) ? 'var(--success)' : (app.status === 'REJECTED' ? 'var(--danger)' : '#e2e8f0'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 2 }}>{['SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? '✓' : ''}</div>
                        <strong style={{ color: ['SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? 'var(--text)' : 'var(--text-light)', display: 'block', fontSize: '1rem', fontWeight: 600 }}>
                          {app.status === 'REJECTED' ? 'Not Selected' : (['SHORTLISTED', 'INTERVIEW'].includes(app.status) ? 'Shortlisted' : 'Action Taken')}
                        </strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                          {['SHORTLISTED', 'REJECTED', 'INTERVIEW'].includes(app.status) ? (app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently') : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="job-card-footer" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <span className="posted-date">Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                    <Button variant="outline" onClick={() => navigate(`/student/jobs/${app.job_id}`)}>View Job</Button>
                  </div>
                </Card>
              ))
            ) : (
              <p>You haven't applied to any jobs yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
