import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import '../student/Settings.css';

export const RecruiterSettings: React.FC = () => {
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
        <p className="subtitle">Manage your recruiter profile and company configurations.</p>
      </div>

      <div className="settings-layout">
        <Card className="settings-card">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" className="form-input" defaultValue="Alex" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" className="form-input" defaultValue="Johnson" />
            </div>
            <div className="form-group">
              <label>Work Email</label>
              <input type="email" className="form-input" defaultValue="recruiter@jobmatch.ai" disabled />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-input" defaultValue="+1 555-0192" />
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>

        <Card className="settings-card">
          <h2>Company Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" className="form-input" defaultValue="Tech Solutions Pvt. Ltd." />
            </div>
            <div className="form-group">
              <label>Company Website</label>
              <input type="url" className="form-input" defaultValue="https://techsolutions.example.com" />
            </div>
            <div className="form-group full-width">
              <label>Company Description</label>
              <textarea className="form-input" rows={3} defaultValue="Leading provider of AI and cloud solutions."></textarea>
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSave}>Save Company</Button>
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

        <Card className="settings-card danger-zone">
          <h2 style={{ color: 'var(--danger)' }}>Danger Zone</h2>
          <p>Permanently delete your recruiter account and deactivate all job postings.</p>
          <div className="settings-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
