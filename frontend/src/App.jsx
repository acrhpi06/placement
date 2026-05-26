import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import AdminLogin from './pages/AdminLogin';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentCompanies from './pages/student/Companies';
import CompanyDetail from './pages/student/CompanyDetail';
import MyApplications from './pages/student/MyApplications';
import Notifications from './pages/student/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCompanies from './pages/admin/Companies';
import AddCompany from './pages/admin/AddCompany';
import SetCriteria from './pages/admin/SetCriteria';
import AdminApplications from './pages/admin/Applications';
import InterviewBoard from './pages/admin/InterviewBoard';

const ProtectedStudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!user || user.role !== 'student') return <Navigate to="/student-login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin-login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/student-login" element={<StudentLogin />} />
    <Route path="/student-register" element={<StudentRegister />} />
    <Route path="/admin-login" element={<AdminLogin />} />

    {/* Student Routes */}
    <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
    <Route path="/student/profile" element={<ProtectedStudentRoute><StudentProfile /></ProtectedStudentRoute>} />
    <Route path="/student/companies" element={<ProtectedStudentRoute><StudentCompanies /></ProtectedStudentRoute>} />
    <Route path="/student/companies/:id" element={<ProtectedStudentRoute><CompanyDetail /></ProtectedStudentRoute>} />
    <Route path="/student/applications" element={<ProtectedStudentRoute><MyApplications /></ProtectedStudentRoute>} />
    <Route path="/student/notifications" element={<ProtectedStudentRoute><Notifications /></ProtectedStudentRoute>} />

    {/* Admin Routes */}
    <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
    <Route path="/admin/students" element={<ProtectedAdminRoute><AdminStudents /></ProtectedAdminRoute>} />
    <Route path="/admin/companies" element={<ProtectedAdminRoute><AdminCompanies /></ProtectedAdminRoute>} />
    <Route path="/admin/companies/add" element={<ProtectedAdminRoute><AddCompany /></ProtectedAdminRoute>} />
    <Route path="/admin/criteria/:companyId" element={<ProtectedAdminRoute><SetCriteria /></ProtectedAdminRoute>} />
    <Route path="/admin/applications" element={<ProtectedAdminRoute><AdminApplications /></ProtectedAdminRoute>} />
    <Route path="/admin/interview/:companyId" element={<ProtectedAdminRoute><InterviewBoard /></ProtectedAdminRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Segoe UI, sans-serif',
                fontSize: '13px',
                borderRadius: '4px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.16)'
              },
              success: { style: { background: '#dff6dd', color: '#107c10', border: '1px solid #107c10' } },
              error: { style: { background: '#fde7e9', color: '#d13438', border: '1px solid #d13438' } }
            }}
          />
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
