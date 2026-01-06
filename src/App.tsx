import type { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, type UserRole } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import Cases from './pages/dashboard/Cases';
import Agencies from './pages/dashboard/Agencies';
import Reports from './pages/dashboard/Reports';
import Settings from './pages/dashboard/Settings';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import SuperAdminOverview from './pages/dashboard/SuperAdminOverview';
import EnterpriseAdminOverview from './pages/dashboard/EnterpriseAdminOverview';
import DCAPortalOverview from './pages/dashboard/DCAPortalOverview';

// Protected Route Component
const RequireAuth = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/roles" state={{ from: location }} replace />;
  }

  return children;
};

const RequireRole = ({ allowed, children }: { allowed: UserRole[]; children: ReactElement }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.role || !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

// Dashboard Index Component to route based on role
const DashboardIndex = () => {
  const { user } = useAuth();
  
  if (user?.role === 'super_admin') return <SuperAdminOverview />;
  if (user?.role === 'enterprise_admin') return <EnterpriseAdminOverview />;
  if (user?.role === 'dca_agent') return <DCAPortalOverview />;
  
  return <Navigate to="/auth/roles" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/roles" element={<RoleSelection />} />
          <Route path="/auth/login/:role" element={<Login />} />
          
          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            <Route index element={<DashboardIndex />} />
            <Route path="cases" element={<Cases />} />
            <Route
              path="agencies"
              element={
                <RequireRole allowed={['super_admin', 'enterprise_admin']}>
                  <Agencies />
                </RequireRole>
              }
            />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;