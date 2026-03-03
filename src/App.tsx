import type { ReactElement } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, type UserRole } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import Cases from './pages/dashboard/Cases';
import NewCase from './pages/dashboard/NewCase';
import Agencies from './pages/dashboard/Agencies';
import Reports from './pages/dashboard/Reports';
import Settings from './pages/dashboard/Settings';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import SuperAdminOverview from './pages/dashboard/SuperAdminOverview';
import EnterpriseAdminOverview from './pages/dashboard/EnterpriseAdminOverview';
import DCAPortalOverview from './pages/dashboard/DCAPortalOverview';
import RiskAllocation from './pages/dashboard/RiskAllocation';

// Footer Pages - Product
import Features from './pages/Features';
import Integrations from './pages/Integrations';
import Security from './pages/Security';
import Roadmap from './pages/Roadmap';

// Footer Pages - Company
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

// Footer Pages - Resources
import Documentation from './pages/Documentation';
import ApiReference from './pages/ApiReference';
import CaseStudies from './pages/CaseStudies';
import Support from './pages/Support';

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
      <CaseProvider>
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
                path="cases/new"
                element={
                  <RequireRole allowed={['super_admin']}>
                    <NewCase />
                  </RequireRole>
                }
              />
              <Route
                path="agencies"
                element={
                  <RequireRole allowed={['super_admin', 'enterprise_admin']}>
                    <Agencies />
                  </RequireRole>
                }
              />
              <Route path="reports" element={<Reports />} />
              <Route
                path="risk-allocation"
                element={
                  <RequireRole allowed={['super_admin']}>
                    <RiskAllocation />
                  </RequireRole>
                }
              />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Product Pages */}
            <Route path="/features" element={<Features />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/security" element={<Security />} />
            <Route path="/roadmap" element={<Roadmap />} />

            {/* Company Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />

            {/* Resources Pages */}
            <Route path="/docs" element={<Documentation />} />
            <Route path="/api-reference" element={<ApiReference />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/support" element={<Support />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CaseProvider>
    </AuthProvider>
  );
}

export default App;