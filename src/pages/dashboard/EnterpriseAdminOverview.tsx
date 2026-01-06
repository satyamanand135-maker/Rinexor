import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText, AlertTriangle, Users, ArrowUpRight } from 'lucide-react';

export default function EnterpriseAdminOverview() {
  const kpis = [
    { label: 'Total Assigned Cases', value: '1,100', change: '+2.5%', icon: FileText, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Amount Under Recovery', value: '$4.2M', change: '+$0.3M', icon: DollarSign, color: 'text-brand-violet', bg: 'bg-brand-violet/10' },
    { label: 'Agency Recovery Rate', value: '72.5%', change: '+1.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'SLA Risk Alerts', value: '12', change: 'Watchlist', icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Employees / Agents', value: '18', change: '+1', icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  ];

  const workload = [
    { name: 'Ayesha', cases: 42 },
    { name: 'Rohan', cases: 35 },
    { name: 'Sana', cases: 31 },
    { name: 'Meera', cases: 28 },
    { name: 'Vikram', cases: 18 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Agency Overview</h1>
           <p className="text-slate-500">DCA owner / manager workspace: distribute cases to employees, track SLA risk, and monitor recovery performance.</p>
        </div>
        <div className="flex gap-2">
           <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Open Case Distribution</button>
           <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Create SLA Rule</button>
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
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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
            <span className="text-xs text-slate-500">Incoming cases from Super Admin allocation</span>
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
                {[
                  { id: 'CS-9312', amount: '$45,200', priority: 'High', sla: '6h left' },
                  { id: 'CS-9288', amount: '$12,850', priority: 'Standard', sla: '2d left' },
                  { id: 'CS-9271', amount: '$8,500', priority: 'Standard', sla: '3d left' },
                  { id: 'CS-9204', amount: '$156,000', priority: 'High', sla: '12h left' },
                ].map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-blue">{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{c.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.sla.includes('h') ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{c.sla}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="text-xs font-bold bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:bg-brand-navy">Assign Agent</button>
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
                    data={[{ value: 94, color: '#10b981' }, { value: 6, color: '#f1f5f9' }]}
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
                <span className="text-3xl font-bold text-slate-900">94%</span>
                <span className="text-xs text-slate-500">Compliant</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">Breach warnings appear when &lt; 24h remaining</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Team Workload</h3>
              <button type="button" className="text-brand-blue text-sm font-medium hover:underline inline-flex items-center gap-1">
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
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">3</span>
            </div>
            <div className="space-y-3">
              {[
                { id: 'CS-9204', msg: 'High risk: 12h left', time: '5m ago' },
                { id: 'CS-9312', msg: 'High priority: 6h left', time: '22m ago' },
                { id: 'CS-9182', msg: 'Breach warning: 18h left', time: '1h ago' },
              ].map((a) => (
                <div key={a.id} className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <AlertCircle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{a.id}: {a.msg}</div>
                    <div className="text-xs text-slate-500">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}