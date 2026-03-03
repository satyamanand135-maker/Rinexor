import { useState, useEffect, useCallback, useRef } from 'react';
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
  X,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';



// ─── Notification Types ───
interface Notification {
  id: string;
  type: 'sla_breach' | 'task_completed' | 'task_due' | 'new_user' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const generateNotifications = (role?: string): Notification[] => {
  const ago = (mins: number) => {
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  if (role === 'super_admin') {
    return [
      { id: '1', type: 'sla_breach', title: 'SLA Breach Alert', message: '3 cases overdue at Alpha Collections — escalation recommended.', time: ago(12), read: false },
      { id: '2', type: 'task_completed', title: 'DCA Task Completed', message: 'Beta Recovery resolved 8 cases worth ₹4.2L this week.', time: ago(45), read: false },
      { id: '3', type: 'task_due', title: 'Cases Due Today', message: '14 high-priority cases across 3 DCAs require attention by EOD.', time: ago(90), read: false },
      { id: '4', type: 'new_user', title: 'New Admin Created', message: 'Enterprise Admin admin9966@rinexor.ai was added to the platform.', time: ago(180), read: true },
      { id: '5', type: 'system', title: 'AI Model Update', message: 'Scoring model v2.7 deployed — accuracy improved by 4.2%.', time: ago(360), read: true },
      { id: '6', type: 'task_completed', title: 'Gamma Solutions Update', message: 'Completed 12 standard-priority cases with 91% SLA compliance.', time: ago(480), read: true },
      { id: '7', type: 'sla_breach', title: 'DCA Performance Warning', message: 'Delta Agency recovery rate dropped below 55% threshold.', time: ago(720), read: true },
      { id: '8', type: 'task_due', title: 'Weekly Report Due', message: 'Global performance report for week 9 is ready for review.', time: ago(1440), read: true },
    ];
  }
  if (role === 'enterprise_admin') {
    return [
      { id: '1', type: 'task_due', title: 'Cases Pending Assignment', message: '6 new cases awaiting DCA allocation.', time: ago(15), read: false },
      { id: '2', type: 'task_completed', title: 'Recovery Milestone', message: 'Team reached ₹12L total recovery this month.', time: ago(120), read: false },
      { id: '3', type: 'sla_breach', title: 'SLA Warning', message: '2 cases approaching SLA deadline in next 4 hours.', time: ago(200), read: true },
      { id: '4', type: 'system', title: 'Report Available', message: 'Monthly SLA Compliance report is ready for download.', time: ago(1440), read: true },
    ];
  }
  // DCA
  return [
    { id: '1', type: 'task_due', title: 'Cases Due Today', message: '5 assigned cases require status update.', time: ago(30), read: false },
    { id: '2', type: 'task_completed', title: 'Case Resolved', message: 'CASE-2847 marked as recovered — ₹85,000.', time: ago(120), read: false },
    { id: '3', type: 'sla_breach', title: 'SLA Reminder', message: 'CASE-3012 SLA deadline in 2 hours.', time: ago(240), read: true },
  ];
};

const notifIcon = (type: string) => {
  switch (type) {
    case 'sla_breach': return <ShieldAlert size={16} className="text-red-500" />;
    case 'task_completed': return <CheckCircle2 size={16} className="text-green-500" />;
    case 'task_due': return <Clock size={16} className="text-amber-500" />;
    case 'new_user': return <UserPlus size={16} className="text-brand-blue" />;
    default: return <AlertTriangle size={16} className="text-slate-400" />;
  }
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(generateNotifications(user?.role as string | undefined));
  }, [user?.role]);

  // Click-outside handler for notification panel
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

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
        { icon: Upload, label: 'AI Allocation', path: '/dashboard/risk-allocation' },
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

  // Avatar color based on role
  const avatarBg = user?.role === 'super_admin'
    ? 'bg-gradient-to-br from-brand-navy to-brand-blue'
    : user?.role === 'enterprise_admin'
      ? 'bg-gradient-to-br from-brand-violet to-purple-400'
      : 'bg-gradient-to-br from-brand-teal to-emerald-400';

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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
          {/* Rinexor Logo → navigates home */}
          <button
            type="button"
            onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Rinexor</span>
          </button>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
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
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllRead} className="text-xs text-brand-blue font-medium hover:underline">
                          Mark all read
                        </button>
                      )}
                      <button type="button" onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-brand-blue/[0.03]' : ''}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</span>
                            {!n.read && <span className="w-2 h-2 bg-brand-blue rounded-full flex-shrink-0"></span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {notifications.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">No notifications</div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-2">
              <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white`}>
                {initials}
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