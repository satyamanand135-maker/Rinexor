import { useMemo, useState, useEffect, useCallback } from 'react';
import { User, Bell, Shield, Sliders, Users, KeyRound, X, Copy, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

interface CreatedCredentials {
  email: string;
  password: string;
  role: string;
  name: string;
}

interface ResetResult {
  email: string;
  new_password: string;
  name: string;
}

export default function Settings() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';
  const isDca = user?.role === 'dca_agent';

  type SectionId =
    | 'profile'
    | 'security'
    | 'notifications'
    | 'user_management'
    | 'role_permissions'
    | 'sla'
    | 'ai_scoring'
    | 'system_rules'
    | 'api_keys';

  const sidebarItems = useMemo<Array<{ id: SectionId; icon: any; label: string }>>(() => {
    const common: Array<{ id: SectionId; icon: any; label: string }> = [
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'security', icon: Shield, label: 'Security' },
      { id: 'notifications', icon: Bell, label: 'Notifications' },
    ];
    if (isDca) return common;
    if (isEnterpriseAdmin) {
      return [
        ...common,
        { id: 'user_management', icon: Users, label: 'User Access' },
        { id: 'sla', icon: Sliders, label: 'SLA Rules' },
        { id: 'ai_scoring', icon: Sliders, label: 'AI Thresholds' },
      ];
    }
    return [
      ...common,
      { id: 'user_management', icon: Users, label: 'User Management' },
      { id: 'role_permissions', icon: Shield, label: 'Role Permissions' },
      { id: 'sla', icon: Sliders, label: 'SLA Configuration' },
      { id: 'ai_scoring', icon: Sliders, label: 'AI Scoring' },
      { id: 'system_rules', icon: Sliders, label: 'System Rules' },
      { id: 'api_keys', icon: KeyRound, label: 'API Keys' },
    ];
  }, [isDca, isEnterpriseAdmin, isSuperAdmin]);

  const [activeSection, setActiveSection] = useState<SectionId>(sidebarItems[0]?.id ?? 'profile');

  // ─── User Management State ───
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRole, setCreateRole] = useState<'enterprise_admin' | 'dca_agent'>('enterprise_admin');
  const [creating, setCreating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<CreatedCredentials | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ─── Persistent Settings State ───
  const loadSetting = (key: string, defaultVal: any) => {
    try {
      const v = localStorage.getItem(`rinexor_setting_${key}`);
      return v !== null ? JSON.parse(v) : defaultVal;
    } catch { return defaultVal; }
  };
  const saveSetting = (key: string, val: any) => {
    localStorage.setItem(`rinexor_setting_${key}`, JSON.stringify(val));
  };

  const [notifSLA, setNotifSLA] = useState(() => loadSetting('notif_sla', true));
  const [notifDigest, setNotifDigest] = useState(() => loadSetting('notif_digest', true));
  const [notifAssignment, setNotifAssignment] = useState(() => loadSetting('notif_assignment', true));
  const [twoFactor, setTwoFactor] = useState(() => loadSetting('two_factor', false));
  const [sessionTimeout, setSessionTimeout] = useState(() => loadSetting('session_timeout', '30 minutes'));
  const [slaHighPriority, setSlaHighPriority] = useState(() => loadSetting('sla_high_priority', '24 Hours'));
  const [slaAutoEscalation, setSlaAutoEscalation] = useState(() => loadSetting('sla_auto_escalation', false));
  const [slaSeverity, setSlaSeverity] = useState(() => loadSetting('sla_severity', 'Weighted by amount'));
  const [dcaPerfGate, setDcaPerfGate] = useState(() => loadSetting('dca_perf_gate', 'Recovery < 55% OR SLA < 90%'));
  const [auditLogging, setAuditLogging] = useState(() => loadSetting('audit_logging', true));

  // ─── API Keys State ───
  const [apiKeys, setApiKeys] = useState(() => loadSetting('api_keys', [
    { id: '1', name: 'Rinexor Admin API', key: 'rxr_live_' + Math.random().toString(36).slice(2, 14), scope: 'Full access', active: true },
    { id: '2', name: 'Reporting Export', key: 'rxr_live_' + Math.random().toString(36).slice(2, 14), scope: 'Read-only', active: true },
  ]));

  // ─── Toast Effect ───
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ─── Fetch Users ───
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('rinexor_token');
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setManagedUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'user_management' && !isDca) {
      fetchUsers();
    }
  }, [activeSection, isDca, fetchUsers]);

  // ─── Create Admin ───
  const handleCreateAdmin = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('rinexor_token');
      const res = await fetch(`${API_BASE}/users/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: createRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedCreds({
          email: data.credentials.email,
          password: data.credentials.password,
          role: data.user.role,
          name: data.user.name,
        });
        fetchUsers();
        setToast({ message: 'Admin created successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setToast({ message: err.detail || 'Failed to create admin', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // ─── Reset Password ───
  const handleReset = async (userId: string) => {
    setActionLoading(userId + '_reset');
    try {
      const token = localStorage.getItem('rinexor_token');
      const res = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResetResult({ email: data.user.email, new_password: data.new_password, name: data.user.name });
        setToast({ message: 'Password reset!', type: 'success' });
      } else {
        setToast({ message: 'Failed to reset password', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Disable/Enable User ───
  const handleDisable = async (userId: string) => {
    setActionLoading(userId + '_disable');
    try {
      const token = localStorage.getItem('rinexor_token');
      const res = await fetch(`${API_BASE}/users/${userId}/disable`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setManagedUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: data.user.is_active } : u));
        setToast({ message: data.message, type: 'success' });
      } else {
        setToast({ message: 'Failed to update user', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Copy to Clipboard ───
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Toggle Helper ───
  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} className="transition-colors">
      {enabled
        ? <ToggleRight size={32} className="text-brand-blue" />
        : <ToggleLeft size={32} className="text-slate-300" />
      }
    </button>
  );

  // ─── Generate API Key ───
  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: 'rxr_live_' + Array.from({ length: 24 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join(''),
      scope: 'Full access',
      active: true,
    };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    saveSetting('api_keys', updated);
    setToast({ message: 'API key generated!', type: 'success' });
  };

  const revokeApiKey = (id: string) => {
    const updated = apiKeys.filter((k: any) => k.id !== id);
    setApiKeys(updated);
    saveSetting('api_keys', updated);
    setToast({ message: 'API key revoked', type: 'success' });
  };

  const rotateApiKey = (id: string) => {
    const updated = apiKeys.map((k: any) => k.id === id ? { ...k, key: 'rxr_live_' + Array.from({ length: 24 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('') } : k);
    setApiKeys(updated);
    saveSetting('api_keys', updated);
    setToast({ message: 'API key rotated!', type: 'success' });
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'Super Admin',
      enterprise_admin: 'Enterprise Admin',
      dca_agent: 'DCA Agent',
      collection_manager: 'Collection Manager',
    };
    return map[role] || role;
  };

  const timeSince = (dateStr?: string) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // ─── Credential Modal ───
  const CredentialModal = ({ title, credentials, onClose }: { title: string; credentials: { email: string; password: string }; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-sm text-green-800 font-medium">✅ Save these credentials — they won't be shown again!</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email / User ID</label>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={credentials.email} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
              <button type="button" onClick={() => copyToClipboard(credentials.email, 'email')} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                {copiedField === 'email' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-600" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={credentials.password} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
              <button type="button" onClick={() => copyToClipboard(credentials.password, 'password')} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                {copiedField === 'password' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        <button type="button" onClick={onClose} className="w-full mt-6 px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
          Done
        </button>
      </div>
    </div>
  );

  // ─── Create Admin Modal ───
  const CreateAdminModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Create New Admin</h3>
          <button type="button" onClick={() => { setShowCreateModal(false); setCreatedCreds(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {!createdCreds ? (
          <>
            <p className="text-sm text-slate-500 mb-4">Choose the role for the new user. A unique email and password will be auto-generated.</p>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => setCreateRole('enterprise_admin')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${createRole === 'enterprise_admin' ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="font-semibold text-slate-900">Enterprise Admin</div>
                <div className="text-xs text-slate-500 mt-1">Full enterprise case & DCA management access</div>
              </button>
              <button
                type="button"
                onClick={() => setCreateRole('dca_agent')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${createRole === 'dca_agent' ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="font-semibold text-slate-900">DCA Agent</div>
                <div className="text-xs text-slate-500 mt-1">Agency-level case execution and status updates</div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCreateAdmin}
              disabled={creating}
              className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
              ) : (
                'Generate Credentials'
              )}
            </button>
          </>
        ) : (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-green-800 font-medium">✅ {roleLabel(createdCreds.role)} created successfully!</p>
              <p className="text-xs text-green-600 mt-1">Save these credentials — they won't be shown again.</p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                <input type="text" readOnly value={createdCreds.name} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email / User ID</label>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={createdCreds.email} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
                  <button type="button" onClick={() => copyToClipboard(createdCreds.email, 'cred_email')} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                    {copiedField === 'cred_email' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-600" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={createdCreds.password} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
                  <button type="button" onClick={() => copyToClipboard(createdCreds.password, 'cred_pass')} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                    {copiedField === 'cred_pass' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-600" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <input type="text" readOnly value={roleLabel(createdCreds.role)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>

            <button type="button" onClick={() => { setShowCreateModal(false); setCreatedCreds(null); }} className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateAdminModal />}
      {resetResult && <CredentialModal title="Password Reset" credentials={{ email: resetResult.email, password: resetResult.new_password }} onClose={() => setResetResult(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {isSuperAdmin ? 'Platform Settings' : isEnterpriseAdmin ? 'Agency Settings' : 'Profile & Preferences'}
        </h1>
        <p className="text-slate-500">
          {isSuperAdmin
            ? 'Role & access control, SLA rules, and AI model thresholds.'
            : isEnterpriseAdmin
              ? 'Employee access control, notification rules, and internal SLA governance.'
              : 'Profile info and notification settings for your daily workflow.'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {sidebarItems.map((item, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* ─── USER MANAGEMENT ─── */}
          {activeSection === 'user_management' && !isDca && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{isEnterpriseAdmin ? 'User Access Management' : 'User Management'}</h3>
                <button type="button" onClick={() => { setShowCreateModal(true); setCreatedCreds(null); }} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                  {isEnterpriseAdmin ? 'Invite User' : 'Create Admin'}
                </button>
              </div>

              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading users...
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 whitespace-nowrap">User</th>
                        <th className="px-4 py-3 whitespace-nowrap">Role</th>
                        <th className="px-4 py-3 whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 whitespace-nowrap">Created</th>
                        <th className="px-4 py-3 whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {managedUsers
                        .filter((u) => (isEnterpriseAdmin ? u.role !== 'super_admin' : true))
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">{roleLabel(u.role)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {u.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{timeSince(u.created_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReset(u.id)}
                                  disabled={actionLoading === u.id + '_reset'}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                >
                                  {actionLoading === u.id + '_reset' ? '...' : 'Reset'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDisable(u.id)}
                                  disabled={actionLoading === u.id + '_disable'}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 ${u.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                >
                                  {actionLoading === u.id + '_disable' ? '...' : u.is_active ? 'Disable' : 'Enable'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ─── ROLE PERMISSIONS ─── */}
          {activeSection === 'role_permissions' && isSuperAdmin && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Role Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { role: 'Super Admin', perms: ['All access', 'Audit logs', 'SLA config', 'AI thresholds', 'DCA onboarding'] },
                  { role: 'Enterprise Admin', perms: ['Enterprise cases', 'DCA allocation', 'SLA governance', 'Reports export'] },
                  { role: 'DCA Agent', perms: ['Assigned cases', 'Update status', 'Upload proof', 'Personal reports'] },
                  { role: 'Enterprise Ops', perms: ['Case monitoring', 'Alerts', 'Read-only analytics'] },
                ].map((r, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-900">{r.role}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.perms.map((p) => (
                        <span key={p} className="text-xs font-medium px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SLA CONFIG ─── */}
          {activeSection === 'sla' && (isSuperAdmin || isEnterpriseAdmin) && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{isSuperAdmin ? 'SLA Configuration' : 'SLA Rules'}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">High Priority Resolution Time</div>
                    <div className="text-xs text-slate-500">Max time allowed for high-score cases before escalation</div>
                  </div>
                  <select value={slaHighPriority} onChange={e => { setSlaHighPriority(e.target.value); saveSetting('sla_high_priority', e.target.value); }} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
                    <option>6 Hours</option>
                    <option>12 Hours</option>
                    <option>24 Hours</option>
                    <option>3 Days</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">Auto-Escalation Trigger</div>
                    <div className="text-xs text-slate-500">Automatically escalate cases when SLA breaches</div>
                  </div>
                  <Toggle enabled={slaAutoEscalation} onToggle={() => { const v = !slaAutoEscalation; setSlaAutoEscalation(v); saveSetting('sla_auto_escalation', v); }} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-slate-900">Breach Severity</div>
                    <div className="text-xs text-slate-500">How breaches are scored for reporting and penalties</div>
                  </div>
                  <select value={slaSeverity} onChange={e => { setSlaSeverity(e.target.value); saveSetting('sla_severity', e.target.value); }} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
                    <option>Weighted by amount</option>
                    <option>Weighted by ageing</option>
                    <option>Flat severity</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── AI SCORING ─── */}
          {activeSection === 'ai_scoring' && (isSuperAdmin || isEnterpriseAdmin) && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">AI Scoring Thresholds</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">High Priority Threshold</span>
                    <span className="text-sm font-bold text-brand-blue">Score &gt; 80</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Auto-Assignment Minimum</span>
                    <span className="text-sm font-bold text-brand-teal">Score &gt; 40</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal w-[40%]"></div>
                  </div>
                </div>
                {isSuperAdmin && (
                  <div className="p-4 bg-brand-violet/5 rounded-lg border border-brand-violet/10">
                    <div className="font-semibold text-slate-900">AI Scoring Model Version</div>
                    <div className="text-sm text-slate-600 mt-1">Current: <span className="font-semibold">v2.7</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SYSTEM RULES ─── */}
          {activeSection === 'system_rules' && isSuperAdmin && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">System Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">DCA Performance Gate</div>
                    <div className="text-xs text-slate-500">Auto-flag agencies below recovery/SLA thresholds</div>
                  </div>
                  <select value={dcaPerfGate} onChange={e => { setDcaPerfGate(e.target.value); saveSetting('dca_perf_gate', e.target.value); }} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
                    <option>Recovery &lt; 55% OR SLA &lt; 90%</option>
                    <option>Recovery &lt; 50% OR SLA &lt; 92%</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-slate-900">Audit Logging</div>
                    <div className="text-xs text-slate-500">Track admin actions for compliance</div>
                  </div>
                  <Toggle enabled={auditLogging} onToggle={() => { const v = !auditLogging; setAuditLogging(v); saveSetting('audit_logging', v); }} />
                </div>
              </div>
            </div>
          )}

          {/* ─── API KEYS ─── */}
          {activeSection === 'api_keys' && isSuperAdmin && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">API Keys</h3>
                <button type="button" onClick={generateApiKey} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Generate Key</button>
              </div>
              <div className="space-y-3">
                {apiKeys.map((k: any) => (
                  <div key={k.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{k.name}</div>
                      <div className="text-xs text-slate-600 mt-1 font-mono">{k.key.slice(0, 12)}••••••••••••  •  {k.scope}</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { copyToClipboard(k.key, k.id); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
                        {copiedField === k.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button type="button" onClick={() => rotateApiKey(k.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">Rotate</button>
                      <button type="button" onClick={() => revokeApiKey(k.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Revoke</button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">No API keys. Click "Generate Key" to create one.</div>
                )}
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {activeSection === 'profile' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  <input type="text" defaultValue={user?.name || "User"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                  <input type="text" defaultValue={user?.email || "user@rinexor.ai"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                  <input type="text" defaultValue={user?.role?.replace('_', ' ').toUpperCase()} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" readOnly />
                </div>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeSection === 'notifications' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">SLA Breach Alerts</div>
                    <div className="text-xs text-slate-500">Instant alerts for at-risk or breached cases</div>
                  </div>
                  <Toggle enabled={notifSLA} onToggle={() => { const v = !notifSLA; setNotifSLA(v); saveSetting('notif_sla', v); }} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">Weekly Performance Digest</div>
                    <div className="text-xs text-slate-500">Summary of recovery and SLA performance</div>
                  </div>
                  <Toggle enabled={notifDigest} onToggle={() => { const v = !notifDigest; setNotifDigest(v); saveSetting('notif_digest', v); }} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-slate-900">Assignment Updates</div>
                    <div className="text-xs text-slate-500">When cases are reassigned or escalated</div>
                  </div>
                  <Toggle enabled={notifAssignment} onToggle={() => { const v = !notifAssignment; setNotifAssignment(v); saveSetting('notif_assignment', v); }} />
                </div>
              </div>
            </div>
          )}

          {/* ─── SECURITY ─── */}
          {activeSection === 'security' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                    <div className="text-xs text-slate-500">Require OTP on sign-in</div>
                  </div>
                  <Toggle enabled={twoFactor} onToggle={() => { const v = !twoFactor; setTwoFactor(v); saveSetting('two_factor', v); }} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-slate-900">Session Timeout</div>
                    <div className="text-xs text-slate-500">Auto sign-out after inactivity</div>
                  </div>
                  <select value={sessionTimeout} onChange={e => { setSessionTimeout(e.target.value); saveSetting('session_timeout', e.target.value); }} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
                    <option>30 minutes</option>
                    <option>60 minutes</option>
                    <option>120 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
