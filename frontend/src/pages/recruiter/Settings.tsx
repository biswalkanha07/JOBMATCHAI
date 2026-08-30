import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { recruiterApi, type RecruiterProfile, type Company } from '../../api/recruiter';
import { useAuth } from '../../context/AuthContext';
import '../student/Settings.css';

export const RecruiterSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Partial<RecruiterProfile>>({});
  const [company, setCompany] = useState<Partial<Company>>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await recruiterApi.getProfile();
        setProfile(data);
        if (data.tenant?.company) {
          setCompany(data.tenant.company);
        }
      } catch (err) {
        console.error("Failed to fetch recruiter profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await recruiterApi.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone
      });
      await refreshUser();
      alert('Personal information updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update personal information.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try {
      await recruiterApi.updateCompany({
        name: company.name,
        website: company.website,
        description: company.description,
        location: company.location
      });
      await refreshUser();
      alert('Company information updated successfully!');
    } catch (err) {
      console.error('Failed to update company', err);
      alert('Failed to update company information.');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion is not fully implemented yet.');
    }
  };

  if (loading) {
    return <div className="settings-container"><p>Loading settings...</p></div>;
  }

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
              <input type="text" name="first_name" className="form-input" value={profile.first_name || ''} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" className="form-input" value={profile.last_name || ''} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Work Email</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="form-input" value={profile.phone || ''} onChange={handleProfileChange} />
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        <Card className="settings-card">
          <h2>Company Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="name" className="form-input" value={company.name || ''} onChange={handleCompanyChange} />
            </div>
            <div className="form-group">
              <label>Company Website</label>
              <input type="url" name="website" className="form-input" value={company.website || ''} onChange={handleCompanyChange} />
            </div>
            <div className="form-group full-width">
              <label>Headquarters Location</label>
              <input type="text" name="location" className="form-input" value={company.location || ''} onChange={handleCompanyChange} placeholder="e.g. San Francisco, CA" />
            </div>
            <div className="form-group full-width">
              <label>Company Description</label>
              <textarea name="description" className="form-input" rows={3} value={company.description || ''} onChange={handleCompanyChange}></textarea>
            </div>
          </div>
          <div className="settings-actions">
            <Button onClick={handleSaveCompany} disabled={savingCompany}>
              {savingCompany ? 'Saving...' : 'Save Company'}
            </Button>
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
