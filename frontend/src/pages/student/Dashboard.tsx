import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { studentApi, type Application, type StudentProfile } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apps, prof] = await Promise.all([
          studentApi.getApplications(),
          studentApi.getProfile()
        ]);
        setApplications(apps);
        setProfile(prof);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingApps = applications.filter(a => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length;
  const shortlistedApps = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="greeting">Good morning, {user?.student_profile?.first_name || 'Student'} 👋</h1>
          <p className="subtitle">Here's your job search overview.</p>
        </div>
      </div>

      <div className="analytics-grid">
        <Card className="stat-card">
          <h4>Profile Completion</h4>
          <div className="stat-value">{profile?.completion_percentage || 0}%</div>
        </Card>
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
                    <th>Job</th>
                    <th>Location</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map(app => (
                    <tr key={app.id}>
                      <td><strong>{app.job?.title || `Job #${app.job_id}`}</strong></td>
                      <td>{app.job?.location || 'Remote'}</td>
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
