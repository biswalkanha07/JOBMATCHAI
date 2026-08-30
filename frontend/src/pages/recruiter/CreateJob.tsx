import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { jobsApi } from '../../api/jobs';
import './CreateJob.css';

export const RecruiterCreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(1);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Remote');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      jobsApi.getRecruiterJob(parseInt(id, 10)).then(job => {
        setTitle(job.title || '');
        setLocation(job.location || '');
        setDepartment(job.department || 'Engineering');
        setEmploymentType(job.employment_type || 'Full-time');
        setWorkMode(job.work_mode || 'Remote');
        setMinExperience(job.minimum_experience?.toString() || '');
        setMaxExperience(job.maximum_experience?.toString() || '');
        setMinSalary(job.minimum_salary ? (job.minimum_salary / 100000).toString() : '');
        setMaxSalary(job.maximum_salary ? (job.maximum_salary / 100000).toString() : '');
        setDescription(job.description || '');
        
        if (job.required_qualifications) {
          setRequiredSkills(job.required_qualifications.split(',').map((s: string) => s.trim()));
        }
        if (job.preferred_qualifications) {
          setPreferredSkills(job.preferred_qualifications.split(',').map((s: string) => s.trim()));
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setError("Failed to load job.");
        setLoading(false);
      });
    }
  }, [id]);

  const addRequiredSkill = () => {
    if (reqSkillInput.trim() && !requiredSkills.includes(reqSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const addPreferredSkill = () => {
    if (prefSkillInput.trim() && !preferredSkills.includes(prefSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      setPrefSkillInput('');
    }
  };

  const handleNext = () => {
    setActiveStep(2);
  };

  const handlePublish = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const salary_range = minSalary && maxSalary ? `${minSalary} - ${maxSalary} LPA` : undefined;
      const payload = {
        title,
        location,
        salary_range,
        description,
        status,
        department,
        employment_type: employmentType,
        work_mode: workMode,
        minimum_experience: minExperience ? parseInt(minExperience) : undefined,
        maximum_experience: maxExperience ? parseInt(maxExperience) : undefined,
        minimum_salary: minSalary ? parseInt(minSalary) * 100000 : undefined,
        maximum_salary: maxSalary ? parseInt(maxSalary) * 100000 : undefined,
        required_qualifications: requiredSkills.join(', '),
        preferred_qualifications: preferredSkills.join(', ')
      };
      
      if (id) {
        await jobsApi.updateRecruiterJob(parseInt(id, 10), payload);
      } else {
        await jobsApi.createRecruiterJob(payload);
      }
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update job');
      setLoading(false);
    }
  };

  if (loading && id && !title) {
    return <div>Loading job details...</div>;
  }

  return (
    <div className="create-job-container">
      <div className="dashboard-header">
        <h1>{id ? 'Edit Job' : 'Create Job'}</h1>
        <p className="subtitle">{id ? 'Update your job listing details.' : 'Post a new opportunity to find the best talent.'}</p>
      </div>

      <div className="create-job-layout">
        <div className="form-content">
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          {activeStep === 1 ? (
            <Card className="form-card">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Job Title *</label>
                  <input type="text" className="form-input" placeholder="e.g. Machine Learning Engineer" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select className="form-input" value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Work Mode</label>
                  <select className="form-input" value={workMode} onChange={e => setWorkMode(e.target.value)}>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-input" placeholder="e.g. Bangalore, India" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>

              <h2 style={{ marginTop: '2rem' }}>Salary & Experience</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Minimum Experience (Years)</label>
                  <input type="number" className="form-input" placeholder="0" value={minExperience} onChange={e => setMinExperience(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Maximum Experience (Years)</label>
                  <input type="number" className="form-input" placeholder="5" value={maxExperience} onChange={e => setMaxExperience(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Minimum Salary (LPA)</label>
                  <input type="number" className="form-input" placeholder="8" value={minSalary} onChange={e => setMinSalary(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Maximum Salary (LPA)</label>
                  <input type="number" className="form-input" placeholder="15" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <Button variant="outline" onClick={() => navigate('/recruiter/jobs')}>Cancel</Button>
                <Button onClick={handleNext} disabled={!title}>Next: Description & Skills</Button>
              </div>
            </Card>
          ) : (
            <Card className="form-card">
              <h2>Description & Skills</h2>
              <div className="form-group full-width">
                <label>Job Description</label>
                <textarea className="form-input" rows={6} placeholder="Describe the role and responsibilities..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                <label>Required Skills</label>
                <div className="skills-input-area">
                  <input type="text" className="form-input" placeholder="Type a required skill and press Enter" value={reqSkillInput} onChange={e => setReqSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRequiredSkill()} />
                  <Button variant="outline" onClick={addRequiredSkill}>Add</Button>
                </div>
                <div className="skills-list">
                  {requiredSkills.map(skill => (
                    <span key={skill} className="skill-chip success">{skill} <button onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}>×</button></span>
                  ))}
                </div>
              </div>

              <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                <label>Preferred Skills</label>
                <div className="skills-input-area">
                  <input type="text" className="form-input" placeholder="Type a preferred skill and press Enter" value={prefSkillInput} onChange={e => setPrefSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPreferredSkill()} />
                  <Button variant="outline" onClick={addPreferredSkill}>Add</Button>
                </div>
                <div className="skills-list">
                  {preferredSkills.map(skill => (
                    <span key={skill} className="skill-chip">{skill} <button onClick={() => setPreferredSkills(preferredSkills.filter(s => s !== skill))}>×</button></span>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <Button variant="outline" onClick={() => setActiveStep(1)} disabled={loading}>Back</Button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="outline" onClick={() => handlePublish('DRAFT')} disabled={loading}>Save Draft</Button>
                  <Button onClick={() => handlePublish('PUBLISHED')} disabled={loading}>
                    {loading ? 'Saving...' : (id ? 'Save Changes' : 'Publish Job')}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="side-preview">
          <Card className="preview-card">
            <h3>Job Preview</h3>
            <p className="preview-hint">This is how candidates will see this job.</p>
            
            <div className="preview-content">
              <h4>{title || 'Job Title'}</h4>
              <p className="preview-company">Your Company • {location || 'Remote'}</p>
              
              <div className="preview-meta">
                <span>Full-time</span>
                <span>0-5 Yrs</span>
              </div>
              
              <div className="preview-skills">
                <strong>Required:</strong>
                <div className="skills-list small">
                  {requiredSkills.map(skill => (
                    <span key={skill} className="skill-chip success">{skill}</span>
                  ))}
                  {requiredSkills.length === 0 && <span style={{fontSize: '0.8rem', color: '#666'}}>No skills added</span>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
