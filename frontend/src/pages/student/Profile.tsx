import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { studentApi, type StudentProfile as StudentProfileType } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export const StudentProfile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [formData, setFormData] = useState<Partial<StudentProfileType>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, refreshUser } = useAuth();

  // Skill Form
  const [skillInput, setSkillInput] = useState('');
  const [skillProficiency, setSkillProficiency] = useState('Intermediate');
  
  // Education Form
  const [showEdForm, setShowEdForm] = useState(false);
  const [newEd, setNewEd] = useState({ 
    education_level: 'Undergraduate', degree: '', specialization: '', institution: '', 
    university_or_board: '', start_date: '', end_date: '', currently_studying: false 
  });

  // Experience Form
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExp, setNewExp] = useState({ 
    job_title: '', company_name: '', employment_type: 'Full-time', 
    company_location: '', industry: '', start_date: '', end_date: '', currently_working: false 
  });

  // Project Form
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProj, setNewProj] = useState({ 
    name: '', project_type: 'Personal', role: '', description: '', 
    start_date: '', end_date: '', currently_active: false, 
    project_url: '', github_url: '' 
  });

  const fetchProfile = async () => {
    try {
      const data = await studentApi.getProfile();
      setProfile(data);
      setFormData({
        ...data,
        preferred_job_roles: data.preferred_job_roles || [],
        preferred_work_locations: data.preferred_work_locations || [],
        work_mode: data.work_mode || [],
        employment_type: data.employment_type || [],
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const val = e.target.value;
    setFormData({ ...formData, [fieldName]: val.split(',').map(s => s.trim()) });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updated = await studentApi.updateProfile(formData);
      setProfile(updated);
      await refreshUser();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!skillInput.trim()) return;
    try {
      await studentApi.addSkill({ skill_name: skillInput.trim(), proficiency: skillProficiency });
      setSkillInput('');
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (id: number) => {
    try {
      await studentApi.deleteSkill(id);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to remove skill");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      await studentApi.uploadResume(file, true);
      alert("Resume uploaded!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to upload resume");
    }
  };

  const handleDeleteResume = async (id: number) => {
    if(window.confirm("Delete this resume?")) {
      try {
        await studentApi.deleteResume(id);
        fetchProfile();
      } catch (err) {
        alert("Failed to delete resume");
      }
    }
  };

  const handleAddEducation = async () => {
    try {
      await studentApi.addEducation({
        ...newEd,
        start_date: newEd.start_date || undefined,
        end_date: newEd.end_date || undefined
      });
      setShowEdForm(false);
      fetchProfile();
    } catch(err) {
      alert("Failed to add education");
    }
  };

  const handleAddExperience = async () => {
    try {
      await studentApi.addExperience({
        ...newExp,
        start_date: newExp.start_date || undefined,
        end_date: newExp.end_date || undefined
      });
      setShowExpForm(false);
      fetchProfile();
    } catch(err) {
      alert("Failed to add experience");
    }
  };

  const handleAddProject = async () => {
    try {
      await studentApi.addProject({
        ...newProj,
        start_date: newProj.start_date || undefined,
        end_date: newProj.end_date || undefined
      });
      setShowProjForm(false);
      fetchProfile();
    } catch(err) {
      alert("Failed to add project");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <Button onClick={handleSaveChanges} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="profile-layout">
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
        </div>

        <div className="profile-content">
          {activeSection === 'personal' && (
            <Card className="content-card">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" className="form-input" value={formData.first_name || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" className="form-input" value={formData.last_name || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email (Read-only)</label>
                  <input type="email" className="form-input" value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" className="form-input" value={formData.phone || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" className="form-input" value={formData.date_of_birth ? String(formData.date_of_birth).split('T')[0] : ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" className="form-input" value={formData.gender || ''} onChange={handleInputChange}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Career Status</label>
                  <select name="career_status" className="form-input" value={formData.career_status || ''} onChange={handleInputChange}>
                    <option value="">Select...</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Student">Student</option>
                    <option value="Experienced">Experienced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Location</label>
                  <input type="text" name="location" className="form-input" value={formData.location || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Profile Headline</label>
                  <input type="text" name="profile_headline" className="form-input" value={formData.profile_headline || ''} onChange={handleInputChange} placeholder="e.g. Aspiring Full Stack Developer" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>About Me</label>
                  <textarea name="about_me" className="form-input" value={formData.about_me || ''} onChange={handleInputChange} rows={4}></textarea>
                </div>
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="url" name="linkedin_url" className="form-input" value={formData.linkedin_url || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input type="url" name="github_url" className="form-input" value={formData.github_url || ''} onChange={handleInputChange} />
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'resume' && (
            <Card className="content-card">
              <h2>Resumes</h2>
              <div style={{ marginBottom: '1.5rem' }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
              </div>

              {profile?.resumes && profile.resumes.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {profile.resumes.map(r => (
                    <li key={r.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{r.file_name}</strong> {r.is_primary && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Primary</span>}
                        <br/>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteResume(r.id)}>Delete</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No resume uploaded yet.</p>
              )}
            </Card>
          )}

          {activeSection === 'education' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Education</h2>
                <Button variant="outline" size="sm" onClick={() => setShowEdForm(!showEdForm)}>
                  {showEdForm ? 'Cancel' : '+ Add Education'}
                </Button>
              </div>
              
              {showEdForm && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Level</label>
                      <select className="form-input" value={newEd.education_level} onChange={e => setNewEd({...newEd, education_level: e.target.value})}>
                        <option>10th</option>
                        <option>12th</option>
                        <option>Undergraduate</option>
                        <option>Postgraduate</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Degree</label>
                      <input type="text" placeholder="e.g. B.Tech" className="form-input" value={newEd.degree} onChange={e => setNewEd({...newEd, degree: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input type="text" placeholder="e.g. Computer Science" className="form-input" value={newEd.specialization} onChange={e => setNewEd({...newEd, specialization: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Institution</label>
                      <input type="text" className="form-input" value={newEd.institution} onChange={e => setNewEd({...newEd, institution: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" className="form-input" value={newEd.start_date} onChange={e => setNewEd({...newEd, start_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" className="form-input" value={newEd.end_date} onChange={e => setNewEd({...newEd, end_date: e.target.value})} disabled={newEd.currently_studying} />
                    </div>
                  </div>
                  <Button onClick={handleAddEducation} style={{ marginTop: '1rem' }}>Save Education</Button>
                </div>
              )}

              {profile?.education && profile.education.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {profile.education.map(ed => (
                    <li key={ed.id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4>{ed.degree} {ed.specialization ? `in ${ed.specialization}` : ''}</h4>
                      <p>{ed.institution}</p>
                      <Button variant="danger" size="sm" onClick={async () => {
                        await studentApi.deleteEducation(ed.id);
                        fetchProfile();
                      }}>Remove</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state"><p>No education added yet.</p></div>
              )}
            </Card>
          )}

          {activeSection === 'experience' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Experience</h2>
                <Button variant="outline" size="sm" onClick={() => setShowExpForm(!showExpForm)}>
                  {showExpForm ? 'Cancel' : '+ Add Experience'}
                </Button>
              </div>

              {showExpForm && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input type="text" className="form-input" value={newExp.job_title} onChange={e => setNewExp({...newExp, job_title: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input type="text" className="form-input" value={newExp.company_name} onChange={e => setNewExp({...newExp, company_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Employment Type</label>
                      <select className="form-input" value={newExp.employment_type} onChange={e => setNewExp({...newExp, employment_type: e.target.value})}>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" className="form-input" value={newExp.company_location} onChange={e => setNewExp({...newExp, company_location: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" className="form-input" value={newExp.start_date} onChange={e => setNewExp({...newExp, start_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" className="form-input" value={newExp.end_date} onChange={e => setNewExp({...newExp, end_date: e.target.value})} disabled={newExp.currently_working} />
                    </div>
                  </div>
                  <Button onClick={handleAddExperience} style={{ marginTop: '1rem' }}>Save Experience</Button>
                </div>
              )}

              {profile?.experience && profile.experience.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {profile.experience.map(exp => (
                    <li key={exp.id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4>{exp.job_title} at {exp.company_name}</h4>
                      <p>{exp.employment_type} &bull; {exp.company_location}</p>
                      <Button variant="danger" size="sm" onClick={async () => {
                        await studentApi.deleteExperience(exp.id);
                        fetchProfile();
                      }}>Remove</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state"><p>No experience added yet.</p></div>
              )}
            </Card>
          )}

          {activeSection === 'skills' && (
            <Card className="content-card">
              <h2>Skills</h2>
              <div className="skills-input-area" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type a skill..." 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                />
                <select className="form-input" value={skillProficiency} onChange={e => setSkillProficiency(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
                <Button onClick={handleAddSkill}>Add</Button>
              </div>
              
              {profile?.skill_associations && profile.skill_associations.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {profile.skill_associations.map(assoc => (
                    <span key={assoc.skill.id} style={{ padding: '0.5rem 1rem', background: 'var(--bg-hover)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {assoc.skill.name} ({assoc.proficiency})
                      <button onClick={() => handleRemoveSkill(assoc.skill.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times;</button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><p>No skills added yet.</p></div>
              )}
            </Card>
          )}

          {activeSection === 'projects' && (
            <Card className="content-card">
              <div className="section-header">
                <h2>Projects</h2>
                <Button variant="outline" size="sm" onClick={() => setShowProjForm(!showProjForm)}>
                  {showProjForm ? 'Cancel' : '+ Add Project'}
                </Button>
              </div>

              {showProjForm && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input type="text" className="form-input" value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-input" value={newProj.project_type} onChange={e => setNewProj({...newProj, project_type: e.target.value})}>
                        <option>Personal</option>
                        <option>Academic</option>
                        <option>Professional</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description</label>
                      <textarea className="form-input" rows={3} value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>GitHub URL</label>
                      <input type="url" className="form-input" value={newProj.github_url} onChange={e => setNewProj({...newProj, github_url: e.target.value})} />
                    </div>
                  </div>
                  <Button onClick={handleAddProject} style={{ marginTop: '1rem' }}>Save Project</Button>
                </div>
              )}

              {profile?.projects && profile.projects.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {profile.projects.map(proj => (
                    <li key={proj.id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4>{proj.name} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>({proj.project_type})</span></h4>
                      <p>{proj.description}</p>
                      <Button variant="danger" size="sm" onClick={async () => {
                        await studentApi.deleteProject(proj.id);
                        fetchProfile();
                      }}>Remove</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state"><p>No projects added yet.</p></div>
              )}
            </Card>
          )}

          {activeSection === 'preferences' && (
            <Card className="content-card">
              <h2>Job Preferences</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Preferred Job Roles (comma separated)</label>
                  <input type="text" className="form-input" value={formData.preferred_job_roles?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'preferred_job_roles')} />
                </div>
                <div className="form-group">
                  <label>Preferred Locations (comma separated)</label>
                  <input type="text" className="form-input" value={formData.preferred_work_locations?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'preferred_work_locations')} />
                </div>
                <div className="form-group">
                  <label>Work Modes (comma separated)</label>
                  <input type="text" className="form-input" value={formData.work_mode?.join(', ') || ''} onChange={(e) => handleArrayChange(e, 'work_mode')} placeholder="Remote, Hybrid" />
                </div>
                <div className="form-group">
                  <label>Job Search Status</label>
                  <select name="job_search_status" className="form-input" value={formData.job_search_status || ''} onChange={handleInputChange}>
                    <option value="">Select...</option>
                    <option value="Actively Looking">Actively Looking</option>
                    <option value="Open to Opportunities">Open to Opportunities</option>
                    <option value="Not Looking">Not Looking</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected Min Salary</label>
                  <input type="number" name="expected_salary_min" className="form-input" value={formData.expected_salary_min || ''} onChange={handleInputChange} />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
