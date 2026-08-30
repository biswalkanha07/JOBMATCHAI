import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StudentLayout.css';

export const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const firstName = user?.student_profile?.first_name || 'Student';
  const lastName = user?.student_profile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'S';
  const email = user?.email || 'student@example.com';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="JobMatch AI Logo" style={{ height: '48px' }} />
            JobMatch AI
          </h2>
          <span className="role-badge">Student</span>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/student/dashboard" 
            className={`nav-item ${location.pathname === '/student/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          <div className="nav-group">
            <Link 
              to="/student/jobs" 
              className={`nav-item ${location.pathname === '/student/jobs' ? 'active' : ''}`}
            >
              <Briefcase size={20} />
              <span>All Jobs</span>
            </Link>
            <Link 
              to="/student/jobs/recommended" 
              className={`nav-item sub-item ${location.pathname === '/student/jobs/recommended' ? 'active' : ''}`}
            >
              <span>Recommended</span>
            </Link>
          </div>

          <Link 
            to="/student/profile" 
            className={`nav-item ${location.pathname === '/student/profile' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>

          <Link 
            to="/student/settings" 
            className={`nav-item ${location.pathname === '/student/settings' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initials}</div>
            <div className="user-details">
              <span className="user-name">{fullName}</span>
              <span className="user-email">{email}</span>
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
            {/* Search or breadcrumbs can go here */}
          </div>
          <div className="topbar-actions">
            <div className="avatar small">{initials}</div>
          </div>
        </header>
        
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
