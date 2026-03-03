import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Download, Calendar, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import type { ReportsData } from '../../services/apiClient';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

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
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedRange, setAppliedRange] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';
  const isDca = user?.role === 'dca_agent';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getReportsData();
        setReportsData(data);
      } catch (err) {
        console.error('Failed to fetch reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const recoveryData = reportsData?.recovery_comparison || [];
  const slaTrendData = reportsData?.sla_trends || [];
  const ageingData = reportsData?.ageing_data || [];
  const agentComparisonData = reportsData?.dca_comparison || [];
  const dcaKeys = reportsData?.dca_keys || [];
  const kpis = reportsData?.kpis;

  // ─── Export All Reports Data as CSV ───
  const exportAllData = () => {
    const rows = [
      ['Rinexor Reports Export'],
      ['Generated At', new Date().toLocaleString()],
      appliedRange ? ['Date Range', appliedRange] : ['Date Range', 'All time'],
      [''],
      ['--- Key Metrics ---'],
      ['Recovery Rate', `${kpis?.recovery_rate || 0}%`],
      ['SLA Compliance', `${kpis?.sla_compliance || 0}%`],
      ['Recovered Amount', `₹${kpis?.recovered_amount || 0}`],
      [''],
      ['--- SLA Trends ---'],
      ['Month', 'Compliant %', 'Breached %'],
      ...slaTrendData.map(d => [d.month, String(d.compliant), String(d.breached)]),
      [''],
      ['--- Case Ageing ---'],
      ['Bucket', 'Cases', 'Amount'],
      ...ageingData.map(d => [d.bucket, String(d.cases), String(d.amount)]),
      [''],
      ['--- DCA Comparison ---'],
      ['Agent', 'Recovery %', 'SLA %'],
      ...agentComparisonData.map((d: any) => [d.full_name || d.agent, String(d.recovery), String(d.sla)]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rinexor_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Generate and Download Individual Report ───
  const downloadReport = (report: typeof reportCatalog[0]) => {
    let content = '';
    const header = `${report.name}\nGenerated: ${new Date().toLocaleString()}\nScope: ${report.scope}\n\n`;

    if (report.name.includes('Recovery')) {
      content = header + 'Month,Recovery Amount\n';
      if (recoveryData.length > 0) {
        content += recoveryData.map((d: any) => {
          const vals = Object.entries(d).filter(([k]) => k !== 'month').map(([, v]) => v);
          return `${d.month},${vals.join(',')}`;
        }).join('\n');
      } else {
        content += 'No data available for the selected period';
      }
    } else if (report.name.includes('SLA')) {
      content = header + 'Month,Compliant %,Breached %\n';
      content += slaTrendData.map(d => `${d.month},${d.compliant},${d.breached}`).join('\n');
    } else if (report.name.includes('Agency') || report.name.includes('Comparison')) {
      content = header + 'Agent,Recovery %,SLA %\n';
      content += agentComparisonData.map((d: any) => `${d.full_name || d.agent},${d.recovery},${d.sla}`).join('\n');
    } else if (report.name.includes('Ageing')) {
      content = header + 'Bucket,Cases,Amount\n';
      content += ageingData.map(d => `${d.bucket},${d.cases},${d.amount}`).join('\n');
    } else if (report.name.includes('Forecast')) {
      content = header + 'Metric,Value\n';
      content += `Recovery Rate,${kpis?.recovery_rate || 0}%\n`;
      content += `SLA Compliance,${kpis?.sla_compliance || 0}%\n`;
      content += `Recovered Amount,₹${kpis?.recovered_amount || 0}\n`;
    } else {
      content = header + 'Metric,Value\n';
      content += `Recovery Rate,${kpis?.recovery_rate || 0}%\n`;
      content += `SLA Compliance,${kpis?.sla_compliance || 0}%\n`;
      content += `Recovered Amount,₹${kpis?.recovered_amount || 0}\n`;
    }

    const ext = report.type === 'CSV' ? 'csv' : report.type === 'Excel' ? 'csv' : 'txt';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Apply Date Range ───
  const applyDateRange = () => {
    if (dateFrom && dateTo) {
      setAppliedRange(`${dateFrom} to ${dateTo}`);
    }
    setShowDatePicker(false);
  };

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
          {/* Date Range Picker */}
          <div className="relative">
            <button type="button" onClick={() => setShowDatePicker(!showDatePicker)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Calendar size={16} /> {appliedRange || 'Date Range'}
            </button>
            {showDatePicker && (
              <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-4 w-72">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-900">Select Date Range</span>
                  <button type="button" onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex gap-2">
                    {[['Last 7 Days', 7], ['Last 30 Days', 30], ['Last 90 Days', 90]].map(([label, days]) => (
                      <button key={String(label)} type="button" onClick={() => {
                        const to = new Date();
                        const from = new Date();
                        from.setDate(from.getDate() - (days as number));
                        setDateFrom(from.toISOString().split('T')[0]);
                        setDateTo(to.toISOString().split('T')[0]);
                      }} className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-100">{label}</button>
                    ))}
                  </div>
                  <button type="button" onClick={applyDateRange} className="w-full px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Apply</button>
                </div>
              </div>
            )}
          </div>
          <button type="button" onClick={exportAllData} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-brand-blue" size={32} />
          <span className="ml-3 text-slate-500 font-medium">Loading reports data...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {isDca && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovery Success Rate</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{kpis?.recovery_rate || 0}%</div>
                <div className="text-xs text-slate-500 mt-1">Last 30 days</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">SLA Compliance</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{kpis?.sla_compliance || 0}%</div>
                <div className="text-xs text-slate-500 mt-1">Target: 98%</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovered Amount</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(kpis?.recovered_amount || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">Total recovered</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ageing Cases</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{ageingData.find(d => d.bucket === '90+')?.cases || 0}</div>
                <div className="text-xs text-slate-500 mt-1">90+ days overdue</div>
              </div>
            </div>
          )}

          {!isDca && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovery Rate</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{kpis?.recovery_rate || 0}%</div>
                <div className="text-xs text-slate-500 mt-1">{appliedRange || 'Last 30 days'}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">SLA Compliance</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{kpis?.sla_compliance || 0}%</div>
                <div className="text-xs text-slate-500 mt-1">Target: 98%</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recovered Amount</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(kpis?.recovered_amount || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">Total portfolio recovery</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DCA Performance Comparison — Super Admin */}
            {isSuperAdmin && recoveryData.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">DCA Performance Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recoveryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: any) => [`₹${(value / 1000).toFixed(1)}K`, '']} />
                      <Legend />
                      {dcaKeys.map((dca, idx) => (
                        <Bar key={dca.key} dataKey={dca.key} name={dca.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Agent-wise Comparison — Enterprise Admin */}
            {isEnterpriseAdmin && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Agent-wise Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="agent" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: any) => [`${value}%`, '']} />
                      <Legend />
                      <Bar dataKey="recovery" name="Recovery %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sla" name="SLA %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recovery Volume Line */}
            <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${isDca ? 'col-span-2' : ''}`}>
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                {isDca ? 'My Recovery Volume' : 'Overall Recovery Volume'}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
                    <Tooltip formatter={(value: any) => [`₹${(value / 1000).toFixed(1)}K`, '']} />
                    <Legend />
                    {dcaKeys.slice(0, 1).map((dca) => (
                      <Line key={dca.key} type="monotone" dataKey={dca.key} name="Volume (₹)" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
                    ))}
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
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="compliant" name="Compliant %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="breached" name="Breaches %" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Case Ageing */}
            {isEnterpriseAdmin && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Case Ageing Report</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
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
                    <div className="text-2xl font-bold text-slate-900 mt-1">{kpis?.sla_compliance || 0}%</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-xs text-amber-700">At Risk</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{Math.max(0, 100 - (kpis?.sla_compliance || 0) - 2)}%</div>
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
                    { title: `Recovery rate at ${kpis?.recovery_rate || 0}% across all DCAs`, detail: 'Opportunity: enforce auto-escalation for agencies below 90% compliance.' },
                    { title: `Total recovered: ${formatCurrency(kpis?.recovered_amount || 0)}`, detail: 'Driver: improved DCA allocation and score threshold tuning.' },
                    { title: `${ageingData.find(d => d.bucket === '90+')?.cases || 0} cases in 90+ day bucket`, detail: 'Suggestion: raise priority weight for ageing between 31-60 days.' },
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
        </>
      )}

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
                <button
                  type="button"
                  onClick={() => downloadReport(report)}
                  className="text-brand-blue hover:underline text-sm font-medium flex items-center gap-1"
                >
                  <Download size={14} /> Download
                </button>
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
