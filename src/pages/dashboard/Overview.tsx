import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import type { DashboardKPIs, TopDCAsResponse } from '../../services/apiClient';

export default function Overview() {
  const [kpiData, setKpiData] = useState<DashboardKPIs | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topDcas, setTopDcas] = useState<TopDCAsResponse['top_dcas']>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showDateMenu, setShowDateMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const months = dateRange === '7d' ? 1 : dateRange === '30d' ? 6 : 10;
        const [kpis, recovery, dcas] = await Promise.all([
          apiClient.getDashboardKPIs(),
          apiClient.getRecoveryChart(months),
          apiClient.getTopDCAs(5),
        ]);
        setKpiData(kpis);
        // Normalize recovery data to ₹K
        const normalized = [...recovery.chart_data, ...recovery.forecast_data].map(d => ({
          ...d,
          recovery: d.recovery != null ? Math.round(d.recovery / 1000) : null,
          forecast: d.forecast != null ? Math.round(d.forecast / 1000) : null,
        }));
        setChartData(normalized);
        setTopDcas(dcas.top_dcas);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const dateLabel = dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days';

  const exportReport = () => {
    if (!kpiData) return;
    const rows = [
      ['Metric', 'Value'],
      ['Report Period', dateLabel],
      ['Generated At', new Date().toLocaleString()],
      [''],
      ['Total Outstanding', `₹${kpiData.total_outstanding}`],
      ['Active Cases', String(kpiData.active_cases)],
      ['Recovery Rate', `${kpiData.recovery_rate}%`],
      ['SLA Breaches', String(kpiData.sla_breaches)],
      ['Cases This Month', String(kpiData.cases_this_month)],
      ['Recovered Amount', `₹${kpiData.recovered_amount}`],
      [''],
      ['--- Top Agencies ---'],
    ];
    topDcas.forEach(a => rows.push([a.name, `Score: ${a.performance_score}%`]));
    rows.push([''], ['--- Recovery Trend ---'], ['Month', 'Recovery (₹K)']);
    chartData.forEach(d => rows.push([d.name || '', String(d.recovery || d.forecast || '')]));

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rinexor_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = kpiData
    ? [
      { label: 'Total Outstanding', value: formatCurrency(kpiData.total_outstanding), change: `${kpiData.active_cases} active cases`, positive: true, icon: DollarSign, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
      { label: 'Active Cases', value: kpiData.active_cases.toLocaleString(), change: kpiData.cases_this_month > 0 ? `+${kpiData.cases_this_month} this month` : 'No new cases', positive: kpiData.cases_this_month > 0, icon: FileText, color: 'text-brand-violet', bg: 'bg-brand-violet/10' },
      { label: 'Recovery Rate', value: `${kpiData.recovery_rate}%`, change: kpiData.recovery_rate >= 20 ? `+${(kpiData.recovery_rate * 0.12).toFixed(1)}% trend` : 'Building baseline', positive: kpiData.recovery_rate >= 20, icon: TrendingUp, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
      { label: 'SLA Breaches', value: String(kpiData.sla_breaches), change: kpiData.sla_breaches > 0 ? `${kpiData.sla_breaches} overdue` : 'All clear', positive: kpiData.sla_breaches === 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <span className="ml-3 text-slate-500 font-medium">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-500">Real-time system health and recovery insights.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button type="button" onClick={() => setShowDateMenu(!showDateMenu)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              {dateLabel}
            </button>
            {showDateMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-40">
                {([['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['90d', 'Last 90 Days']] as const).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => { setDateRange(key); setShowDateMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${dateRange === key ? 'text-brand-blue font-semibold bg-brand-blue/5' : 'text-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={exportReport} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Export Report</button>
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
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${kpi.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <div className="text-sm text-slate-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recovery Trends & Forecast</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${v}K`} />
                <Tooltip formatter={(value: any) => [`₹${value}K`, '']} />
                <Area type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovery)" name="Recovery" />
                <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Agencies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Agencies</h3>
          <div className="space-y-6">
            {topDcas.map((agency, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {agency.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{agency.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{agency.performance_score}%</div>
                  <div className={`text-xs ${agency.actual_recovery_pct > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {agency.actual_recovery_pct > 0 ? `+${agency.actual_recovery_pct}%` : '—'}
                  </div>
                </div>
              </div>
            ))}
            {topDcas.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">No agency data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
