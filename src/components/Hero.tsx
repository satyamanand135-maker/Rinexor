import { Play, BarChart3, Users, CheckCircle2, LayoutDashboard, FileText, PieChart, Settings, Search, Bell, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    navigate('/auth/roles');
  };

  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-brand-teal"></span>
          <span className="text-sm font-medium text-slate-600">New: AI-Driven Risk Prediction Model v2.0</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1]">
          Intelligent Debt Recovery,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-navy via-brand-blue to-brand-violet">Orchestrated at Scale.</span>
        </h1>

        <p className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
          Rinexor centralizes enterprises and Debt Collection Agencies into one AI-powered platform with real-time visibility, automation, and predictive recovery intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button type="button" onClick={handleDemoClick} className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Play size={18} className="fill-slate-700" /> Explore Platform
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto max-w-6xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal via-brand-blue to-brand-violet rounded-2xl opacity-20 blur-2xl"></div>
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400">Rinexor Dashboard - Enterprise Admin</div>
            </div>
            
            <div className="grid grid-cols-12 min-h-[500px] text-left">
              {/* Sidebar */}
              <div className="col-span-2 hidden md:block border-r border-slate-100 bg-slate-50/30 p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="w-6 h-6 bg-brand-navy rounded-md flex items-center justify-center text-white font-bold text-xs">R</div>
                  <span className="font-bold text-slate-900 text-sm">Rinexor</span>
                </div>
                <div className="space-y-1">
                    {[
                      { icon: LayoutDashboard, label: 'Overview', active: true },
                      { icon: FileText, label: 'Cases' },
                      { icon: Users, label: 'Agencies' },
                      { icon: PieChart, label: 'Reports' },
                      { icon: Settings, label: 'Settings' }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${item.active ? 'bg-white text-brand-blue shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="col-span-12 md:col-span-10 p-6 bg-slate-50/10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Enterprise Overview</h2>
                        <p className="text-sm text-slate-500">Welcome back, Sarah</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-200 rounded-lg p-2 text-slate-400">
                          <Search size={18} />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-2 text-slate-400 relative">
                          <Bell size={18} />
                          <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                        </div>
                        <button className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                          <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Recovery', value: '$2,450,230', change: '+12.5%', icon: BarChart3, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
                        { label: 'Active Cases', value: '1,284', change: '-3.2%', icon: Users, color: 'text-brand-violet', bg: 'bg-brand-violet/10' },
                        { label: 'Avg. Resolution', value: '14 Days', change: '-2 Days', icon: CheckCircle2, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
                    ].map((stat, i) => (
                        <div key={i} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-green-50 text-green-600'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Cases Table */}
                <div className="border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recent Priority Cases</h3>
                        <button className="text-sm text-brand-blue font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-5 py-3 font-medium">Case ID</th>
                            <th className="px-5 py-3 font-medium">Customer</th>
                            <th className="px-5 py-3 font-medium">Amount</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">AI Priority</th>
                            <th className="px-5 py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { id: '#CASE-8921', name: 'Acme Corp', amount: '$45,200', status: 'In Progress', score: 'High (92)', scoreColor: 'text-red-600 bg-red-50' },
                            { id: '#CASE-8922', name: 'TechFlow Inc', amount: '$12,850', status: 'Negotiating', score: 'Medium (74)', scoreColor: 'text-amber-600 bg-amber-50' },
                            { id: '#CASE-8923', name: 'Global Logistics', amount: '$8,400', status: 'Pending', score: 'Low (45)', scoreColor: 'text-slate-600 bg-slate-50' },
                            { id: '#CASE-8924', name: 'Stark Industries', amount: '$112,000', status: 'Escalated', score: 'Critical (98)', scoreColor: 'text-brand-violet bg-violet-50' },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4 font-medium text-slate-900">{row.id}</td>
                              <td className="px-5 py-4 text-slate-600">{row.name}</td>
                              <td className="px-5 py-4 font-medium text-slate-900">{row.amount}</td>
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                  <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'In Progress' ? 'bg-blue-500' : row.status === 'Negotiating' ? 'bg-amber-500' : row.status === 'Escalated' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${row.scoreColor}`}>
                                  {row.score}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <button className="text-brand-blue font-medium hover:text-brand-navy text-xs border border-brand-blue/20 hover:border-brand-navy/20 px-3 py-1.5 rounded-md transition-all">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
