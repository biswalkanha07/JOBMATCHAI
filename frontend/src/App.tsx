import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/public/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentJobs } from './pages/student/Jobs';
import { StudentJobDetails } from './pages/student/JobDetails';
import { StudentProfile } from './pages/student/Profile';
import { RecruiterLayout } from './layouts/RecruiterLayout';
import { RecruiterDashboard } from './pages/recruiter/Dashboard';
import { RecruiterJobs } from './pages/recruiter/Jobs';
import { RecruiterCreateJob } from './pages/recruiter/CreateJob';
import { RecruiterMatchProfiles } from './pages/recruiter/MatchProfiles';
import { RecruiterCandidateProfile } from './pages/recruiter/CandidateProfile';

import { StudentSettings } from './pages/student/Settings';
import { RecruiterSettings } from './pages/recruiter/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'STUDENT' | 'RECRUITER' }) => {
  const { role, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recruiter/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRole="STUDENT"><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="jobs/recommended" element={<StudentJobs />} />
            <Route path="jobs/:id" element={<StudentJobDetails />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
            {/* Redirect /student to /student/dashboard */}
            <Route index element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<ProtectedRoute allowedRole="RECRUITER"><RecruiterLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/create" element={<RecruiterCreateJob />} />
            <Route path="candidates" element={<RecruiterMatchProfiles />} />
            <Route path="candidates/:id" element={<RecruiterCandidateProfile />} />
            <Route path="settings" element={<RecruiterSettings />} />
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
