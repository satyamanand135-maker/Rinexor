import React, { useMemo, useRef, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, FileText, Users, ArrowUpRight, UploadCloud, Sparkles, Loader2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

const recoveryData = [
  { name: 'Jan', recovery: 4000, forecast: 4100 },
  { name: 'Feb', recovery: 3000, forecast: 3200 },
  { name: 'Mar', recovery: 2000, forecast: 2400 },
  { name: 'Apr', recovery: 2780, forecast: 2900 },
  { name: 'May', recovery: 1890, forecast: 2100 },
  { name: 'Jun', recovery: 2390, forecast: 2500 },
  { name: 'Jul', recovery: 3490, forecast: 3600 },
  { name: 'Aug', recovery: null, forecast: 4000 },
  { name: 'Sep', recovery: null, forecast: 4500 },
  { name: 'Oct', recovery: null, forecast: 5100 },
];

const dcaPerformanceData = [
  { name: 'Global', recovery: 85, sla: 98 },
  { name: 'Alpha', recovery: 78, sla: 92 },
  { name: 'Summit', recovery: 72, sla: 95 },
  { name: 'Apex', recovery: 65, sla: 88 },
  { name: 'Zenith', recovery: 60, sla: 85 },
];

export default function SuperAdminOverview() {
  const [activeView, setActiveView] = useState<'command_center' | 'ai_allocation'>('command_center');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, string>>>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'parsing' | 'ready' | 'analyzing' | 'done' | 'error'>('idle');
  const [processingMessage, setProcessingMessage] = useState('');
  const [analysis, setAnalysis] = useState<null | {
    summary: { high: number; standard: number; low: number; totalAmount: number; highAmount: number; standardAmount: number; lowAmount: number };
    segments: { high: PayerRow[]; standard: PayerRow[]; low: PayerRow[] };
  }>(null);
  const [overrideDca, setOverrideDca] = useState<{ high?: string; standard?: string; low?: string }>({});
  const [confirmed, setConfirmed] = useState<{ high?: boolean; standard?: boolean; low?: boolean }>({});

  type RiskCategory = 'High Priority' | 'Standard Priority' | 'Low Priority';

  type PayerRow = {
    customerId: string;
    outstandingAmount: number;
    paymentHistory: string;
    numberOfDelays: number;
    pastDefaults: number;
    riskCategory: RiskCategory;
    riskReason: string;
    recommendedDca: string;
    confidence: number;
  };

  const dcaPool = useMemo(() => {
    const rows = dcaPerformanceData.map((d) => ({
      name: `${d.name} Collections`,
      recovery: d.recovery,
      sla: d.sla,
    }));

    return rows.sort((a, b) => {
      const aScore = a.recovery * 0.7 + a.sla * 0.3;
      const bScore = b.recovery * 0.7 + b.sla * 0.3;
      return bScore - aScore;
    });
  }, []);

  const handleFiles = async (file: File) => {
    setUploadedFile(file);
    setProcessingStatus('parsing');
    setProcessingMessage('Parsing file and preparing preview...');
    setAnalysis(null);
    setConfirmed({});
    setOverrideDca({});

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      const parseCsvText = (text: string) => {
        const lines = text.split(/\r?\n/).filter(Boolean);
        const raw = lines.slice(0, 51).map((line) => line.split(',').map((v) => v.trim()));
        return raw;
      };

      let grid: any[][] = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        grid = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false }) as any[][];
      } else {
        const text = await file.text();
        grid = parseCsvText(text);
      }

      const headers = (grid[0] || []).map((h) => String(h ?? '').trim()).filter(Boolean);
      const rows = (grid.slice(1) || []).slice(0, 25).map((r) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = String(r[idx] ?? '');
        });
        return obj;
      });

      setPreviewHeaders(headers);
      setPreviewRows(rows);
      setProcessingStatus('ready');
      setProcessingMessage('File ready. Click “Analyze with AI” to segment payers and recommend DCAs.');
    } catch (e) {
      setProcessingStatus('error');
      setProcessingMessage('Unable to parse the uploaded file. Please upload a valid .csv or .xlsx.');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFiles(file);
  };

  const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

  const analyzeWithAi = () => {
    setProcessingStatus('analyzing');
    setProcessingMessage('AI is analyzing historical behavior and optimizing DCA allocation...');

    setTimeout(() => {
      const columns = previewHeaders;
      const lookup: Record<string, string> = {};
      columns.forEach((c) => (lookup[normalizeKey(c)] = c));

      const get = (row: Record<string, string>, keys: string[]) => {
        for (const key of keys) {
          const actual = lookup[normalizeKey(key)];
          if (actual && row[actual] != null) return row[actual];
        }
        return '';
      };

      const rows = (previewRows.length ? previewRows : []).slice(0, 25);
      const base = rows.map((r, idx) => {
        const customerId = get(r, ['Customer ID', 'CustomerId', 'Customer', 'ID', 'Payer ID', 'PayerId']) || `CUST-${1000 + idx}`;
        const amountRaw = get(r, ['Outstanding Amount', 'OutstandingAmount', 'Amount', 'Due', 'Balance']) || String(5000 + idx * 275);
        const delaysRaw = get(r, ['Number of Delays', 'Delays', 'Delay Count', 'DelayCount']) || String(idx % 5);
        const defaultsRaw = get(r, ['Past Defaults', 'Defaults', 'PastDefaults', 'DefaultCount']) || String(idx % 3 === 0 ? 1 : 0);
        const history = get(r, ['Payment History', 'PaymentHistory', 'History', 'Notes']) || (idx % 3 === 0 ? 'Late payments in last 90 days' : idx % 2 === 0 ? 'Occasional delays' : 'Consistently on-time');

        const outstandingAmount = Number(String(amountRaw).replace(/[^0-9.]/g, '')) || 0;
        const numberOfDelays = Number(String(delaysRaw).replace(/[^0-9]/g, '')) || 0;
        const pastDefaults = Number(String(defaultsRaw).replace(/[^0-9]/g, '')) || 0;

        let riskCategory: RiskCategory = 'Low Priority';
        let riskReason = 'Consistent payment behavior with minimal delays.';

        if (pastDefaults >= 1 || numberOfDelays >= 3) {
          riskCategory = 'High Priority';
          riskReason = pastDefaults >= 1 ? 'Past defaults detected; elevated risk of non-payment.' : 'Frequent delays; requires immediate intervention.';
        } else if (numberOfDelays >= 1) {
          riskCategory = 'Standard Priority';
          riskReason = 'Occasional delays; typically recovers with normal follow-ups.';
        }

        const pickDca = (bucket: RiskCategory) => {
          if (bucket === 'High Priority') return dcaPool[0];
          if (bucket === 'Standard Priority') return dcaPool[Math.min(2, dcaPool.length - 1)];
          return dcaPool[Math.min(4, dcaPool.length - 1)];
        };

        const recommended = pickDca(riskCategory);
        const confidenceBase = riskCategory === 'High Priority' ? 0.92 : riskCategory === 'Standard Priority' ? 0.84 : 0.78;
        const confidence = Math.round((confidenceBase + Math.min(outstandingAmount / 250000, 0.05)) * 100);

        return {
          customerId: String(customerId),
          outstandingAmount,
          paymentHistory: String(history),
          numberOfDelays,
          pastDefaults,
          riskCategory,
          riskReason,
          recommendedDca: recommended?.name || 'Global Collections',
          confidence,
        };
      });

      const high = base.filter((r) => r.riskCategory === 'High Priority');
      const standard = base.filter((r) => r.riskCategory === 'Standard Priority');
      const low = base.filter((r) => r.riskCategory === 'Low Priority');

      const sum = (arr: PayerRow[]) => arr.reduce((s, r) => s + r.outstandingAmount, 0);
      const summary = {
        high: high.length,
        standard: standard.length,
        low: low.length,
        totalAmount: sum(base),
        highAmount: sum(high),
        standardAmount: sum(standard),
        lowAmount: sum(low),
      };

      setAnalysis({ summary, segments: { high, standard, low } });
      setProcessingStatus('done');
      setProcessingMessage('AI analysis complete. Review segmentation and confirm DCA assignments.');
    }, 1200);
  };

  const recommendationFor = (segment: 'high' | 'standard' | 'low') => {
    if (!analysis) return null;
    const list = analysis.segments[segment];
    const recommended = list[0]?.recommendedDca;
    const confidence = Math.round(list.reduce((s, r) => s + r.confidence, 0) / Math.max(list.length, 1));
    return { recommended, confidence };
  };

  const allocationCards = useMemo(() => {
    if (!analysis) return [];
    const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
    return [
      { key: 'high', label: 'High Priority', count: analysis.summary.high, amount: fmt(analysis.summary.highAmount), color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
      { key: 'standard', label: 'Standard Priority', count: analysis.summary.standard, amount: fmt(analysis.summary.standardAmount), color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
      { key: 'low', label: 'Low Priority', count: analysis.summary.low, amount: fmt(analysis.summary.lowAmount), color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
    ];
  }, [analysis]);

  const kpis = [
    { label: 'Total Active Cases', value: '154,230', change: '+12.5%', icon: FileText, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Total Outstanding', value: '$45.2M', change: '+8.2%', icon: DollarSign, color: 'text-brand-violet', bg: 'bg-brand-violet/10' },
    { label: 'Overall Recovery Rate', value: '68.4%', change: '+5.4%', icon: TrendingUp, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'Total Registered DCAs', value: '45', change: '+3', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'SLA Breaches', value: '12', change: '-4', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
           <p className="text-slate-500">Platform owner & AI brain — upload payer data, run segmentation, assign DCAs, and monitor global recovery outcomes.</p>
        </div>
        <div className="flex gap-2">
           <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Last 30 Days</button>
           <button type="button" className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800">Export Global Report</button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('command_center')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'command_center'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Command Center
          </button>
          <button
            type="button"
            onClick={() => setActiveView('ai_allocation')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'ai_allocation'
                ? 'border-brand-violet text-brand-violet'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            AI Allocation Engine
          </button>
        </div>
      </div>

      {activeView === 'ai_allocation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Recovery Data</h2>
                <p className="text-sm text-slate-500">Upload .csv or .xlsx historical payer data for AI-driven risk segmentation and DCA allocation.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Choose File
                </button>
                <button
                  type="button"
                  disabled={processingStatus !== 'ready'}
                  onClick={analyzeWithAi}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    processingStatus === 'ready'
                      ? 'bg-brand-navy text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Runs a mock AI model for demo purposes"
                >
                  <Sparkles size={16} /> Analyze with AI
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFiles(f);
              }}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="mt-5 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
                  <UploadCloud size={22} />
                </div>
                <div className="text-sm font-semibold text-slate-900">Drag & drop a file here</div>
                <div className="text-xs text-slate-500">Supported: .csv, .xlsx</div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              {processingStatus === 'parsing' || processingStatus === 'analyzing' ? (
                <Loader2 className="text-brand-blue animate-spin" size={18} />
              ) : (
                <Info className="text-slate-400" size={18} />
              )}
              <div>
                <div className="text-sm font-medium text-slate-900">Processing status</div>
                <div className="text-sm text-slate-500">{processingMessage || 'Upload a file to begin.'}</div>
              </div>
            </div>

            {uploadedFile && (
              <div className="mt-5 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{uploadedFile.name}</div>
                    <div className="text-xs text-slate-500">Previewing first rows and columns</div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{previewRows.length} rows</span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        {previewHeaders.slice(0, 8).map((h) => (
                          <th key={h} className="px-3 py-2 whitespace-nowrap font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.slice(0, 8).map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {previewHeaders.slice(0, 8).map((h) => (
                            <td key={h} className="px-3 py-2 whitespace-nowrap text-slate-700">{r[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {analysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allocationCards.map((c) => (
                  <div key={c.key} className={`p-5 rounded-xl border shadow-sm ${c.bg} ${c.border}`}>
                    <div className={`text-xs font-bold uppercase tracking-wide ${c.color}`}>{c.label}</div>
                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-2xl font-bold text-slate-900">{c.count}</div>
                      <div className="text-sm font-semibold text-slate-700">{c.amount}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Cases • Total Amount</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Payer Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          dataKey="value"
                          nameKey="name"
                          data={[
                            { name: 'High', value: analysis.summary.high },
                            { name: 'Standard', value: analysis.summary.standard },
                            { name: 'Low', value: analysis.summary.low },
                          ]}
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {['#ef4444', '#f59e0b', '#10b981'].map((color, idx) => (
                            <Cell key={idx} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">AI segments payers by delay patterns, defaults, and outstanding amount.</div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Intelligent DCA Assignment</h3>
                    <span className="text-xs text-slate-500">Mapped by recovery rate + SLA compliance</span>
                  </div>

                  {(
                    [
                      { key: 'high' as const, label: 'High Priority', pill: 'bg-red-50 text-red-700 border-red-100' },
                      { key: 'standard' as const, label: 'Standard Priority', pill: 'bg-amber-50 text-amber-700 border-amber-100' },
                      { key: 'low' as const, label: 'Low Priority', pill: 'bg-green-50 text-green-700 border-green-100' },
                    ]
                  ).map((seg) => {
                    const rec = recommendationFor(seg.key);
                    const recommended = overrideDca[seg.key] || rec?.recommended || '—';
                    return (
                      <div key={seg.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 mb-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${seg.pill}`}>{seg.label}</span>
                            <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                              <span className="font-semibold text-slate-900">Recommended DCA:</span>
                              <span className="font-semibold text-brand-blue">{recommended}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet font-bold">{rec?.confidence ?? 0}% confidence</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={overrideDca[seg.key] || ''}
                              onChange={(e) => setOverrideDca((p) => ({ ...p, [seg.key]: e.target.value || undefined }))}
                              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm text-slate-700"
                            >
                              <option value="">Auto (recommended)</option>
                              {dcaPool.map((d) => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setConfirmed((p) => ({ ...p, [seg.key]: true }))}
                              className={`px-3 py-2 rounded-lg text-sm font-semibold ${confirmed[seg.key] ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-brand-navy text-white hover:bg-slate-800'}`}
                            >
                              {confirmed[seg.key] ? 'Confirmed' : 'Confirm'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(
                [
                  { key: 'high' as const, title: 'High Priority (High Risk Payers)', tag: 'bg-red-50 text-red-700 border-red-100' },
                  { key: 'standard' as const, title: 'Standard Priority (Medium Risk Payers)', tag: 'bg-amber-50 text-amber-700 border-amber-100' },
                  { key: 'low' as const, title: 'Low Priority (On-Time Payers)', tag: 'bg-green-50 text-green-700 border-green-100' },
                ]
              ).map((seg) => {
                const list = analysis.segments[seg.key];
                return (
                  <div key={seg.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{seg.title}</div>
                        <div className="text-sm text-slate-500">AI explanation: delays + defaults + history text (mocked for demo).</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${seg.tag}`}>{list.length} cases</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3 whitespace-nowrap">Customer ID</th>
                            <th className="px-6 py-3 whitespace-nowrap">Outstanding</th>
                            <th className="px-6 py-3 whitespace-nowrap">Delays</th>
                            <th className="px-6 py-3 whitespace-nowrap">Defaults</th>
                            <th className="px-6 py-3 whitespace-nowrap">AI Reason</th>
                            <th className="px-6 py-3 whitespace-nowrap">Recommended DCA</th>
                            <th className="px-6 py-3 whitespace-nowrap">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {list.slice(0, 8).map((r) => (
                            <tr key={`${seg.key}-${r.customerId}`} className="hover:bg-slate-50">
                              <td className="px-6 py-3 font-semibold text-brand-blue whitespace-nowrap">{r.customerId}</td>
                              <td className="px-6 py-3 font-semibold text-slate-900 whitespace-nowrap">${Math.round(r.outstandingAmount).toLocaleString()}</td>
                              <td className="px-6 py-3 text-slate-700 whitespace-nowrap">{r.numberOfDelays}</td>
                              <td className="px-6 py-3 text-slate-700 whitespace-nowrap">{r.pastDefaults}</td>
                              <td className="px-6 py-3 text-slate-600 min-w-[280px]">{r.riskReason}</td>
                              <td className="px-6 py-3 text-slate-700 whitespace-nowrap">{overrideDca[seg.key] || r.recommendedDca}</td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand-violet/10 text-brand-violet">{r.confidence}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-500 flex items-center justify-between">
                      <span>Showing {Math.min(list.length, 8)} of {list.length} cases</span>
                      <span className="text-xs">Assignment status: <span className="font-semibold text-slate-700">{confirmed[seg.key] ? 'Confirmed' : 'Pending'}</span></span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {activeView === 'command_center' && (
        <>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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
              <LineChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} name="Recovery ($)" />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={false} name="AI Forecast ($)" />
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
                <BarChart data={dcaPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={50} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="recovery" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Recovery Rate %" />
                  <Bar dataKey="sla" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="SLA Score" />
                </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Metric Breakdown</h4>
              {dcaPerformanceData.slice(0, 3).map((dca, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{dca.name} Collections</span>
                  <div className="flex gap-4">
                    <span className="text-brand-blue font-bold">{dca.recovery}% Rec.</span>
                    <span className="text-green-600 font-bold">{dca.sla} SLA</span>
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