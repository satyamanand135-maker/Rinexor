import { useMemo, useState } from 'react';
import { Search, Filter, MoreHorizontal, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type SLAStatus = 'on_track' | 'at_risk' | 'breached';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

type CaseRow = {
  id: string;
  customer: string;
  enterprise?: string;
  amount: string;
  agency?: string;
  agent?: string;
  score: number;
  sla: string;
  slaStatus: SLAStatus;
  status: string;
  createdAt: string; // YYYY-MM-DD
};

export default function Cases() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'high-priority' | 'overdue' | 'closed'>('all');
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | SLAStatus>('all');

  const getColumns = () => {
    if (user?.role === 'super_admin') {
      return [
        { header: 'Case ID', key: 'id' },
        { header: 'Enterprise', key: 'enterprise' },
        { header: 'Amount', key: 'amount' },
        { header: 'Assigned DCA', key: 'agency' },
        { header: 'AI Priority Score', key: 'score' },
        { header: 'SLA Status', key: 'sla' },
        { header: 'Case Status', key: 'status' },
      ];
    } else if (user?.role === 'enterprise_admin') {
      return [
        { header: 'Case ID', key: 'id' },
        { header: 'Customer', key: 'customer' },
        { header: 'Amount', key: 'amount' },
        { header: 'Assigned Agent', key: 'agent' },
        { header: 'AI Priority Score', key: 'score' },
        { header: 'SLA Timer', key: 'sla' },
        { header: 'Status', key: 'status' },
      ];
    } else {
      // DCA Agent
      return [
        { header: 'Case ID', key: 'id' },
        { header: 'Customer', key: 'customer' },
        { header: 'Amount', key: 'amount' },
        { header: 'AI Priority Score', key: 'score' },
        { header: 'SLA Timer', key: 'sla' },
        { header: 'Status', key: 'status' },
      ];
    }
  };

  const getCases = (): CaseRow[] => {
    const commonData: CaseRow[] = [
      { id: 'CS-8921', customer: 'Acme Corp', enterprise: 'TechFlow', amount: '$45,200', agency: 'Global Collections', agent: 'Agent Ayesha', score: 92, sla: '2 Days Left', slaStatus: 'on_track', status: 'In Progress', createdAt: '2025-12-18' },
      { id: 'CS-8922', customer: 'TechFlow Inc', enterprise: 'TechFlow', amount: '$12,850', agency: 'Alpha Recoveries', agent: 'Agent Rohan', score: 74, sla: '5 Days Left', slaStatus: 'on_track', status: 'Negotiating', createdAt: '2025-12-22' },
      { id: 'CS-8923', customer: 'Stark Ind', enterprise: 'Stark Ind', amount: '$112,000', agency: 'Summit Financial', agent: 'Agent Sana', score: 98, sla: 'Overdue', slaStatus: 'breached', status: 'Escalated', createdAt: '2025-11-29' },
      { id: 'CS-8924', customer: 'Wayne Ent', enterprise: 'TechFlow', amount: '$8,500', agency: 'Global Collections', agent: 'Unassigned', score: 65, sla: '10 Days Left', slaStatus: 'on_track', status: 'Active', createdAt: '2025-12-28' },
      { id: 'CS-8925', customer: 'Cyberdyne', enterprise: 'Stark Ind', amount: '$156,000', agency: 'Global Collections', agent: 'Agent Meera', score: 88, sla: '1 Day Left', slaStatus: 'at_risk', status: 'In Progress', createdAt: '2025-12-10' },
      { id: 'CS-8926', customer: 'Massive Dynamic', enterprise: 'TechFlow', amount: '$23,400', agency: 'Alpha Recoveries', agent: 'Agent Vikram', score: 45, sla: '15 Days Left', slaStatus: 'on_track', status: 'Active', createdAt: '2025-12-05' },
      { id: 'CS-8927', customer: 'Hooli', enterprise: 'Stark Ind', amount: '$67,000', agency: 'Summit Financial', score: 82, sla: '3 Days Left', slaStatus: 'on_track', status: 'Negotiating', createdAt: '2025-12-12' },
      { id: 'CS-8928', customer: 'Umbrella Health', enterprise: 'BioNova', amount: '$18,900', agency: 'Zenith Partners', score: 90, sla: '6h Left', slaStatus: 'at_risk', status: 'In Progress', createdAt: '2025-12-30' },
      { id: 'CS-8929', customer: 'Globex', enterprise: 'BioNova', amount: '$9,250', agency: 'Apex Solutions', score: 33, sla: '12 Days Left', slaStatus: 'on_track', status: 'Active', createdAt: '2025-12-02' },
      { id: 'CS-8930', customer: 'Initech', enterprise: 'TechFlow', amount: '$6,500', agency: 'Global Collections', score: 58, sla: 'Closed', slaStatus: 'on_track', status: 'Closed', createdAt: '2025-10-14' },
    ];

    if (user?.role === 'enterprise_admin') {
      return commonData.filter((c) => c.enterprise === 'TechFlow');
    }

    if (user?.role === 'dca_agent') {
      return commonData.filter((c) => c.agency === 'Global Collections');
    }

    return commonData;
  };

  const columns = getColumns();
  const cases = getCases();

  const enterprises = useMemo(() => {
    const list = Array.from(new Set(cases.map((c) => c.enterprise).filter(Boolean) as string[]));
    list.sort();
    return list;
  }, [cases]);

  const filteredCases = useMemo(() => {
    let rows = [...cases];

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => {
        return (
          r.id.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          (r.enterprise || '').toLowerCase().includes(q) ||
          (r.agency || '').toLowerCase().includes(q)
        );
      });
    }

    if (dateFrom) rows = rows.filter((r) => r.createdAt >= dateFrom);
    if (dateTo) rows = rows.filter((r) => r.createdAt <= dateTo);

    if (user?.role === 'super_admin' && enterpriseFilter !== 'all') {
      rows = rows.filter((r) => r.enterprise === enterpriseFilter);
    }

    if (priorityFilter !== 'all') {
      rows = rows.filter((r) => {
        if (priorityFilter === 'high') return r.score >= 80;
        if (priorityFilter === 'medium') return r.score >= 50 && r.score < 80;
        return r.score < 50;
      });
    }

    if (slaFilter !== 'all') {
      rows = rows.filter((r) => r.slaStatus === slaFilter);
    }

    if (activeTab === 'active') {
      rows = rows.filter((r) => r.status !== 'Closed');
    } else if (activeTab === 'high-priority') {
      rows = rows.filter((r) => r.score >= 80);
    } else if (activeTab === 'overdue') {
      rows = rows.filter((r) => r.slaStatus === 'breached' || r.slaStatus === 'at_risk');
    } else if (activeTab === 'closed') {
      rows = rows.filter((r) => r.status === 'Closed');
    }

    return rows;
  }, [activeTab, cases, dateFrom, dateTo, enterpriseFilter, priorityFilter, query, slaFilter, user?.role]);

  const baseCounts = useMemo(() => {
    const all = cases;
    return {
      highPriority: all.filter((c) => c.score >= 80).length,
      slaRisk: all.filter((c) => c.slaStatus !== 'on_track').length,
    };
  }, [cases]);

  const tabs = [
    { id: 'all', label: user?.role === 'dca_agent' ? 'Assigned' : 'All Cases' },
    { id: 'active', label: 'Active' },
    { id: 'high-priority', label: 'High Priority', count: baseCounts.highPriority },
    { id: 'overdue', label: 'SLA Risk', count: baseCounts.slaRisk },
    { id: 'closed', label: 'Closed' },
  ] as const;

  const priorityLabel = (score: number) => (score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low');
  const priorityStyles = (score: number) => {
    if (score >= 80) return { bar: 'bg-brand-violet', tag: 'bg-brand-violet/10 text-brand-violet' };
    if (score >= 50) return { bar: 'bg-brand-blue', tag: 'bg-brand-blue/10 text-brand-blue' };
    return { bar: 'bg-brand-teal', tag: 'bg-brand-teal/10 text-brand-teal' };
  };

  const slaPillStyles = (slaStatus: SLAStatus) => {
    if (slaStatus === 'breached') return 'bg-red-50 text-red-700 border-red-100';
    if (slaStatus === 'at_risk') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">
             {user?.role === 'super_admin'
               ? 'Case Intelligence'
               : user?.role === 'enterprise_admin'
                 ? 'Case Distribution'
                 : 'My Assigned Cases'}
           </h1>
           <p className="text-slate-500">
             {user?.role === 'super_admin'
               ? 'Read-only view across all DCAs with risk and allocation context.'
               : user?.role === 'enterprise_admin'
                 ? 'Assign and rebalance cases across employees while managing SLA risk.'
                 : 'Execute recovery tasks, update status, add notes, and upload proof.'}
           </p>
        </div>
        <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
          <ArrowUpRight size={16} /> {user?.role === 'dca_agent' ? 'Update Status' : 'New Case'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {'count' in tab && tab.count ? (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-brand-blue/10' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                user?.role === 'super_admin'
                  ? 'Search case ID, customer, enterprise, or DCA...'
                  : user?.role === 'enterprise_admin'
                    ? 'Search case ID, customer, or assigned agent...'
                    : 'Search my case ID or customer...'
              }
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            />
          </div>

          <div className="lg:col-span-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            />
          </div>

          <div className="lg:col-span-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            />
          </div>

          {user?.role === 'super_admin' && (
            <div className="lg:col-span-2">
              <select
                value={enterpriseFilter}
                onChange={(e) => setEnterpriseFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
              >
                <option value="all">All Enterprises</option>
                {enterprises.map((ent) => (
                  <option key={ent} value={ent}>{ent}</option>
                ))}
              </select>
            </div>
          )}

          <div className={user?.role === 'super_admin' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className={user?.role === 'super_admin' ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value as 'all' | SLAStatus)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            >
              <option value="all">All SLA</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="breached">Breached</option>
            </select>
          </div>

          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              className="w-full lg:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-2"
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredCases.length}</span> of <span className="font-semibold text-slate-700">{cases.length}</span> cases
          </div>
          <div className="text-xs text-slate-500">
            AI priority is a composite score used for orchestration and routing.
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-4 font-medium whitespace-nowrap">{col.header}</th>
                ))}
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((row: any, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.key === 'id' ? (
                        <div>
                          <div className="font-medium text-brand-blue">{row[col.key]}</div>
                          <div className="text-xs text-slate-500">Opened {row.createdAt}</div>
                        </div>
                      ) : col.key === 'score' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${priorityStyles(row.score).bar}`} style={{width: `${row.score}%`}}></div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${priorityStyles(row.score).tag}`}>
                            {priorityLabel(row.score)} · {row.score}
                          </span>
                        </div>
                      ) : col.key === 'sla' ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${slaPillStyles(row.slaStatus)}`}>
                          <Clock size={12} /> {row.sla}
                        </span>
                      ) : col.key === 'status' ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          row.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 
                          row.status === 'Escalated' ? 'bg-red-50 text-red-700' :
                          row.status === 'Negotiating' ? 'bg-amber-50 text-amber-700' :
                          row.status === 'Closed' ? 'bg-slate-100 text-slate-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {row.status === 'Escalated' && <AlertTriangle size={12} />}
                          {row.status}
                        </span>
                      ) : (
                        <span className={col.key === 'amount' ? 'font-medium text-slate-900' : 'text-slate-600'}>
                          {row[col.key]}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    {user?.role === 'enterprise_admin' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15">Assign Agent</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Reassign</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Escalate</button>
                      </div>
                    ) : user?.role === 'dca_agent' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-navy text-white hover:bg-slate-800">Update Status</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Add Notes</button>
                        <button type="button" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/15">Upload Proof</button>
                      </div>
                    ) : (
                      <button type="button" className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <span>Showing 1-{Math.min(filteredCases.length, 10)} of {filteredCases.length} cases</span>
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50" disabled>Previous</button>
            <button type="button" className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
