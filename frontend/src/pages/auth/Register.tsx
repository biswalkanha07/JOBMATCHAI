import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { authApi } from '../../api/auth';
import './Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  
  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Student specific
  const [preferredRole, setPreferredRole] = useState('');
  const [location, setLocation] = useState('');

  // Recruiter specific
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === 'student') {
        await authApi.registerStudent({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          preferred_job_role: preferredRole || undefined,
          location: location || undefined
        });
      } else {
        await authApi.registerRecruiter({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone: phone || undefined,
          company_name: companyName,
          company_website: companyWebsite || undefined
        });
      }
      // redirect to login after successful registration
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join JobMatch AI</p>
        </div>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
            type="button"
          >
            Student
          </button>
          <button 
            className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
            onClick={() => setRole('recruiter')}
            type="button"
          >
            Recruiter / HR
          </button>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input type="text" id="phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {role === 'student' ? (
            <>
              <div className="form-group">
                <label htmlFor="preferredRole">Preferred Job Role (Optional)</label>
                <input type="text" id="preferredRole" className="form-input" value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location (Optional)</label>
                <input type="text" id="location" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input type="text" id="companyName" className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="companyWebsite">Company Website (Optional)</label>
                <input type="text" id="companyWebsite" className="form-input" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
              </div>
            </>
          )}

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Registering...' : `Register as ${role === 'student' ? 'Student' : 'Recruiter'}`}
          </Button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login here</a></p>
        </div>
      </Card>
    </div>
  );
};
