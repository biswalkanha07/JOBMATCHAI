import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { studentApi, type StudentProfile as StudentProfileType } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export const StudentProfile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <Button>Save Changes</Button>
      </div>

      <div className="profile-layout">
        {/* Navigation Sidebar for Profile */}
        <div className="profile-nav">
          <Card className="profile-nav-card">
            <button className={`profile-nav-btn ${activeSection === 'personal' ? 'active' : ''}`} onClick={() => setActiveSection('personal')}>Personal Info</button>
            <button className={`profile-nav-btn ${activeSection === 'resume' ? 'active' : ''}`} onClick={() => setActiveSection('resume')}>Resume</button>
            <button className={`profile-nav-btn ${activeSection === 'education' ? 'active' : ''}`} onClick={() => setActiveSection('education')}>Education</button>
            <button className={`profile-nav-btn ${activeSection === 'experience' ? 'active' : ''}`} onClick={() => setActiveSection('experience')}>Experience</button>
            <button className={`profile-nav-btn ${activeSection === 'skills' ? 'active' : ''}`} onClick={() => setActiveSection('skills')}>Skills</button>
            <button className={`profile-nav-btn ${activeSection === 'projects' ? 'active' : ''}`} onClick={() => setActiveSection('projects')}>Projects</button>
            <button className={`profile-nav-btn ${activeSection === 'preferences' ? 'active' : ''}`} onClick={() => setActiveSection('preferences')}>Preferences</button>
          </Card>

          <Card className="completion-card">
            <h4>Profile Completion</h4>
            <div className="completion-text">40%</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '40%' }}></div>
            </div>
            <p className="completion-hint">Add resume to improve completion</p>
          </Card>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          {activeSection === 'personal' && (
            <Card className="content-card">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="form-input" defaultValue={profile?.first_name || ''} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="form-input" defaultValue={profile?.last_name || ''} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" defaultValue={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="form-input" defaultValue={profile?.phone || ''} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-input" defaultValue={profile?.location || ''} />
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'resume' && (
            <Card className="content-card">
              <h2>Resume</h2>
              <div className="upload-dropzone">
                <p>Drag & drop a new PDF resume here, or click to browse.</p>
                <Button variant="outline">Select File</Button>
              </div>
            </Card>
          )}

          {activeSection === 'education' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Education</h2>
                <Button variant="outline" size="sm">+ Add Education</Button>
              </div>
              <div className="empty-state"><p>No education added yet.</p></div>
            </Card>
          )}

          {activeSection === 'experience' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Experience</h2>
                <Button variant="outline" size="sm">+ Add Experience</Button>
              </div>
              <div className="empty-state"><p>No experience added yet.</p></div>
            </Card>
          )}

          {activeSection === 'skills' && (
            <Card className="content-card">
              <h2>Skills</h2>
              <div className="skills-input-area">
                <input type="text" className="form-input" placeholder="Type a skill and press Enter..." />
                <Button>Add</Button>
              </div>
              <div className="empty-state"><p>No skills added yet.</p></div>
            </Card>
          )}

          {activeSection === 'projects' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Projects</h2>
                <Button variant="outline" size="sm">+ Add Project</Button>
              </div>
              <div className="empty-state"><p>No projects added yet.</p></div>
            </Card>
          )}

          {activeSection === 'preferences' && (
            <Card className="content-card">
              <h2>Job Preferences</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Preferred Job Role</label>
                  <input type="text" className="form-input" defaultValue={profile?.preferred_job_role || ''} />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
