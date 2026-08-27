import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import './Settings.css';

export const StudentSettings: React.FC = () => {
  const handleSave = () => {
    alert('Settings updated successfully.');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deleted.');
    }
  };

  return (
    <div className="settings-container">
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage your account preferences and configurations.</p>
      </div>

      <div className="settings-layout">
        <Card className="settings-card">
          <h2>Account Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" className="form-input" defaultValue="Pritam" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" className="form-input" defaultValue="Kumar" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" defaultValue="student@jobmatch.ai" disabled />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-input" defaultValue="+91 98765 43210" />
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>

        <Card className="settings-card">
          <h2>Password</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Current Password</label>
              <input type="password" className="form-input" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-input" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-input" />
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSave}>Update Password</Button>
          </div>
        </Card>

        <Card className="settings-card">
          <h2>Notifications</h2>
          <div className="toggle-list">
            <div className="toggle-item">
              <div>
                <h4>Job Recommendations</h4>
                <p>Receive emails about new AI-matched jobs.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>
            <div className="toggle-item">
              <div>
                <h4>Application Updates</h4>
                <p>Get notified when your application status changes.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>
            <div className="toggle-item">
              <div>
                <h4>Recruiter Messages</h4>
                <p>Notifications when a recruiter shortlists you.</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle-checkbox" />
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </Card>

        <Card className="settings-card danger-zone">
          <h2 style={{ color: 'var(--danger)' }}>Danger Zone</h2>
          <p>Permanently delete your account and all associated data.</p>
          <div className="settings-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
