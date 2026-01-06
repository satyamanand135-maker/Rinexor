import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const recoveryData = [
  { month: 'Jan', agencyA: 4000, agencyB: 2400, agencyC: 2400 },
  { month: 'Feb', agencyA: 3000, agencyB: 1398, agencyC: 2210 },
  { month: 'Mar', agencyA: 2000, agencyB: 9800, agencyC: 2290 },
  { month: 'Apr', agencyA: 2780, agencyB: 3908, agencyC: 2000 },
  { month: 'May', agencyA: 1890, agencyB: 4800, agencyC: 2181 },
  { month: 'Jun', agencyA: 2390, agencyB: 3800, agencyC: 2500 },
];

const slaTrendData = [
  { month: 'Jan', compliant: 96, breached: 4 },
  { month: 'Feb', compliant: 95, breached: 5 },
  { month: 'Mar', compliant: 92, breached: 8 },
  { month: 'Apr', compliant: 94, breached: 6 },
  { month: 'May', compliant: 93, breached: 7 },
  { month: 'Jun', compliant: 95, breached: 5 },
];

const ageingData = [
  { bucket: '0-30', cases: 450 },
  { bucket: '31-60', cases: 320 },
  { bucket: '61-90', cases: 210 },
  { bucket: '90+', cases: 120 },
];

const agentComparisonData = [
  { agent: 'Ayesha', recovery: 68, sla: 96 },
  { agent: 'Rohan', recovery: 61, sla: 92 },
  { agent: 'Sana', recovery: 63, sla: 94 },
  { agent: 'Meera', recovery: 57, sla: 90 },
  { agent: 'Vikram', recovery: 49, sla: 88 },
];

const reportCatalog = [
  { name: 'Monthly Recovery Summary', scope: 'System', type: 'PDF', size: '2.4 MB', date: 'Jan 01, 2026' },
  { name: 'SLA Compliance Trends', scope: 'System', type: 'PDF', size: '1.8 MB', date: 'Dec 28, 2025' },
  { name: 'Agency Comparison Report', scope: 'System', type: 'Excel', size: '1.1 MB', date: 'Dec 20, 2025' },
  { name: 'Enterprise Case Ageing', scope: 'Enterprise', type: 'PDF', size: '980 KB', date: 'Dec 15, 2025' },
  { name: 'Recovery Performance (My Cases)', scope: 'DCA', type: 'CSV', size: '650 KB', date: 'Dec 12, 2025' },
  { name: 'AI Forecast Accuracy', scope: 'System', type: 'CSV', size: '850 KB', date: 'Dec 01, 2025' },
];

export default function Reports() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';
  const isDca = user?.role === 'dca_agent';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isDca ? 'My Performance' : isEnterpriseAdmin ? 'Agency Reports' : 'Reports & AI Insights'}
          </h1>
          <p className="text-slate-500">
            {isDca
              ? 'Track your recovery success rate, SLA compliance, and activity outcomes.'
              : isEnterpriseAdmin
                ? 'Manager reporting: agent-wise performance, SLA trends, and recovery outcomes.'
                : 'System-wide recovery trends, AI prediction reports, and platform-level insights.'}
          </p>
        </div>
        <div className="flex gap-2">
           <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
             <Calendar size={16} /> Date Range
           </button>
           <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
             <Download size={16} /> Export
           </button>
        </div>
      </div>

      {isDca && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovery Success Rate</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">62.5%</div>
            <div className="text-xs text-slate-500 mt-1">Last 30 days</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">SLA Compliance</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">92%</div>
            <div className="text-xs text-slate-500 mt-1">Target: 98%</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Cases Resolved</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">38</div>
            <div className="text-xs text-slate-500 mt-1">This month</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">At-Risk SLAs</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">8</div>
            <div className="text-xs text-slate-500 mt-1">Next 72 hours</div>
          </div>
        </div>
      )}

      {!isDca && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovery Rate</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{isEnterpriseAdmin ? '72.5%' : '68.4%'}</div>
            <div className="text-xs text-slate-500 mt-1">Last 30 days</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">SLA Compliance</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{isEnterpriseAdmin ? '94%' : '95%'}</div>
            <div className="text-xs text-slate-500 mt-1">Target: 98%</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">AI Forecast (30 days)</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{isEnterpriseAdmin ? '+$0.8M' : '+$7.1M'}</div>
            <div className="text-xs text-slate-500 mt-1">Predicted recovery uplift</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Comparison Chart */}
         {isSuperAdmin && (
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">DCA Performance Comparison</h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recoveryData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Legend />
                       <Bar dataKey="agencyA" name="Global Collections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="agencyB" name="Alpha Recoveries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="agencyC" name="Summit Financial" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
         )}

         {isEnterpriseAdmin && (
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Agent-wise Comparison</h3>
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={agentComparisonData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="agent" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                   <Tooltip cursor={{fill: '#f8fafc'}} />
                   <Legend />
                   <Bar dataKey="recovery" name="Recovery %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="sla" name="SLA %" fill="#10b981" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
         )}

         {/* Recovery Trend Line */}
         <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${isDca ? 'col-span-2' : ''}`}>
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              {isDca ? 'My Recovery Volume' : 'Overall Recovery Volume'}
            </h3>
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recoveryData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                     <Tooltip />
                     <Legend />
                     <Line type="monotone" dataKey="agencyA" name="Volume ($)" stroke="#14b8a6" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trends */}
        {!isDca && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">SLA Compliance Trends</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slaTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compliant" name="Compliant %" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="breached" name="Breaches %" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Enterprise Case Ageing */}
        {isEnterpriseAdmin && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Case Ageing Report</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="cases" name="Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* DCA SLA Summary */}
        {isDca && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">SLA Compliance Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">On Track</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">92%</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-xs text-amber-700">At Risk</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">6%</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-xs text-red-700">Breached</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">2%</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">Tip: prioritize cases with &lt; 24h SLA and AI score above 80 for maximum recovery yield.</div>
          </div>
        )}

        {isSuperAdmin && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">System-wide Insights</h3>
            <div className="space-y-3">
              {[
                { title: 'High-performing DCAs are clustered in the 90-98% SLA band', detail: 'Opportunity: enforce auto-escalation for agencies below 90% compliance.' },
                { title: 'AI forecast indicates recovery uplift of ~18% next 30 days', detail: 'Driver: improved DCA allocation and score threshold tuning.' },
                { title: 'Breach concentration in 31-60 day buckets', detail: 'Suggestion: raise priority weight for ageing between 31-60 days.' },
              ].map((insight, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900">{insight.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{insight.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 font-bold text-slate-900">
            Available Reports
         </div>
         <div className="divide-y divide-slate-100">
            {reportCatalog
              .filter((r) => (isSuperAdmin ? true : isEnterpriseAdmin ? r.scope !== 'System' || r.name.includes('SLA') : r.scope === 'DCA'))
              .map((report, i) => (
               <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-slate-100 rounded text-slate-500">
                        <FileTextIcon type={report.type} />
                     </div>
                     <div>
                        <div className="font-medium text-slate-900">{report.name}</div>
                        <div className="text-xs text-slate-500">{report.scope} • {report.date} • {report.size}</div>
                     </div>
                  </div>
                  <button type="button" className="text-brand-blue hover:underline text-sm font-medium">Download</button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function FileTextIcon({ type }: { type: string }) {
   return <span className="text-xs font-bold">{type}</span>;
}
