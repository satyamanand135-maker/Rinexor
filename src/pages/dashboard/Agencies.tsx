import { useMemo, useState } from 'react';
import { ArrowUpRight, Star, MoreVertical, Users, UserPlus, Activity, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Agencies() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'recoveryRate' | 'sla' | 'cases' | 'avgDays'>('recoveryRate');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const isSuperAdmin = user?.role === 'super_admin';
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';

  const teamMembers = useMemo(() => {
    return [
      { name: 'Agent Ayesha', role: 'Senior Collector', assigned: 42, sla: 96, recovery: 68, status: 'Active' },
      { name: 'Agent Rohan', role: 'Collector', assigned: 35, sla: 92, recovery: 61, status: 'Active' },
      { name: 'Agent Meera', role: 'Collector', assigned: 28, sla: 90, recovery: 57, status: 'Active' },
      { name: 'Agent Vikram', role: 'Trainee', assigned: 18, sla: 88, recovery: 49, status: 'Onboarding' },
      { name: 'Agent Sana', role: 'Collector', assigned: 31, sla: 94, recovery: 63, status: 'Active' },
    ];
  }, []);

  const teamTotals = useMemo(() => {
    const totalAgents = teamMembers.length;
    const totalAssigned = teamMembers.reduce((s, a) => s + a.assigned, 0);
    const avgWorkload = totalAgents ? Math.round(totalAssigned / totalAgents) : 0;
    const avgSla = totalAgents ? Math.round(teamMembers.reduce((s, a) => s + a.sla, 0) / totalAgents) : 0;
    return { totalAgents, totalAssigned, avgWorkload, avgSla };
  }, [teamMembers]);

  const getAgencies = () => {
    const allAgencies = [
      { name: 'Global Collections', cases: 450, recoveryRate: 68, sla: 98, avgTime: '12 Days', status: 'Active' },
      { name: 'Alpha Recoveries', cases: 320, recoveryRate: 62, sla: 95, avgTime: '15 Days', status: 'Active' },
      { name: 'Summit Financial', cases: 210, recoveryRate: 58, sla: 92, avgTime: '18 Days', status: 'Active' },
      { name: 'Apex Solutions', cases: 180, recoveryRate: 55, sla: 88, avgTime: '20 Days', status: 'Under Review' },
      { name: 'Zenith Partners', cases: 150, recoveryRate: 52, sla: 85, avgTime: '22 Days', status: 'Inactive' },
      { name: 'Orbit Recovery', cases: 98, recoveryRate: 71, sla: 96, avgTime: '11 Days', status: 'Active' },
      { name: 'Vertex Collections', cases: 76, recoveryRate: 64, sla: 90, avgTime: '16 Days', status: 'Active' },
    ];

    if (user?.role === 'enterprise_admin') {
      // Simulating Enterprise Admin having assigned agencies
      return allAgencies.slice(0, 3);
    }
    
    return allAgencies;
  };

  const agencies = getAgencies();
 
  const sortedAgencies = useMemo(() => {
    const parseAvgDays = (avgTime: string) => {
      const n = Number(avgTime.split(' ')[0]);
      return Number.isFinite(n) ? n : 0;
    };
 
    const rows = [...agencies].sort((a, b) => {
      const aAvg = parseAvgDays(a.avgTime);
      const bAvg = parseAvgDays(b.avgTime);
      const dir = sortDir === 'desc' ? -1 : 1;
 
      if (sortBy === 'recoveryRate') return (a.recoveryRate - b.recoveryRate) * dir;
      if (sortBy === 'sla') return (a.sla - b.sla) * dir;
      if (sortBy === 'cases') return (a.cases - b.cases) * dir;
      return (aAvg - bAvg) * dir;
    });
 
    return rows;
  }, [agencies, sortBy, sortDir]);
 
  const totals = useMemo(() => {
    const totalCases = agencies.reduce((sum, a) => sum + a.cases, 0);
    const avgRecovery = agencies.length ? agencies.reduce((sum, a) => sum + a.recoveryRate, 0) / agencies.length : 0;
    const avgSla = agencies.length ? agencies.reduce((sum, a) => sum + a.sla, 0) / agencies.length : 0;
    return {
      totalCases,
      avgRecovery: Math.round(avgRecovery * 10) / 10,
      avgSla: Math.round(avgSla * 10) / 10,
    };
  }, [agencies]);

  if (isEnterpriseAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-500">Manage employees, balance workloads, and track agent performance & SLA adherence.</p>
          </div>
          <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2">
            <UserPlus size={16} /> Add Employee
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Employees</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.totalAgents}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Assigned Cases</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.totalAssigned}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg Workload</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.avgWorkload}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg SLA</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{teamTotals.avgSla}%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">Employee Directory</div>
            <div className="text-xs text-slate-500">Workload • Recovery • SLA</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Employee</th>
                  <th className="px-6 py-4 whitespace-nowrap">Assigned</th>
                  <th className="px-6 py-4 whitespace-nowrap">Recovery</th>
                  <th className="px-6 py-4 whitespace-nowrap">SLA</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue" style={{ width: `${Math.min(100, (m.assigned / 50) * 100)}%` }} />
                        </div>
                        <span className="font-semibold text-slate-700">{m.assigned}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-slate-700">
                        <Activity size={16} className="text-brand-teal" />
                        <span className="font-semibold">{m.recovery}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.sla >= 95 ? 'bg-green-50 text-green-700' : m.sla >= 90 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {m.sla}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15">Assign Cases</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
            <span>Tip: keep workload variance low to reduce SLA breach probability.</span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <ShieldAlert size={14} /> SLA risk alerts are surfaced in Case Distribution.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">
             {isSuperAdmin ? 'All Registered DCAs' : 'Assigned Agencies'}
           </h1>
           <p className="text-slate-500">
             {isSuperAdmin ? 'Monitor and evaluate performance of all agencies on the platform.' : 'Manage DCAs assigned to your enterprise.'}
           </p>
        </div>
        {isSuperAdmin && (
          <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
             Onboard New Agency
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total DCAs</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{agencies.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active Cases (Assigned)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totals.totalCases.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg. Recovery / SLA</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totals.avgRecovery}% <span className="text-slate-400 font-semibold">/</span> {totals.avgSla}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="font-bold text-slate-900">Agency Performance Directory</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700"
            >
              <option value="recoveryRate">Sort: Recovery Rate</option>
              <option value="sla">Sort: SLA Compliance</option>
              <option value="cases">Sort: Active Cases</option>
              <option value="avgDays">Sort: Avg Resolution Time</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as typeof sortDir)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700"
            >
              <option value="desc">High → Low</option>
              <option value="asc">Low → High</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Agency</th>
                <th className="px-6 py-4 whitespace-nowrap">Active Cases</th>
                <th className="px-6 py-4 whitespace-nowrap">Recovery Rate</th>
                <th className="px-6 py-4 whitespace-nowrap">SLA Compliance</th>
                <th className="px-6 py-4 whitespace-nowrap">Avg Resolution</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAgencies.map((agency, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {agency.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{agency.name}</div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={12} className={`${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-semibold">{agency.cases.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-blue" style={{ width: `${Math.min(agency.recoveryRate, 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-brand-blue">{agency.recoveryRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${agency.sla >= 95 ? 'bg-green-50 text-green-700' : agency.sla >= 90 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {agency.sla}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{agency.avgTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${agency.status === 'Active' ? 'bg-green-50 text-green-700' : agency.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {user?.role === 'enterprise_admin' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15">Allocate Cases</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">View</button>
                      </div>
                    ) : (
                      <button type="button" className="text-slate-400 hover:text-slate-600">
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <span>{user?.role === 'super_admin' ? 'System-wide registry view' : 'Enterprise-assigned DCA view'}</span>
          <button type="button" className="text-brand-blue font-medium hover:underline inline-flex items-center gap-1">
            View SLA Details <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
