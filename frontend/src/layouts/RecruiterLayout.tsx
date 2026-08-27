import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RecruiterLayout.css';

export const RecruiterLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>JobMatch AI</h2>
          <span className="role-badge">Recruiter</span>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/recruiter/dashboard" 
            className={`nav-item ${location.pathname === '/recruiter/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          <div className="nav-group">
            <Link 
              to="/recruiter/jobs" 
              className={`nav-item ${location.pathname === '/recruiter/jobs' ? 'active' : ''}`}
            >
              <Briefcase size={20} />
              <span>Jobs</span>
            </Link>
            <Link 
              to="/recruiter/jobs/create" 
              className={`nav-item sub-item ${location.pathname === '/recruiter/jobs/create' ? 'active' : ''}`}
            >
              <span>Create Job</span>
            </Link>
          </div>

          <Link 
            to="/recruiter/candidates" 
            className={`nav-item ${location.pathname === '/recruiter/candidates' ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Match Profiles</span>
          </Link>

          <Link 
            to="/recruiter/settings" 
            className={`nav-item ${location.pathname === '/recruiter/settings' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">AJ</div>
            <div className="user-details">
              <span className="user-name">Alex Johnson</span>
              <span className="user-email">Tech Solutions Pvt. Ltd.</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-search">
            {/* Search */}
          </div>
          <div className="topbar-actions">
            <div className="avatar small">AJ</div>
          </div>
        </header>
        
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
