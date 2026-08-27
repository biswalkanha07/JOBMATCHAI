import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { studentApi, type Application } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const apps = await studentApi.getApplications();
        setApplications(apps);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const pendingApps = applications.filter(a => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length;
  const shortlistedApps = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const rejectedApps = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="greeting">Good morning, {user?.student_profile?.first_name || 'Student'} 👋</h1>
          <p className="subtitle">Here's your job search overview.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Profile Completion Card */}
        <Card className="profile-card">
          <div className="profile-header">
            <h3>Profile Completion</h3>
            <span className="completion-text">40%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '40%' }}></div>
          </div>
          <ul className="completion-list">
            <li className="completed">✓ Personal Information</li>
            <li className="warning">⚠ Add Resume</li>
            <li className="warning">⚠ Add Skills</li>
            <li className="warning">⚠ Add Education</li>
          </ul>
        </Card>

        {/* Analytics Cards */}
        <div className="analytics-grid">
          <Card className="stat-card">
            <h4>Jobs Applied</h4>
            <div className="stat-value">{applications.length}</div>
          </Card>
          <Card className="stat-card">
            <h4>Pending Applications</h4>
            <div className="stat-value">{pendingApps}</div>
          </Card>
          <Card className="stat-card">
            <h4>Shortlisted</h4>
            <div className="stat-value">{shortlistedApps}</div>
          </Card>
          <Card className="stat-card">
            <h4>Rejected</h4>
            <div className="stat-value">{rejectedApps}</div>
          </Card>
          <Card className="stat-card">
            <h4>Profile Match Strength</h4>
            <div className="stat-value text-primary">Pending ML</div>
          </Card>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="dashboard-section">
        <h2>Recent Applications</h2>
        <Card className="table-card">
          <div className="table-responsive">
            {loading ? (
              <p style={{ padding: '1rem' }}>Loading applications...</p>
            ) : applications.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>#{app.job_id}</td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${app.status.toLowerCase()}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: '1rem' }}>You have not applied to any jobs yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
