import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi, type Job, type MatchResult, type ExplainabilityData } from '../../api/jobs';
import { recruiterApi, type RecruiterApplication } from '../../api/recruiter';
import type { StudentProfile } from '../../api/student';
import { MatchAnalysisModal } from './MatchAnalysisModal';
import './MatchProfiles.css';

export const RecruiterMatchProfiles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || 'all');
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'applicants' | 'matches'>('applicants');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('PENDING');
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);
  const [viewingAnalysisFor, setViewingAnalysisFor] = useState<MatchResult | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsApi.getRecruiterJobs();
        setJobs(data);
        if (!initialJobId && data.length > 0) {
          setSelectedJobId('all');
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
          const parsedId = selectedJobId === 'all' ? 'all' : parseInt(selectedJobId, 10);
          const data = await recruiterApi.getJobApplications(parsedId);
          setApplications(data);
        } catch (err) {
          console.error('Failed to fetch applications', err);
        } finally {
          setLoadingApps(false);
        }
      };
      const fetchMatchesData = async () => {
        setLoadingMatches(true);
        try {
          const parsedId = selectedJobId === 'all' ? 'all' : parseInt(selectedJobId, 10);
          const data = await jobsApi.getJobMatches(parsedId);
          setMatches(data);
        } catch (err) {
          console.error('Failed to fetch matches', err);
        } finally {
          setLoadingMatches(false);
        }
      };
      fetchApps();
      fetchMatchesData();
    }
  }, [selectedJobId, setSearchParams]);

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const targetJobId = app ? app.job_id : parseInt(selectedJobId, 10);
      
      if (isNaN(targetJobId)) {
        throw new Error('Invalid Job ID');
      }
      
      await recruiterApi.updateApplicationStatus(targetJobId, appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update application status.');
    }
  };

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
          {!loadingJobs && <option value="all">All Jobs</option>}
          {!loadingJobs && jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title} - {job.location || 'Remote'}</option>
          ))}
          {!loadingJobs && jobs.length === 0 && <option disabled>No jobs available</option>}
        </select>
      </div>

      <div className="jobs-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
          onClick={() => setActiveTab('applicants')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'applicants' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'applicants' ? 'bold' : 'normal' }}
        >
          Applicants ({applications.filter(a => appStatusFilter === 'ALL' || (appStatusFilter === 'PENDING' ? ['APPLIED', 'VIEWED'].includes(a.status) : a.status === appStatusFilter)).length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
          style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'matches' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'matches' ? 'bold' : 'normal' }}
        >
          AI Matches ({matches.length})
        </button>
      </div>

      <div className="candidates-list">
        {activeTab === 'applicants' && (
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Filter Status:</label>
            <select 
              value={appStatusFilter} 
              onChange={(e) => setAppStatusFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
            >
              <option value="PENDING">Pending (Applied/Viewed)</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All Applicants</option>
            </select>
          </div>
        )}

        {activeTab === 'applicants' && (
          loadingApps ? (
            <p>Loading candidates...</p>
          ) : applications.filter(a => appStatusFilter === 'ALL' || (appStatusFilter === 'PENDING' ? ['APPLIED', 'VIEWED'].includes(a.status) : a.status === appStatusFilter)).length > 0 ? (
            applications.filter(a => appStatusFilter === 'ALL' || (appStatusFilter === 'PENDING' ? ['APPLIED', 'VIEWED'].includes(a.status) : a.status === appStatusFilter)).map(app => (
              <Card key={app.id} className="candidate-card">
                <div className="candidate-header">
                  <div className="candidate-info">
                    <div className="avatar large">
                      {app.student?.first_name?.[0] || 'S'}
                    </div>
                    <div>
                      <h3>{app.student ? `${app.student.first_name} ${app.student.last_name}` : 'Student Candidate'}</h3>
                      <p className="candidate-role">{app.student?.preferred_job_roles?.join(', ') || 'No Preferred Role'} • {app.student?.location || 'No Location'}</p>
                      {selectedJobId === 'all' && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Applied For: </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{app.job?.title || 'Unknown Job'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="match-score-badge" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="label">Status:</span>
                      <span className="score" style={{ fontSize: '1rem' }}>{app.status}</span>
                    </div>
                    {app.match_result && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span className="label">Match:</span>
                        <span className="score" style={{ 
                          fontSize: '1rem', 
                          color: app.match_result.is_eligible ? 'var(--success)' : 'var(--danger)' 
                        }}>
                          {Math.round(app.match_result.overall_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="candidate-stats">
                  <div className="stat">
                    <span className="stat-label">Applied Date</span>
                    <span className="stat-val">{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                  {app.match_result && (
                    <div className="stat" style={{ gridColumn: 'span 2' }}>
                      <span className="stat-label">Eligibility</span>
                      <span className="stat-val" style={{ color: app.match_result.is_eligible ? 'var(--success)' : 'var(--danger)' }}>
                        {app.match_result.is_eligible ? 'Eligible' : 'Does not meet minimum requirements'}
                      </span>
                    </div>
                  )}
                </div>

                {app.match_result && app.match_result.matched_skills && (
                  <div className="candidate-skills" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Matched Skills:</strong></div>
                    <div className="skills-list small">
                      {(() => {
                        try {
                          const skills = JSON.parse(app.match_result.matched_skills as string);
                          return skills.map((s: string) => <span key={s} className="skill-chip success">{s}</span>);
                        } catch(e) { return null; }
                      })()}
                    </div>
                  </div>
                )}
                
                {app.match_result && app.match_result.missing_skills && (
                  <div className="candidate-skills" style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Missing Skills:</strong></div>
                    <div className="skills-list small">
                      {(() => {
                        try {
                          const skills = JSON.parse(app.match_result.missing_skills as string);
                          if (skills.length === 0) return <span style={{fontSize: '0.8rem', color: '#666'}}>None</span>;
                          return skills.map((s: string) => <span key={s} className="skill-chip" style={{ background: '#ffebee', color: '#c62828' }}>{s}</span>);
                        } catch(e) { return null; }
                      })()}
                    </div>
                  </div>
                )}

                <div className="candidate-actions" style={{ marginTop: '1rem' }}>
                  <Button variant="outline" onClick={() => {
                    if (app.student) {
                      setViewingStudent(app.student);
                      if (app.status === 'APPLIED') {
                        handleUpdateStatus(app.id, 'VIEWED');
                      }
                    }
                    else alert('Candidate profile data is missing.');
                  }}>View Profile</Button>
                  <div className="action-group">
                    <Button variant="danger" className="reject-btn" onClick={() => handleUpdateStatus(app.id, 'REJECTED')}>Reject</Button>
                    <Button className="accept-btn" onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}>Shortlist</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>No applications found for this job.</p>
          )
        )}

        {activeTab === 'matches' && (
          loadingMatches ? (
            <p>Loading matches...</p>
          ) : matches.length > 0 ? (
            matches.map(match => (
              <Card key={match.id} className="candidate-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="candidate-header">
                  <div className="candidate-info">
                    <div className="avatar large">
                      {match.student?.first_name?.[0] || 'S'}
                    </div>
                    <div>
                      <h3>{match.student ? `${match.student.first_name} ${match.student.last_name}` : 'Student Match'}</h3>
                      <p className="candidate-role">{match.student?.preferred_job_roles?.join(', ') || 'No Preferred Role'} • {match.student?.location || 'No Location'}</p>
                    </div>
                  </div>
                  <div className="match-score-badge" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <span className="score" style={{ color: 'var(--success)' }}>{Math.round(match.overall_score * 100)}%</span>
                    <span className="label" style={{ color: 'var(--success)' }}>Match</span>
                  </div>
                </div>

                {/* Candidate Stats - Compact Category Breakdown */}
                {match.explanation && (() => {
                  try {
                    const explainData = typeof match.explanation === 'string' ? JSON.parse(match.explanation) as ExplainabilityData : match.explanation as ExplainabilityData;
                    if (explainData && explainData.category_scores) {
                      const { skills, experience, projects, role } = explainData.category_scores;
                      return (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                             <strong>Skills:</strong> {skills}% &middot; <strong>Experience:</strong> {experience}% &middot; <strong>Projects:</strong> {projects}% &middot; <strong>Role:</strong> {role}%
                           </p>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontStyle: 'italic' }}>
                             "{explainData.summary}"
                           </p>
                        </div>
                      );
                    }
                  } catch (e) {
                    return null;
                  }
                  return null;
                })()}

                <div className="candidate-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Button variant="outline" onClick={() => {
                    if (match.student) {
                      setViewingStudent(match.student);
                    }
                    else alert('Candidate profile data is missing.');
                  }}>View Profile</Button>
                  <Button variant="outline" onClick={() => setViewingAnalysisFor(match)}>
                    View Match Analysis
                  </Button>
                  <div className="action-group" style={{ marginLeft: 'auto' }}>
                    <Button className="accept-btn" onClick={() => alert('Invite feature coming soon!')}>Invite to Apply</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>No matches found yet. Try adjusting your job description.</p>
          )
        )}
      </div>

      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>{viewingStudent.first_name} {viewingStudent.last_name}'s Profile</h2>
              <button onClick={() => setViewingStudent(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <h3>Personal Info</h3>
                <p><strong>Email/Phone:</strong> {viewingStudent.phone || 'N/A'}</p>
                <p><strong>Location:</strong> {viewingStudent.location || 'N/A'}</p>
                <p><strong>Career Status:</strong> {viewingStudent.career_status || 'N/A'}</p>
                
                <h3 style={{ marginTop: '1.5rem' }}>Preferences</h3>
                <p><strong>Preferred Roles:</strong> {viewingStudent.preferred_job_roles?.join(', ') || 'N/A'}</p>
                <p><strong>Expected Salary:</strong> {viewingStudent.expected_salary_min ? `${viewingStudent.expected_salary_min} - ${viewingStudent.expected_salary_max} ${viewingStudent.currency}` : 'N/A'}</p>
                
                <h3 style={{ marginTop: '1.5rem' }}>Links</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {viewingStudent.linkedin_url && <a href={viewingStudent.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
                  {viewingStudent.github_url && <a href={viewingStudent.github_url} target="_blank" rel="noreferrer">GitHub</a>}
                  {viewingStudent.portfolio_url && <a href={viewingStudent.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a>}
                </div>
              </div>
              
              {/* Show complete applicant-vs-job match snapshot if available */}
              {(() => {
                const app = applications.find(a => a.student_id === viewingStudent.id);
                if (app && app.match_result) {
                  return (
                    <div style={{ flex: '1', minWidth: '300px', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                      <h3>MATCH BREAKDOWN</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginTop: '1rem' }}>
                        <span>Semantic Match</span>
                        <strong>{Math.round(app.match_result.semantic_score * 100)}%</strong>
                        
                        <span>Skills Match</span>
                        <strong>{Math.round(app.match_result.skill_score * 100)}%</strong>
                        
                        <span>Experience Match</span>
                        <strong>{Math.round(app.match_result.experience_score * 100)}%</strong>
                        
                        <span>Education Match</span>
                        <strong>{Math.round(app.match_result.education_score * 100)}%</strong>
                        
                        <span>Location Match</span>
                        <strong>{Math.round(app.match_result.location_score * 100)}%</strong>
                        
                        <span>Work Mode Match</span>
                        <strong>{Math.round(app.match_result.work_mode_score * 100)}%</strong>
                        
                        <span>Salary Match</span>
                        <strong>{Math.round(app.match_result.salary_score * 100)}%</strong>
                      </div>
                      
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: app.match_result.is_eligible ? '1px solid var(--success)' : '1px solid var(--danger)' }}>
                        <h4 style={{ margin: 0, color: app.match_result.is_eligible ? 'var(--success)' : 'var(--danger)' }}>
                          {app.match_result.is_eligible ? '✓ Eligible for role' : '⚠ Does not meet minimum requirements'}
                        </h4>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div style={{ flex: '2', minWidth: '350px' }}>
                <h3>Skills</h3>
                <div className="skills-list small" style={{ marginBottom: '1.5rem' }}>
                  {viewingStudent.skill_associations?.map(sa => (
                    <span key={sa.skill.id} className="skill-chip success">{sa.skill.name} {sa.proficiency ? `(${sa.proficiency})` : ''}</span>
                  ))}
                  {(!viewingStudent.skill_associations || viewingStudent.skill_associations.length === 0) && <p>No skills listed</p>}
                </div>

                <h3>Experience</h3>
                {viewingStudent.experience?.map(exp => (
                  <div key={exp.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <strong>{exp.job_title}</strong> at {exp.company_name}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{exp.start_date} - {exp.currently_working ? 'Present' : exp.end_date}</p>
                    {exp.description && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{exp.description}</p>}
                  </div>
                ))}
                {(!viewingStudent.experience || viewingStudent.experience.length === 0) && <p style={{ marginBottom: '1.5rem' }}>No experience listed</p>}

                <h3 style={{ marginTop: '1.5rem' }}>Education</h3>
                {viewingStudent.education?.map(edu => (
                  <div key={edu.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <strong>{edu.degree}</strong> {edu.specialization ? `in ${edu.specialization}` : ''}
                    <p style={{ fontSize: '0.9rem' }}>{edu.institution}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{edu.start_date} - {edu.currently_studying ? 'Present' : edu.end_date}</p>
                  </div>
                ))}
                {(!viewingStudent.education || viewingStudent.education.length === 0) && <p style={{ marginBottom: '1.5rem' }}>No education listed</p>}

                <h3 style={{ marginTop: '1.5rem' }}>Resumes</h3>
                {viewingStudent.resumes?.map(resume => (
                  <div key={resume.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                    <span>📄 {resume.file_name} {resume.is_primary && '(Primary)'}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => recruiterApi.viewResume(resume.id)}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => recruiterApi.downloadResume(resume.id, resume.file_name)}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {(!viewingStudent.resumes || viewingStudent.resumes.length === 0) && <p>No resumes uploaded</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Analysis Modal */}
      {viewingAnalysisFor && (
        <MatchAnalysisModal 
          matchResult={viewingAnalysisFor} 
          onClose={() => setViewingAnalysisFor(null)} 
        />
      )}
    </div>
  );
};
