import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CheckCircle2, Clock, Target, ArrowUpRight, AlertTriangle, Info, X } from 'lucide-react';

const pieData = [
  { name: 'Resolved', value: 400, color: '#10b981' },
  { name: 'In Progress', value: 300, color: '#3b82f6' },
  { name: 'Pending', value: 300, color: '#f59e0b' },
  { name: 'Escalated', value: 100, color: '#ef4444' },
];

export default function DCAPortalOverview() {
  const navigate = useNavigate();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activity, setActivity] = useState({ calls: '', visits: '', promises: '', collected: '', remarks: '' });

  // Urgent alert: visible until dismissed, reappears when new at-risk cases are added
  const urgentCaseCount = 3; // number of current at-risk cases
  const [alertDismissed, setAlertDismissed] = useState(() => {
    const saved = localStorage.getItem('rinexor_alert_dismissed_count');
    return saved === String(urgentCaseCount);
  });

  const handleViewCases = () => {
    setAlertDismissed(true);
    localStorage.setItem('rinexor_alert_dismissed_count', String(urgentCaseCount));
    navigate('/dashboard/cases');
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const submitActivity = () => {
    const log = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      ...activity,
    };
    const key = 'rinexor_daily_activities';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(log);
    localStorage.setItem(key, JSON.stringify(existing));
    setActivity({ calls: '', visits: '', promises: '', collected: '', remarks: '' });
    setShowActivityModal(false);
    showToast('Daily activity submitted');
  };

  const kpis = [
    { label: 'Assigned Cases', value: '145', change: '+12', icon: Target, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Amount Under Collection', value: '$2.4M', change: '+15%', icon: CheckCircle2, color: 'text-brand-violet', bg: 'bg-brand-violet/10' },
    { label: 'Recovery Rate', value: '62.5%', change: '+2%', icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Upcoming SLA Deadlines', value: '8', change: 'Urgent', icon: Clock, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const caseActions = [
    { id: 'CX-001', name: 'Acme Logistics', amount: '$45,000', score: 98, sla: '4h left', action: 'Contacted → Promised' },
    { id: 'CX-005', name: 'TechStart Inc', amount: '$12,500', score: 95, sla: '1d left', action: 'Send reminder' },
    { id: 'CX-012', name: 'Global Trade', amount: '$8,200', score: 92, sla: '2d left', action: 'Follow-up call' },
    { id: 'CX-018', name: 'Beta Systems', amount: '$22,000', score: 88, sla: '3d left', action: 'Upload proof' },
    { id: 'CX-023', name: 'Omega Corp', amount: '$15,600', score: 85, sla: '5d left', action: 'Add remarks' },
  ];

  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const handleAction = (caseId: string, action: string) => {
    setCompletedActions(prev => [...prev, caseId]);
    showToast(`${caseId}: "${action}" completed`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm font-medium">{toast}</div>}

      {/* Daily Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Update Daily Activity</h3>
              <button type="button" onClick={() => setShowActivityModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Calls Made</label>
                  <input type="number" min={0} value={activity.calls} onChange={e => setActivity(p => ({ ...p, calls: e.target.value }))}
                    placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Field Visits</label>
                  <input type="number" min={0} value={activity.visits} onChange={e => setActivity(p => ({ ...p, visits: e.target.value }))}
                    placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Payment Promises</label>
                  <input type="number" min={0} value={activity.promises} onChange={e => setActivity(p => ({ ...p, promises: e.target.value }))}
                    placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Amount Collected (₹)</label>
                  <input type="text" value={activity.collected} onChange={e => setActivity(p => ({ ...p, collected: e.target.value }))}
                    placeholder="e.g. 25,000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Remarks / Notes</label>
                <textarea value={activity.remarks} onChange={e => setActivity(p => ({ ...p, remarks: e.target.value }))} rows={3}
                  placeholder="Summary of today's work..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" />
              </div>
              <button type="button" onClick={submitActivity}
                className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                Submit Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Alert Panel — disappears after clicking View Cases */}
      {!alertDismissed && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Urgent Attention Required</h3>
            <p className="text-sm text-slate-600 mt-1">
              {urgentCaseCount} high-value cases are approaching SLA breach in less than 24 hours. Please review priority list below.
            </p>
          </div>
          <button onClick={handleViewCases} className="ml-auto px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
            View Cases
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Work Overview</h1>
          <p className="text-slate-500">Execute assigned recovery cases, update progress, and stay ahead of SLA deadlines.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowActivityModal(true)} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm shadow-brand-navy/20">Update Daily Activity</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${kpi.change === 'Urgent' ? 'bg-red-100 text-red-700 font-bold' : kpi.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="text-sm text-slate-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Cases List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">My Assigned Cases (AI Priority)</h3>
            <div className="group relative">
              <Info size={16} className="text-slate-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                AI Score is calculated based on propensity to pay, past behavior, and debt age. Higher score = higher recovery chance.
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Case ID</th>
                  <th className="px-6 py-4">Debtor Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">AI Score</th>
                  <th className="px-6 py-4">SLA Timer</th>
                  <th className="px-6 py-4">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseActions.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.id}</td>
                    <td className="px-6 py-4 text-slate-600">{row.name}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{row.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue" style={{ width: `${row.score}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-brand-blue">{row.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${row.sla.includes('h') ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {row.sla}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {completedActions.includes(row.id) ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">✓ Done</span>
                      ) : (
                        <button onClick={() => handleAction(row.id, row.action)}
                          className="text-xs font-bold text-white bg-brand-blue px-3 py-1.5 rounded-lg hover:bg-brand-navy transition-colors shadow-sm shadow-brand-blue/30">
                          {row.action}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Case Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}