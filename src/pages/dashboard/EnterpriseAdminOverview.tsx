import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText, AlertTriangle, Users, ArrowUpRight, X, Check, ChevronDown } from 'lucide-react';

interface SLARule {
  id: string;
  name: string;
  priority: string;
  maxHours: number;
  autoEscalate: boolean;
}

interface CaseRow {
  id: string;
  amount: string;
  priority: 'High' | 'Standard' | 'Low';
  sla: string;
  assignedTo: string | null;
}

export default function EnterpriseAdminOverview() {
  const navigate = useNavigate();

  // ─── State ───
  const [showSLAModal, setShowSLAModal] = useState(false);
  const [slaRules, setSlaRules] = useState<SLARule[]>(() => {
    try {
      const saved = localStorage.getItem('rinexor_sla_rules');
      return saved ? JSON.parse(saved) : [
        { id: '1', name: 'High Priority', priority: 'High', maxHours: 24, autoEscalate: true },
        { id: '2', name: 'Standard Priority', priority: 'Standard', maxHours: 72, autoEscalate: false },
      ];
    } catch { return []; }
  });
  const [newRule, setNewRule] = useState({ name: '', priority: 'High', maxHours: 24, autoEscalate: true });

  const [cases, setCases] = useState<CaseRow[]>([
    { id: 'CS-9312', amount: '₹45,200', priority: 'High', sla: '6h left', assignedTo: null },
    { id: 'CS-9288', amount: '₹12,850', priority: 'Standard', sla: '2d left', assignedTo: null },
    { id: 'CS-9271', amount: '₹8,500', priority: 'Standard', sla: '3d left', assignedTo: null },
    { id: 'CS-9204', amount: '₹1,56,000', priority: 'High', sla: '12h left', assignedTo: null },
    { id: 'CS-9189', amount: '₹22,700', priority: 'High', sla: '4h left', assignedTo: null },
    { id: 'CS-9155', amount: '₹6,300', priority: 'Low', sla: '5d left', assignedTo: null },
  ]);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const agents = ['Ayesha', 'Rohan', 'Sana', 'Meera', 'Vikram'];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const workload = agents.map(name => ({
    name,
    cases: cases.filter(c => c.assignedTo === name).length + [42, 35, 31, 28, 18][agents.indexOf(name)],
  }));

  // ─── Assign Agent ───
  const assignAgent = (caseId: string, agent: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, assignedTo: agent } : c));
    setActiveDropdown(null);
    showToast(`${caseId} assigned to ${agent}`);
  };

  // ─── Create SLA Rule ───
  const createSLARule = () => {
    if (!newRule.name.trim()) return;
    const rule: SLARule = { id: Date.now().toString(), ...newRule };
    const updated = [...slaRules, rule];
    setSlaRules(updated);
    localStorage.setItem('rinexor_sla_rules', JSON.stringify(updated));
    setNewRule({ name: '', priority: 'High', maxHours: 24, autoEscalate: true });
    setShowSLAModal(false);
    showToast(`SLA Rule "${rule.name}" created`);
  };

  const deleteSLARule = (id: string) => {
    const updated = slaRules.filter(r => r.id !== id);
    setSlaRules(updated);
    localStorage.setItem('rinexor_sla_rules', JSON.stringify(updated));
    showToast('SLA Rule deleted');
  };

  // ─── Dismiss Alert ───
  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
    showToast(`Alert ${id} dismissed`);
  };

  const slaAlerts = [
    { id: 'CS-9204', msg: 'High risk: 12h left', time: '5m ago' },
    { id: 'CS-9312', msg: 'High priority: 6h left', time: '22m ago' },
    { id: 'CS-9189', msg: 'Critical: 4h left', time: '1h ago' },
  ].filter(a => !dismissedAlerts.includes(a.id));

  const assignedCount = cases.filter(c => c.assignedTo).length;
  const pendingCount = cases.filter(c => !c.assignedTo).length;
  const slaCompliance = Math.round(((cases.length - slaAlerts.length) / cases.length) * 100);

  const kpis = [
    { label: 'Total Assigned Cases', value: (1100 + assignedCount).toLocaleString(), change: `+${assignedCount} today`, icon: FileText, color: 'text-brand-blue', bg: 'bg-brand-blue/10', positive: true },
    { label: 'Amount Under Recovery', value: '₹4.2M', change: `${pendingCount} pending`, icon: DollarSign, color: 'text-brand-violet', bg: 'bg-brand-violet/10', positive: true },
    { label: 'Agency Recovery Rate', value: '72.5%', change: '+1.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', positive: true },
    { label: 'SLA Risk Alerts', value: String(slaAlerts.length), change: slaAlerts.length > 0 ? 'Watchlist' : 'All clear', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50', positive: slaAlerts.length === 0 },
    { label: 'Employees / Agents', value: String(agents.length), change: `${agents.length} active`, icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal/10', positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* SLA Rule Modal */}
      {showSLAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">SLA Rules</h3>
              <button type="button" onClick={() => setShowSLAModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {/* Existing Rules */}
            {slaRules.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Active Rules</div>
                <div className="space-y-2">
                  {slaRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{rule.name}</div>
                        <div className="text-xs text-slate-500">
                          {rule.priority} priority • Max {rule.maxHours}h • {rule.autoEscalate ? 'Auto-escalate ON' : 'Manual escalation'}
                        </div>
                      </div>
                      <button type="button" onClick={() => deleteSLARule(rule.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Rule Form */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Create New Rule</div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Rule Name</label>
                <input type="text" value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Urgent Cases" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                  <select value={newRule.priority} onChange={e => setNewRule(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                    <option>High</option>
                    <option>Standard</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Max Resolution (hours)</label>
                  <input type="number" value={newRule.maxHours} onChange={e => setNewRule(p => ({ ...p, maxHours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" min={1} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={newRule.autoEscalate} onChange={e => setNewRule(p => ({ ...p, autoEscalate: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-brand-blue" />
                Auto-escalate on breach
              </label>
              <button type="button" onClick={createSLARule} disabled={!newRule.name.trim()}
                className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agency Overview</h1>
          <p className="text-slate-500">DCA owner / manager workspace: distribute cases to employees, track SLA risk, and monitor recovery performance.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/dashboard/cases')}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            Open Case Distribution
          </button>
          <button type="button" onClick={() => setShowSLAModal(true)}
            className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            Create SLA Rule
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.positive ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-700'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Case Distribution Queue</h3>
            <span className="text-xs text-slate-500">
              {pendingCount > 0 ? `${pendingCount} pending assignment` : 'All cases assigned ✅'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Case</th>
                  <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 whitespace-nowrap">AI Priority</th>
                  <th className="px-4 py-3 whitespace-nowrap">SLA</th>
                  <th className="px-4 py-3 whitespace-nowrap">Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-blue">{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.priority === 'High' ? 'bg-red-50 text-red-700' :
                          c.priority === 'Standard' ? 'bg-amber-50 text-amber-700' :
                            'bg-green-50 text-green-700'
                        }`}>{c.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.sla.includes('h') ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{c.sla}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.assignedTo ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                          <Check size={14} /> {c.assignedTo}
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === c.id ? null : c.id)}
                            className="text-xs font-bold bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:bg-brand-navy flex items-center gap-1"
                          >
                            Assign Agent <ChevronDown size={12} />
                          </button>
                          {activeDropdown === c.id && (
                            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-40">
                              {agents.map(agent => (
                                <button
                                  key={agent}
                                  type="button"
                                  onClick={() => assignAgent(c.id, agent)}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  {agent}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">SLA Monitoring</h3>
            <div className="flex items-center justify-center relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: slaCompliance, color: '#10b981' }, { value: 100 - slaCompliance, color: '#f1f5f9' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{slaCompliance}%</span>
                <span className="text-xs text-slate-500">Compliant</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">Breach warnings appear when &lt; 24h remaining</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Team Workload</h3>
              <button type="button" onClick={() => navigate('/dashboard/agencies')}
                className="text-brand-blue text-sm font-medium hover:underline inline-flex items-center gap-1">
                View Team <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {workload.map((w) => (
                <div key={w.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{w.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-teal" style={{ width: `${Math.min(100, (w.cases / 50) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{w.cases}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">SLA Risk Alerts</h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{slaAlerts.length}</span>
            </div>
            <div className="space-y-3">
              {slaAlerts.length === 0 ? (
                <div className="text-center py-4 text-sm text-green-600 font-medium">✅ No active SLA alerts</div>
              ) : (
                slaAlerts.map((a) => (
                  <div key={a.id} className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{a.id}: {a.msg}</div>
                      <div className="text-xs text-slate-500">{a.time}</div>
                    </div>
                    <button type="button" onClick={() => dismissAlert(a.id)} className="text-xs text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}