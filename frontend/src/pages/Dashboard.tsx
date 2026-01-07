import { useAuth } from '@/contexts/AuthContext';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import EnterpriseAdminDashboard from '@/components/dashboards/EnterpriseAdminDashboard';
import DCAAgentDashboard from '@/components/dashboards/DCAAgentDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingSpinner />;
  }

  console.log('Dashboard: User role detected:', user.role); // Debug log

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'super_admin':
      console.log('Loading SuperAdminDashboard'); // Debug log
      return <SuperAdminDashboard />;
    case 'enterprise_admin':
      console.log('Loading EnterpriseAdminDashboard'); // Debug log
      return <EnterpriseAdminDashboard />;
    case 'collection_manager':
      console.log('Loading EnterpriseAdminDashboard for collection_manager'); // Debug log
      return <EnterpriseAdminDashboard />; // Collection managers use same dashboard as enterprise admins
    case 'dca_agent':
      console.log('Loading DCAAgentDashboard'); // Debug log
      return <DCAAgentDashboard />;
    default:
      console.log('Loading default EnterpriseAdminDashboard'); // Debug log
      return <EnterpriseAdminDashboard />; // Default fallback
  }
}