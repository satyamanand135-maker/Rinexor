import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Star, MoreVertical, Users, UserPlus, Activity, ShieldAlert, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface DCA {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  performance_score: number;
  recovery_rate: number;
  avg_resolution_days: number;
  max_concurrent_cases: number;
  current_active_cases: number;
  specialization?: string[];
  sla_compliance_rate: number;
  is_active: boolean;
  is_accepting_cases: boolean;
}

interface OnboardFormData {
  name: string;
  code: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  max_concurrent_cases: number;
  specialization: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  assigned: number;
  sla: number;
  recovery: number;
  status: string;
  joinedDate: string;
}

export default function Agencies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recoveryRate' | 'sla' | 'cases' | 'avgDays'>('recoveryRate');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [agencies, setAgencies] = useState<DCA[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardFormData>({
    name: '', code: '', contact_person: '', email: '', phone: '', address: '',
    max_concurrent_cases: 50, specialization: []
  });

  const isSuperAdmin = user?.role === 'super_admin';
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Team Members (Enterprise Admin) ───
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('rinexor_team_members');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [
      { id: '1', name: 'Agent Ayesha', email: 'ayesha@dca.com', phone: '+91-9876543210', role: 'Senior Collector', assigned: 42, sla: 96, recovery: 68, status: 'Active', joinedDate: '2025-03-15' },
      { id: '2', name: 'Agent Rohan', email: 'rohan@dca.com', phone: '+91-9876543211', role: 'Collector', assigned: 35, sla: 92, recovery: 61, status: 'Active', joinedDate: '2025-06-01' },
      { id: '3', name: 'Agent Meera', email: 'meera@dca.com', phone: '+91-9876543212', role: 'Collector', assigned: 28, sla: 90, recovery: 57, status: 'Active', joinedDate: '2025-08-20' },
      { id: '4', name: 'Agent Vikram', email: 'vikram@dca.com', phone: '+91-9876543213', role: 'Trainee', assigned: 18, sla: 88, recovery: 49, status: 'Onboarding', joinedDate: '2025-12-01' },
      { id: '5', name: 'Agent Sana', email: 'sana@dca.com', phone: '+91-9876543214', role: 'Collector', assigned: 31, sla: 94, recovery: 63, status: 'Active', joinedDate: '2025-07-10' },
    ];
  });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<TeamMember | null>(null);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', phone: '', role: 'Collector', status: 'Onboarding' });

  const addEmployee = () => {
    if (!newEmp.name.trim() || !newEmp.email.trim()) return;
    const emp: TeamMember = {
      id: Date.now().toString(), name: newEmp.name, email: newEmp.email, phone: newEmp.phone,
      role: newEmp.role, assigned: 0, sla: 0, recovery: 0, status: newEmp.status,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    const updated = [...teamMembers, emp];
    setTeamMembers(updated);
    localStorage.setItem('rinexor_team_members', JSON.stringify(updated));
    setNewEmp({ name: '', email: '', phone: '', role: 'Collector', status: 'Onboarding' });
    setShowAddEmployee(false);
    showToast(`${emp.name} added to team`);
  };

  const removeEmployee = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    localStorage.setItem('rinexor_team_members', JSON.stringify(updated));
    setViewingEmployee(null);
    showToast('Employee removed');
  };

  const teamTotals = useMemo(() => {
    const n = teamMembers.length;
    const totalAssigned = teamMembers.reduce((s, a) => s + a.assigned, 0);
    return { totalAgents: n, totalAssigned, avgWorkload: n ? Math.round(totalAssigned / n) : 0, avgSla: n ? Math.round(teamMembers.reduce((s, a) => s + a.sla, 0) / n) : 0 };
  }, [teamMembers]);

  // ─── Fetch DCAs (Super Admin) ───
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dcas/`);
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      } else {
        setAgencies([
          { id: '1', name: 'Orbit Recovery', code: 'OR001', contact_person: 'Manager', email: 'contact@orbit.in', performance_score: 0.71, recovery_rate: 0.71, avg_resolution_days: 11, max_concurrent_cases: 150, current_active_cases: 98, sla_compliance_rate: 0.96, is_active: true, is_accepting_cases: true },
          { id: '2', name: 'Global Collections', code: 'GL001', contact_person: 'Manager', email: 'contact@global.in', performance_score: 0.68, recovery_rate: 0.68, avg_resolution_days: 12, max_concurrent_cases: 600, current_active_cases: 450, sla_compliance_rate: 0.98, is_active: true, is_accepting_cases: true },
          { id: '3', name: 'Vertex Collections', code: 'VE001', contact_person: 'Manager', email: 'contact@vertex.in', performance_score: 0.64, recovery_rate: 0.64, avg_resolution_days: 16, max_concurrent_cases: 150, current_active_cases: 76, sla_compliance_rate: 0.90, is_active: true, is_accepting_cases: true },
          { id: '4', name: 'Alpha Recoveries', code: 'AL001', contact_person: 'Manager', email: 'contact@alpha.in', performance_score: 0.62, recovery_rate: 0.62, avg_resolution_days: 15, max_concurrent_cases: 400, current_active_cases: 320, sla_compliance_rate: 0.95, is_active: true, is_accepting_cases: true },
          { id: '5', name: 'Summit Financial', code: 'SU001', contact_person: 'Manager', email: 'contact@summit.in', performance_score: 0.58, recovery_rate: 0.58, avg_resolution_days: 18, max_concurrent_cases: 300, current_active_cases: 210, sla_compliance_rate: 0.92, is_active: true, is_accepting_cases: true },
        ]);
      }
    } catch { setAgencies([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgencies(); }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/dcas/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (response.ok) {
        const newDCA = await response.json();
        setAgencies([...agencies, newDCA]);
        setShowOnboardModal(false);
        setFormData({ name: '', code: '', contact_person: '', email: '', phone: '', address: '', max_concurrent_cases: 50, specialization: [] });
        showToast(`${newDCA.name} onboarded successfully`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to onboard agency');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const displayAgencies = useMemo(() => agencies.map(dca => ({
    name: dca.name, cases: dca.current_active_cases, recoveryRate: Math.round(dca.recovery_rate * 100),
    sla: Math.round(dca.sla_compliance_rate * 100), avgTime: `${Math.round(dca.avg_resolution_days)} Days`,
    status: dca.is_active ? 'Active' : 'Inactive'
  })), [agencies]);

  const sortedAgencies = useMemo(() => {
    return [...displayAgencies].sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'recoveryRate') return (a.recoveryRate - b.recoveryRate) * dir;
      if (sortBy === 'sla') return (a.sla - b.sla) * dir;
      if (sortBy === 'cases') return (a.cases - b.cases) * dir;
      return (Number(a.avgTime.split(' ')[0]) - Number(b.avgTime.split(' ')[0])) * dir;
    });
  }, [displayAgencies, sortBy, sortDir]);

  const totals = useMemo(() => {
    const n = displayAgencies.length;
    return {
      totalCases: displayAgencies.reduce((s, a) => s + a.cases, 0),
      avgRecovery: n ? Math.round(displayAgencies.reduce((s, a) => s + a.recoveryRate, 0) / n * 10) / 10 : 0,
      avgSla: n ? Math.round(displayAgencies.reduce((s, a) => s + a.sla, 0) / n * 10) / 10 : 0,
    };
  }, [displayAgencies]);

  // ═══════════════════════════════════════════════
  // ENTERPRISE ADMIN — Team Management
  // ═══════════════════════════════════════════════
  if (isEnterpriseAdmin) {
    return (
      <div className="space-y-6">
        {/* Toast */}
        {toast && <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm font-medium">{toast}</div>}

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
                <button type="button" onClick={() => setShowAddEmployee(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Full Name *</label>
                    <input type="text" value={newEmp.name} onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Agent Priya" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email *</label>
                    <input type="email" value={newEmp.email} onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))}
                      placeholder="priya@dca.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                    <input type="tel" value={newEmp.phone} onChange={e => setNewEmp(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91-9876543215" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                    <select value={newEmp.role} onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue">
                      <option>Senior Collector</option>
                      <option>Collector</option>
                      <option>Trainee</option>
                      <option>Field Agent</option>
                      <option>Team Lead</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Initial Status</label>
                  <select value={newEmp.status} onChange={e => setNewEmp(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue">
                    <option>Active</option>
                    <option>Onboarding</option>
                    <option>Training</option>
                  </select>
                </div>
                <button type="button" onClick={addEmployee} disabled={!newEmp.name.trim() || !newEmp.email.trim()}
                  className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  <UserPlus size={16} /> Add Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
        {viewingEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Employee Profile</h3>
                <button type="button" onClick={() => setViewingEmployee(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-white font-bold text-xl">
                  {viewingEmployee.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{viewingEmployee.name}</div>
                  <div className="text-sm text-slate-500">{viewingEmployee.role}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Assigned Cases</div>
                  <div className="text-xl font-bold text-slate-900">{viewingEmployee.assigned}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Recovery Rate</div>
                  <div className="text-xl font-bold text-slate-900">{viewingEmployee.recovery}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">SLA Compliance</div>
                  <div className="text-xl font-bold text-slate-900">{viewingEmployee.sla}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="text-xl font-bold text-slate-900">{viewingEmployee.status}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
                <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-slate-900">{viewingEmployee.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-900">{viewingEmployee.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Joined</span><span className="font-medium text-slate-900">{viewingEmployee.joinedDate}</span></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => { setViewingEmployee(null); navigate('/dashboard/cases'); }}
                  className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-navy">
                  Assign Cases
                </button>
                <button type="button" onClick={() => removeEmployee(viewingEmployee.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-500">Manage employees, balance workloads, and track agent performance & SLA adherence.</p>
          </div>
          <button type="button" onClick={() => setShowAddEmployee(true)}
            className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2">
            <UserPlus size={16} /> Add Employee
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Employees</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.totalAgents}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Assigned Cases</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.totalAssigned}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg Workload</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.avgWorkload}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg SLA</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.avgSla}%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">Employee Directory</div>
            <div className="text-xs text-slate-500">Workload • Recovery • SLA</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Employee</th>
                  <th className="px-6 py-4 whitespace-nowrap">Assigned</th>
                  <th className="px-6 py-4 whitespace-nowrap">Recovery</th>
                  <th className="px-6 py-4 whitespace-nowrap">SLA</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue" style={{ width: `${Math.min(100, (m.assigned / 50) * 100)}%` }} />
                        </div>
                        <span className="font-semibold text-slate-700">{m.assigned}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-slate-700">
                        <Activity size={16} className="text-brand-teal" />
                        <span className="font-semibold">{m.recovery}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.sla >= 95 ? 'bg-green-50 text-green-700' : m.sla >= 90 ? 'bg-amber-50 text-amber-700' : m.sla > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {m.sla > 0 ? `${m.sla}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => navigate('/dashboard/cases')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15">Assign Cases</button>
                        <button type="button" onClick={() => setViewingEmployee(m)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
            <span>Tip: keep workload variance low to reduce SLA breach probability.</span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <ShieldAlert size={14} /> SLA risk alerts are surfaced in Case Distribution.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // SUPER ADMIN — Agency Performance Directory
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm font-medium">{toast}</div>}

      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Onboard New Agency</h2>
                <p className="text-sm text-slate-500 mt-1">Add a new debt collection agency to the platform</p>
              </div>
              <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
            </div>
            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" placeholder="e.g., New Recovery Agency" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agency Code *</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" placeholder="e.g., NRA001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                  <input type="text" required value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" placeholder="e.g., John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" placeholder="e.g., contact@agency.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" placeholder="+91-9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Cases</label>
                  <input type="number" min="1" max="1000" value={formData.max_concurrent_cases} onChange={(e) => setFormData({ ...formData, max_concurrent_cases: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" rows={2} placeholder="Mumbai, Maharashtra" />
              </div>
              <div className="pt-4 border-t border-slate-200 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowOnboardModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Onboarding...</> : <><Plus size={16} /> Onboard Agency</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isSuperAdmin ? 'All Registered DCAs' : 'Assigned Agencies'}</h1>
          <p className="text-slate-500">{isSuperAdmin ? 'Monitor and evaluate performance of all agencies on the platform.' : 'Manage DCAs assigned to your enterprise.'}</p>
        </div>
        {isSuperAdmin && (
          <button type="button" onClick={() => setShowOnboardModal(true)} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2">
            <Plus size={16} /> Onboard New Agency
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total DCAs</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{agencies.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active Cases (Assigned)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totals.totalCases.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg. Recovery / SLA</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totals.avgRecovery}% <span className="text-slate-400 font-semibold">/</span> {totals.avgSla}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="font-bold text-slate-900">Agency Performance Directory</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700">
              <option value="recoveryRate">Sort: Recovery Rate</option>
              <option value="sla">Sort: SLA Compliance</option>
              <option value="cases">Sort: Active Cases</option>
              <option value="avgDays">Sort: Avg Resolution Time</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as typeof sortDir)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700">
              <option value="desc">High → Low</option>
              <option value="asc">Low → High</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Loading agencies...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Agency</th>
                  <th className="px-6 py-4 whitespace-nowrap">Active Cases</th>
                  <th className="px-6 py-4 whitespace-nowrap">Recovery Rate</th>
                  <th className="px-6 py-4 whitespace-nowrap">SLA Compliance</th>
                  <th className="px-6 py-4 whitespace-nowrap">Avg Resolution</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAgencies.map((agency, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {agency.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{agency.name}</div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={12} className={`${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-semibold">{agency.cases.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue" style={{ width: `${Math.min(agency.recoveryRate, 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-brand-blue">{agency.recoveryRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${agency.sla >= 95 ? 'bg-green-50 text-green-700' : agency.sla >= 90 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {agency.sla}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{agency.avgTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${agency.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {agency.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button type="button" className="text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <span>{isSuperAdmin ? 'System-wide registry view' : 'Enterprise-assigned DCA view'}</span>
          <button type="button" onClick={() => navigate('/dashboard/reports')} className="text-brand-blue font-medium hover:underline inline-flex items-center gap-1">
            View SLA Details <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
