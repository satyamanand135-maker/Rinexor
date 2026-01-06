import { useMemo, useState } from 'react';
import { User, Bell, Shield, Sliders, ToggleLeft, Users, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

    if (isDca) {
      return common;
    }

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

  const mockUsers = useMemo(() => {
    return [
      { name: 'System Administrator', email: 'superadmin@rinexor.ai', role: 'Super Admin', status: 'Active', lastActive: '2m ago' },
      { name: 'John Doe', email: 'admin@enterprise.com', role: 'Enterprise Admin', status: 'Active', lastActive: '8m ago' },
      { name: 'Agent Smith', email: 'agent@dca.com', role: 'DCA Agent', status: 'Active', lastActive: '12m ago' },
      { name: 'Ops Manager', email: 'ops@enterprise.com', role: 'Enterprise Ops', status: 'Invited', lastActive: '—' },
    ];
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
         <h1 className="text-2xl font-bold text-slate-900">
           {isSuperAdmin ? 'Platform Settings' : isEnterpriseAdmin ? 'Agency Settings' : 'Profile & Preferences'}
         </h1>
         <p className="text-slate-500">
           {isSuperAdmin
             ? 'Role & access control, SLA rules, and AI model thresholds (mocked).'
             : isEnterpriseAdmin
               ? 'Employee access control, notification rules, and internal SLA governance.'
               : 'Profile info and notification settings for your daily workflow.'}
         </p>
      </div>

      <div className="flex gap-8">
         {/* Sidebar Navigation */}
         <div className="w-64 space-y-1">
            {sidebarItems.map((item, i) => (
               <button
                  type="button"
                  key={i}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                     activeSection === item.id 
                     ? 'bg-brand-navy text-white' 
                     : 'text-slate-600 hover:bg-slate-100'
                  }`}
               >
                  <item.icon size={18} />
                  {item.label}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="flex-1 space-y-6">
            {activeSection === 'user_management' && !isDca && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{isEnterpriseAdmin ? 'User Access Management' : 'User Management'}</h3>
                  <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                    {isEnterpriseAdmin ? 'Invite User' : 'Create Admin'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 whitespace-nowrap">User</th>
                        <th className="px-4 py-3 whitespace-nowrap">Role</th>
                        <th className="px-4 py-3 whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 whitespace-nowrap">Last Active</th>
                        <th className="px-4 py-3 whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockUsers
                        .filter((u) => (isEnterpriseAdmin ? u.role !== 'Super Admin' : true))
                        .map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">{u.role}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{u.lastActive}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Reset</button>
                                <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Disable</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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

            {activeSection === 'sla' && (isSuperAdmin || isEnterpriseAdmin) && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{isSuperAdmin ? 'SLA Configuration' : 'SLA Rules'}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <div className="font-medium text-slate-900">High Priority Resolution Time</div>
                      <div className="text-xs text-slate-500">Max time allowed for high-score cases before escalation</div>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
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
                    <ToggleLeft size={32} className="text-brand-blue cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-slate-900">Breach Severity</div>
                      <div className="text-xs text-slate-500">How breaches are scored for reporting and penalties</div>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
                      <option>Weighted by amount</option>
                      <option>Weighted by ageing</option>
                      <option>Flat severity</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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
                      <div className="text-sm text-slate-600 mt-1">Current: <span className="font-semibold">v2.7</span> (mocked)</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'system_rules' && isSuperAdmin && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">System Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <div className="font-medium text-slate-900">DCA Performance Gate</div>
                      <div className="text-xs text-slate-500">Auto-flag agencies below recovery/SLA thresholds</div>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
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
                    <ToggleLeft size={32} className="text-brand-blue cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api_keys' && isSuperAdmin && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">API Keys</h3>
                  <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Generate Key</button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Rinexor Admin API', key: 'rxr_live_•••••••••••••a91d', scope: 'Full access' },
                    { name: 'Reporting Export', key: 'rxr_live_•••••••••••••c07f', scope: 'Read-only' },
                  ].map((k) => (
                    <div key={k.name} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{k.name}</div>
                        <div className="text-xs text-slate-600 mt-1">{k.key} • {k.scope}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">Rotate</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Revoke</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Settings (Common for all) */}
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

            {activeSection === 'notifications' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[ 
                    { title: 'SLA Breach Alerts', desc: 'Instant alerts for at-risk or breached cases' },
                    { title: 'Weekly Performance Digest', desc: 'Summary of recovery and SLA performance' },
                    { title: 'Assignment Updates', desc: 'When cases are reassigned or escalated' },
                  ].map((n) => (
                    <div key={n.title} className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div>
                        <div className="font-medium text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-500">{n.desc}</div>
                      </div>
                      <ToggleLeft size={32} className="text-brand-blue cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                      <div className="text-xs text-slate-500">Require OTP on sign-in (mocked)</div>
                    </div>
                    <ToggleLeft size={32} className="text-brand-blue cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-slate-900">Session Timeout</div>
                      <div className="text-xs text-slate-500">Auto sign-out after inactivity</div>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm">
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
