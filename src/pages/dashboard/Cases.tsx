import { useMemo, useState } from 'react';
import { Search, Filter, MoreHorizontal, Clock, AlertTriangle, ArrowUpRight, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCases, type SLAStatus, type CaseRow } from '../../context/CaseContext';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function Cases() {
  const { user } = useAuth();
  const { cases: allCases, addCase, updateCase } = useCases();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'high-priority' | 'overdue' | 'closed'>('all');
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | SLAStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── New Case Modal State ───
  const [showNewCase, setShowNewCase] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newCase, setNewCase] = useState({
    customer: '', enterprise: '', amount: '', agency: '', agent: '',
    score: 75, slaDays: 7, status: 'Active',
  });

  // ─── DCA Agent Modals ───
  const [statusModal, setStatusModal] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('In Progress');
  const [noteText, setNoteText] = useState('');
  const [proofFile, setProofFile] = useState<string | null>(null);

  const createNewCase = () => {
    if (!newCase.customer.trim() || !newCase.amount.trim()) return;
    const caseId = `CS-${9000 + allCases.length + Math.floor(Math.random() * 100)}`;
    const slaLabel = newCase.slaDays <= 1 ? `${newCase.slaDays * 24}h Left` : `${newCase.slaDays} Days Left`;
    const slaStatus: SLAStatus = newCase.slaDays <= 1 ? 'at_risk' : newCase.slaDays <= 0 ? 'breached' : 'on_track';
    const row: CaseRow = {
      id: caseId,
      customer: newCase.customer,
      enterprise: newCase.enterprise || 'TechFlow',
      amount: `₹${newCase.amount}`,
      agency: newCase.agency || 'Unassigned',
      agent: newCase.agent || 'Unassigned',
      score: newCase.score,
      sla: slaLabel,
      slaStatus,
      status: newCase.status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addCase(row);
    setShowNewCase(false);
    setNewCase({ customer: '', enterprise: '', amount: '', agency: '', agent: '', score: 75, slaDays: 7, status: 'Active' });
    setToast(`Case ${caseId} created successfully`);
    setTimeout(() => setToast(null), 3000);
  };

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

  const cases = useMemo(() => {
    if (user?.role === 'enterprise_admin') {
      return allCases.filter((c) => c.enterprise === 'TechFlow');
    }
    if (user?.role === 'dca_agent') {
      return allCases.filter((c) => c.agency === 'Global Collections');
    }
    return allCases;
  }, [allCases, user?.role]);

  const columns = getColumns();

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

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCases, currentPage]);

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
      {/* Toast */}
      {toast && <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm font-medium">{toast}</div>}

      {/* ─── Update Status Modal ─── */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Update Status — {statusModal}</h3>
              <button type="button" onClick={() => setStatusModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white mb-4">
              <option>Active</option>
              <option>In Progress</option>
              <option>Negotiating</option>
              <option>Resolved</option>
              <option>Escalated</option>
              <option>Closed</option>
            </select>
            <button type="button" onClick={() => {
              updateCase(statusModal, { status: selectedStatus });
              setToast(`${statusModal} status updated to "${selectedStatus}"`);
              setTimeout(() => setToast(null), 3000);
              setStatusModal(null);
            }}
              className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">
              Save Status
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Notes Modal ─── */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Add Note — {notesModal}</h3>
              <button type="button" onClick={() => { setNotesModal(null); setNoteText(''); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {/* Show existing notes */}
            {(() => {
              try {
                const existing: { text: string; time: string }[] = JSON.parse(localStorage.getItem(`rinexor_notes_${notesModal}`) || '[]');
                if (existing.length > 0) return (
                  <div className="mb-4 max-h-32 overflow-y-auto space-y-2">
                    {existing.map((n, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg text-xs">
                        <span className="text-slate-400">{n.time}</span>
                        <p className="text-slate-700 mt-0.5">{n.text}</p>
                      </div>
                    ))}
                  </div>
                );
              } catch { /* ignore */ }
              return null;
            })()}
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
              placeholder="Add a note about this case..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-4 resize-none" />
            <button type="button" disabled={!noteText.trim()} onClick={() => {
              const key = `rinexor_notes_${notesModal}`;
              const existing = JSON.parse(localStorage.getItem(key) || '[]');
              existing.push({ text: noteText, time: new Date().toLocaleString() });
              localStorage.setItem(key, JSON.stringify(existing));
              setToast(`Note added to ${notesModal}`);
              setTimeout(() => setToast(null), 3000);
              setNoteText('');
              setNotesModal(null);
            }}
              className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* ─── Upload Proof Modal ─── */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Upload Proof — {proofModal}</h3>
              <button type="button" onClick={() => { setProofModal(null); setProofFile(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center mb-4">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e => {
                const f = e.target.files?.[0];
                setProofFile(f ? f.name : null);
              }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20" />
              {proofFile && <p className="text-sm text-green-600 font-medium mt-2">✓ {proofFile}</p>}
              <p className="text-xs text-slate-400 mt-2">PDF, PNG, JPG, DOC — max 10MB</p>
            </div>
            <button type="button" disabled={!proofFile} onClick={() => {
              const key = `rinexor_proofs_${proofModal}`;
              const existing = JSON.parse(localStorage.getItem(key) || '[]');
              existing.push({ file: proofFile, time: new Date().toLocaleString() });
              localStorage.setItem(key, JSON.stringify(existing));
              setToast(`Proof "${proofFile}" uploaded for ${proofModal}`);
              setTimeout(() => setToast(null), 3000);
              setProofFile(null);
              setProofModal(null);
            }}
              className="w-full px-4 py-2.5 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
              Upload Proof
            </button>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Create New Case</h3>
              <button type="button" onClick={() => setShowNewCase(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name *</label>
                  <input type="text" value={newCase.customer} onChange={e => setNewCase(p => ({ ...p, customer: e.target.value }))}
                    placeholder="e.g. Acme Corp" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Enterprise</label>
                  <select value={newCase.enterprise} onChange={e => setNewCase(p => ({ ...p, enterprise: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue">
                    <option value="">Select Enterprise</option>
                    <option>TechFlow</option>
                    <option>Stark Ind</option>
                    <option>BioNova</option>
                    <option>Wayne Corp</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹) *</label>
                  <input type="text" value={newCase.amount} onChange={e => setNewCase(p => ({ ...p, amount: e.target.value }))}
                    placeholder="e.g. 45,200" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">DCA Agency</label>
                  <select value={newCase.agency} onChange={e => setNewCase(p => ({ ...p, agency: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue">
                    <option value="">Unassigned</option>
                    <option>Global Collections</option>
                    <option>Alpha Recoveries</option>
                    <option>Summit Financial</option>
                    <option>Orbit Recovery</option>
                    <option>Vertex Collections</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Agent</label>
                  <input type="text" value={newCase.agent} onChange={e => setNewCase(p => ({ ...p, agent: e.target.value }))}
                    placeholder="e.g. Agent Ayesha" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select value={newCase.status} onChange={e => setNewCase(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue">
                    <option>Active</option>
                    <option>In Progress</option>
                    <option>Negotiating</option>
                    <option>Escalated</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">AI Priority Score ({newCase.score})</label>
                  <input type="range" min={1} max={100} value={newCase.score} onChange={e => setNewCase(p => ({ ...p, score: Number(e.target.value) }))}
                    className="w-full" />
                  <div className="flex justify-between text-[10px] text-slate-400"><span>Low</span><span>Medium</span><span>High</span></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">SLA Duration (days)</label>
                  <input type="number" min={1} max={90} value={newCase.slaDays} onChange={e => setNewCase(p => ({ ...p, slaDays: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
                </div>
              </div>
              <button type="button" onClick={createNewCase} disabled={!newCase.customer.trim() || !newCase.amount.trim()}
                className="w-full px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <Plus size={16} /> Create Case
              </button>
            </div>
          </div>
        </div>
      )}

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
        {user?.role !== 'dca_agent' ? (
          <button type="button" onClick={() => setShowNewCase(true)} className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
            <Plus size={16} /> New Case
          </button>
        ) : (
          <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
            <ArrowUpRight size={16} /> Update Status
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
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
              {paginatedCases.map((row: any, i) => (
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
                            <div className={`h-full ${priorityStyles(row.score).bar}`} style={{ width: `${row.score}%` }}></div>
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
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
                        <button type="button" onClick={() => { setSelectedStatus(row.status); setStatusModal(row.id); }} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-navy text-white hover:bg-slate-800">Update Status</button>
                        <button type="button" onClick={() => setNotesModal(row.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Add Notes</button>
                        <button type="button" onClick={() => setProofModal(row.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/15">Upload Proof</button>
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <span>
            Showing {filteredCases.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCases.length)} of {filteredCases.length} cases
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border border-slate-200 rounded transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-slate-700 font-medium">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 border border-slate-200 rounded transition-colors ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
