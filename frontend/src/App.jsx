import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import OrgAdminDashboard from './pages/orgadmin/OrgAdminDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

const HOME_BY_ROLE = {
  super_admin: '/superadmin',
  org_admin: '/orgadmin',
  employee: '/employee',
};

function Root() {
  const { user } = useAuth();
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orgadmin"
        element={
          <ProtectedRoute roles={['org_admin']}>
            <OrgAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
