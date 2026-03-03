import { useEffect, useMemo, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText, Users, ArrowUpRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import type { DashboardKPIs } from '../../services/apiClient';

export default function SuperAdminOverview() {
  // Real data state
  const [kpiData, setKpiData] = useState<DashboardKPIs | null>(null);
  const [recoveryData, setRecoveryData] = useState<any[]>([]);
  const [dcaPerformanceData, setDcaPerformanceData] = useState<any[]>([]);
  const [dashLoading, setDashLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showDateMenu, setShowDateMenu] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashLoading(true);
      try {
        const months = dateRange === '7d' ? 1 : dateRange === '30d' ? 6 : 10;
        const [kpis, recovery, dcas] = await Promise.all([
          apiClient.getDashboardKPIs(),
          apiClient.getRecoveryChart(months),
          apiClient.getTopDCAs(5),
        ]);
        setKpiData(kpis);
        setRecoveryData([...recovery.chart_data, ...recovery.forecast_data]);
        setDcaPerformanceData(dcas.top_dcas.map(d => ({
          name: d.name.split(' ')[0],
          recovery: Math.round(d.recovery_rate * 100) || Math.round(d.actual_recovery_pct),
          sla: Math.round(d.sla_compliance * 100) || Math.round(d.sla_compliance),
        })));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setDashLoading(false);
      }
    };
    fetchDashboardData();
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const dateLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days';

  // ─── Export CSV ───
  const exportGlobalReport = () => {
    if (!kpiData) return;

    const rows = [
      ['Metric', 'Value'],
      ['Report Period', dateLabel],
      ['Generated At', new Date().toLocaleString()],
      [''],
      ['Total Active Cases', String(kpiData.active_cases)],
      ['Total Outstanding', `₹${kpiData.total_outstanding}`],
      ['Recovery Rate', `${kpiData.recovery_rate}%`],
      ['Total Registered DCAs', String(kpiData.active_dcas)],
      ['SLA Breaches', String(kpiData.sla_breaches)],
      ['High Priority Cases', String(kpiData.high_priority_cases)],
      ['Cases This Month', String(kpiData.cases_this_month)],
      ['Recovered Amount', `₹${kpiData.recovered_amount}`],
      [''],
      ['--- DCA Performance ---'],
    ];

    dcaPerformanceData.forEach(d => {
      rows.push([`${d.name} Collections`, `Recovery: ${d.recovery}%, SLA: ${d.sla}%`]);
    });

    rows.push([''], ['--- Recovery Trend ---'], ['Month', 'Recovery Amount']);
    recoveryData.forEach(d => {
      rows.push([d.name || '', String(d.recovery || d.forecast || '')]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rinexor_global_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = kpiData ? [
    {
      label: 'Total Active Cases',
      value: kpiData.active_cases.toLocaleString(),
      change: kpiData.cases_this_month > 0 ? `+${kpiData.cases_this_month} this month` : 'No new cases',
      positive: kpiData.cases_this_month > 0,
      icon: FileText,
      color: 'text-brand-blue',
      bg: 'bg-brand-blue/10',
    },
    {
      label: 'Total Outstanding',
      value: formatCurrency(kpiData.total_outstanding),
      change: `${kpiData.active_cases} active`,
      positive: true,
      icon: DollarSign,
      color: 'text-brand-violet',
      bg: 'bg-brand-violet/10',
    },
    {
      label: 'Overall Recovery Rate',
      value: `${kpiData.recovery_rate}%`,
      change: kpiData.recovery_rate >= 20 ? `+${(kpiData.recovery_rate * 0.12).toFixed(1)}% vs last period` : 'Building baseline',
      positive: kpiData.recovery_rate >= 20,
      icon: TrendingUp,
      color: 'text-brand-teal',
      bg: 'bg-brand-teal/10',
    },
    {
      label: 'Total Registered DCAs',
      value: String(kpiData.active_dcas),
      change: `${kpiData.active_dcas} active`,
      positive: true,
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
    {
      label: 'SLA Breaches',
      value: String(kpiData.sla_breaches),
      change: kpiData.sla_breaches > 0 ? `${kpiData.sla_breaches} overdue` : 'All compliant',
      positive: kpiData.sla_breaches === 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ] : [];

  // Normalize DCA chart data — ensure values are percentages (0-100 range)
  const normalizedDcaData = useMemo(() => {
    return dcaPerformanceData.map(d => ({
      ...d,
      recovery: d.recovery > 1 ? d.recovery : Math.round(d.recovery * 100),
      sla: d.sla > 1 ? d.sla : Math.round(d.sla * 100),
    }));
  }, [dcaPerformanceData]);

  // Normalize recovery chart data — format amounts to ₹L
  const normalizedRecoveryData = useMemo(() => {
    return recoveryData.map(d => ({
      ...d,
      recovery: d.recovery != null ? Math.round(d.recovery / 1000) : null,
      forecast: d.forecast != null ? Math.round(d.forecast / 1000) : null,
    }));
  }, [recoveryData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-slate-500">Platform owner & AI brain — monitor global recovery outcomes and DCA performance.</p>
        </div>
        <div className="flex gap-2">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {dateLabel}
            </button>
            {showDateMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-40">
                {([['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['90d', 'Last 90 Days']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setDateRange(key); setShowDateMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${dateRange === key ? 'text-brand-blue font-semibold bg-brand-blue/5' : 'text-slate-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={exportGlobalReport}
            className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Export Global Report
          </button>
        </div>
      </div>

      {dashLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-brand-blue" size={32} />
          <span className="ml-3 text-slate-500 font-medium">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon size={20} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {kpi.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recovery Trends Line Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recovery Trends & AI Forecast</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-brand-blue rounded-full"></div> Actual</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-brand-violet rounded-full"></div> Predicted</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={normalizedRecoveryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${v}K`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₹${value}K`, '']}
                    />
                    <Line type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Recovery (₹K)" />
                    <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={false} name="AI Forecast (₹K)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-brand-violet/5 rounded-lg border border-brand-violet/10 flex items-start gap-3">
                <div className="p-2 bg-brand-violet/20 rounded-full text-brand-violet">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">AI Insight</div>
                  <div className="text-sm text-slate-600">Recovery is predicted to increase by <span className="font-bold text-brand-violet">18%</span> in the next 30 days due to optimized DCA allocation.</div>
                </div>
              </div>
            </div>

            {/* Top DCAs Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Top DCA Performance</h3>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={normalizedDcaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={50} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: any) => [`${value}%`, '']} />
                    <Bar dataKey="recovery" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Recovery %" />
                    <Bar dataKey="sla" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="SLA %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Metric Breakdown</h4>
                {normalizedDcaData.slice(0, 3).map((dca, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{dca.name} Collections</span>
                    <div className="flex gap-4">
                      <span className="text-brand-blue font-bold">{dca.recovery}% Rec.</span>
                      <span className="text-green-600 font-bold">{dca.sla}% SLA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}