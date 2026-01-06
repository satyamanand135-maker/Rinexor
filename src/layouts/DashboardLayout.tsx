import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  PieChart, 
  Settings, 
  Bell, 
  Search, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define nav items based on role
  const getNavItems = () => {
    if (user?.role === 'super_admin') {
      return [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: FileText, label: 'Case Intelligence', path: '/dashboard/cases' },
        { icon: Users, label: 'DCA Performance', path: '/dashboard/agencies' },
        { icon: PieChart, label: 'Reports & AI', path: '/dashboard/reports' },
        { icon: Settings, label: 'Platform Settings', path: '/dashboard/settings' },
      ];
    }

    if (user?.role === 'enterprise_admin') {
      return [
        { icon: LayoutDashboard, label: 'Agency Overview', path: '/dashboard' },
        { icon: FileText, label: 'Case Distribution', path: '/dashboard/cases' },
        { icon: Users, label: 'Team Management', path: '/dashboard/agencies' },
        { icon: PieChart, label: 'Agency Reports', path: '/dashboard/reports' },
        { icon: Settings, label: 'Agency Settings', path: '/dashboard/settings' },
      ];
    }

    // dca_agent
    return [
      { icon: LayoutDashboard, label: 'My Work', path: '/dashboard' },
      { icon: FileText, label: 'My Assigned Cases', path: '/dashboard/cases' },
      { icon: PieChart, label: 'My Performance', path: '/dashboard/reports' },
      { icon: Settings, label: 'Profile & Preferences', path: '/dashboard/settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Rinexor</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:block relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={user?.role === 'dca_agent' ? 'Search my cases...' : user?.role === 'enterprise_admin' ? 'Search cases or agents...' : 'Search cases or DCAs...'}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button type="button" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-medium shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-slate-900 leading-tight">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500">{user?.role ? user.role.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Guest'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}