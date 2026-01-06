import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';

const data = [
  { name: 'Jan', recovery: 4000 },
  { name: 'Feb', recovery: 3000 },
  { name: 'Mar', recovery: 2000 },
  { name: 'Apr', recovery: 2780 },
  { name: 'May', recovery: 1890 },
  { name: 'Jun', recovery: 2390 },
  { name: 'Jul', recovery: 3490 },
];

const forecastData = [
  { name: 'Aug', value: 4000 },
  { name: 'Sep', value: 4500 },
  { name: 'Oct', value: 5100 },
  { name: 'Nov', value: 5800 },
];

export default function Overview() {
  const kpis = [
    { label: 'Total Outstanding', value: '$12,450,000', change: '+2.5%', icon: DollarSign, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Active Cases', value: '3,842', change: '-1.2%', icon: FileText, color: 'text-brand-violet', bg: 'bg-brand-violet/10' }, // FileText import needed
    { label: 'Recovery Rate', value: '68.4%', change: '+5.4%', icon: TrendingUp, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'SLA Breaches', value: '12', change: '-4', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
           <p className="text-slate-500">Real-time system health and recovery insights.</p>
        </div>
        <div className="flex gap-2">
           <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Last 30 Days</button>
           <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Export Report</button>
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
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${kpi.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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
              <AreaChart data={[...data, ...forecastData]}>
                <defs>
                  <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovery)" />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Agencies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Agencies</h3>
           <div className="space-y-6">
              {[
                { name: 'Global Collections', score: 98, trend: '+12%' },
                { name: 'Alpha Recoveries', score: 94, trend: '+8%' },
                { name: 'Summit Financial', score: 91, trend: '+5%' },
                { name: 'Apex Solutions', score: 88, trend: '-2%' },
                { name: 'Zenith Partners', score: 85, trend: '+1%' },
              ].map((agency, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {agency.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{agency.name}</span>
                   </div>
                   <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{agency.score}%</div>
                      <div className={`text-xs ${agency.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{agency.trend}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
