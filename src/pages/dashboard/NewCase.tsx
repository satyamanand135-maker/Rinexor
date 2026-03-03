import { useState, useMemo } from 'react';
import { Save, Play, X, Info, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCases, type CaseRow, type SLAStatus } from '../../context/CaseContext';

type CaseType = 'loan' | 'credit_card' | 'subscription' | 'invoice' | 'other';
type PaymentMode = 'installment' | 'one_time';
type RiskLevel = 'low' | 'medium' | 'high';
type DefaultHistory = 'none' | 'occasional' | 'frequent';

interface AIResult {
    priorityScore: number;
    riskClassification: 'High' | 'Medium' | 'Low';
    suggestedDCATier: 'Top' | 'Standard' | 'Low Risk';
    suggestedSLA: number;
    decisionLogic: string;
}

export default function NewCase() {
    const navigate = useNavigate();
    const { addCase } = useCases();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [showAITooltip, setShowAITooltip] = useState(false);

    // Case Overview
    const caseId = useMemo(() => `CS-${Date.now().toString().slice(-6)}`, []);
    const createdDate = new Date().toISOString().split('T')[0];
    const [enterpriseName, setEnterpriseName] = useState('');
    const [caseType, setCaseType] = useState<CaseType>('loan');
    const [expectedSLA, setExpectedSLA] = useState(30);

    // Debtor Information
    const [debtorName, setDebtorName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [riskNotes, setRiskNotes] = useState('');

    // Financial Details
    const [outstandingAmount, setOutstandingAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [dueDate, setDueDate] = useState('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>('one_time');
    const [previousAttempts, setPreviousAttempts] = useState(false);

    // Historical Behavior (AI Signals)
    const [paymentDelayFrequency, setPaymentDelayFrequency] = useState<RiskLevel>('low');
    const [defaultHistory, setDefaultHistory] = useState<DefaultHistory>('none');
    const [lastPaymentDate, setLastPaymentDate] = useState('');
    const [totalPastRecoveries, setTotalPastRecoveries] = useState('');
    const [manualRiskIndicator, setManualRiskIndicator] = useState<RiskLevel | ''>('');

    // Assignment Controls
    const [autoAssignDCA, setAutoAssignDCA] = useState(true);
    const [manualDCA, setManualDCA] = useState('');
    const [overrideReason, setOverrideReason] = useState('');

    // Status & Workflow
    const [initialStatus, setInitialStatus] = useState<'open' | 'in_progress'>('open');
    const [escalationEnabled, setEscalationEnabled] = useState(true);
    const [internalNotes, setInternalNotes] = useState('');

    // Calculate Days Past Due
    const daysPastDue = useMemo(() => {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const today = new Date();
        const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }, [dueDate]);

    const enterprises = ['TechFlow', 'Stark Industries', 'BioNova', 'Globex Corp', 'Initech'];
    const dcaAgencies = [
        { id: 'dca1', name: 'Global Collections' },
        { id: 'dca2', name: 'Alpha Recoveries' },
        { id: 'dca3', name: 'Summit Financial' },
        { id: 'dca4', name: 'Zenith Partners' },
        { id: 'dca5', name: 'Apex Solutions' },
    ];

    const runAIAnalysis = () => {
        setIsSubmitting(true);

        // Simulate AI processing
        setTimeout(() => {
            // Calculate mock AI score based on inputs
            let score = 50;
            if (paymentDelayFrequency === 'high') score += 25;
            else if (paymentDelayFrequency === 'medium') score += 15;
            if (defaultHistory === 'frequent') score += 20;
            else if (defaultHistory === 'occasional') score += 10;
            if (daysPastDue > 90) score += 15;
            else if (daysPastDue > 30) score += 10;
            if (previousAttempts) score += 5;

            score = Math.min(100, Math.max(0, score));

            const result: AIResult = {
                priorityScore: score,
                riskClassification: score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low',
                suggestedDCATier: score >= 80 ? 'Top' : score >= 50 ? 'Standard' : 'Low Risk',
                suggestedSLA: score >= 80 ? 7 : score >= 50 ? 14 : 30,
                decisionLogic: `Based on payment behavior patterns (${paymentDelayFrequency} delay frequency), default history (${defaultHistory}), and ${daysPastDue} days past due, the AI model recommends prioritizing this case for ${score >= 80 ? 'immediate attention' : score >= 50 ? 'standard processing' : 'routine follow-up'}.`
            };

            setAiResult(result);
            setIsSubmitting(false);
        }, 1500);
    };

    const handleSaveDraft = () => {
        console.log('Saving draft...');
        navigate('/dashboard/cases');
    };

    const handleCreateCase = () => {
        if (!aiResult) return;

        // Get the selected DCA name
        const selectedDCA = autoAssignDCA
            ? dcaAgencies[Math.floor(Math.random() * dcaAgencies.length)].name
            : dcaAgencies.find(d => d.id === manualDCA)?.name || 'Unassigned';

        // Create the new case object
        const newCase: CaseRow = {
            id: caseId,
            customer: debtorName,
            enterprise: enterpriseName,
            amount: `$${Number(outstandingAmount).toLocaleString()}`,
            agency: selectedDCA,
            agent: 'Unassigned',
            score: aiResult.priorityScore,
            sla: `${aiResult.suggestedSLA} Days Left`,
            slaStatus: 'on_track' as SLAStatus,
            status: initialStatus === 'open' ? 'Active' : 'In Progress',
            createdAt: createdDate,
        };

        // Add to context
        addCase(newCase);

        // Navigate back to cases list
        navigate('/dashboard/cases');
    };

    const priorityStyles = (score: number) => {
        if (score >= 80) return { bar: 'bg-brand-violet', tag: 'bg-brand-violet/10 text-brand-violet', border: 'border-brand-violet/30' };
        if (score >= 50) return { bar: 'bg-brand-blue', tag: 'bg-brand-blue/10 text-brand-blue', border: 'border-brand-blue/30' };
        return { bar: 'bg-brand-teal', tag: 'bg-brand-teal/10 text-brand-teal', border: 'border-brand-teal/30' };
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                        <Link to="/dashboard/cases" className="hover:text-brand-blue transition-colors">Case Intelligence</Link>
                        <span>→</span>
                        <span className="text-slate-700">New Case</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Case</h1>
                    <p className="text-slate-500">Add a new recovery case for AI prioritization and orchestration</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/cases')}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium flex items-center gap-2"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Save size={16} /> Save as Draft
                    </button>
                    <button
                        type="button"
                        onClick={runAIAnalysis}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Play size={16} /> {isSubmitting ? 'Processing...' : 'Save & Run AI'}
                    </button>
                </div>
            </div>

            {/* Section 1: Case Overview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Case ID</label>
                        <input
                            type="text"
                            value={caseId}
                            readOnly
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">Auto-generated</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Enterprise Name *</label>
                        <select
                            value={enterpriseName}
                            onChange={(e) => setEnterpriseName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="">Select enterprise...</option>
                            {enterprises.map((ent) => (
                                <option key={ent} value={ent}>{ent}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Type *</label>
                        <select
                            value={caseType}
                            onChange={(e) => setCaseType(e.target.value as CaseType)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="loan">Loan</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="subscription">Subscription</option>
                            <option value="invoice">Invoice</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Created Date</label>
                        <input
                            type="date"
                            value={createdDate}
                            readOnly
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected SLA (Days)</label>
                        <input
                            type="number"
                            value={expectedSLA}
                            onChange={(e) => setExpectedSLA(Number(e.target.value))}
                            min={1}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Debtor Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Debtor Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Debtor Full Name *</label>
                        <input
                            type="text"
                            value={debtorName}
                            onChange={(e) => setDebtorName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer ID / Reference ID</label>
                        <input
                            type="text"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            placeholder="e.g., CUST-12345"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="debtor@email.com"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Location / Region</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, State"
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Risk Notes (Optional)</label>
                        <input
                            type="text"
                            value={riskNotes}
                            onChange={(e) => setRiskNotes(e.target.value)}
                            placeholder="Any additional risk observations..."
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Financial Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Outstanding Amount *</label>
                        <input
                            type="number"
                            value={outstandingAmount}
                            onChange={(e) => setOutstandingAmount(e.target.value)}
                            placeholder="Enter amount"
                            min={0}
                            step={0.01}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date *</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Days Past Due</label>
                        <input
                            type="text"
                            value={daysPastDue > 0 ? `${daysPastDue} days` : 'Not yet due'}
                            readOnly
                            className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm ${daysPastDue > 90 ? 'border-red-200 text-red-600' :
                                daysPastDue > 30 ? 'border-amber-200 text-amber-600' :
                                    'border-slate-200 text-slate-500'
                                }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Mode</label>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="one_time">One-time Payment</option>
                            <option value="installment">Installment</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Previous Recovery Attempts</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="previousAttempts"
                                    checked={previousAttempts}
                                    onChange={() => setPreviousAttempts(true)}
                                    className="w-4 h-4 text-brand-blue"
                                />
                                <span className="text-sm text-slate-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="previousAttempts"
                                    checked={!previousAttempts}
                                    onChange={() => setPreviousAttempts(false)}
                                    className="w-4 h-4 text-brand-blue"
                                />
                                <span className="text-sm text-slate-700">No</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Historical Behavior Inputs (AI Signals) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-slate-900">Historical Behavior Inputs</h2>
                    <Brain size={18} className="text-brand-violet" />
                </div>
                <p className="text-sm text-slate-500 mb-4">These inputs are used by the AI model to compute priority and risk score.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Past Payment Delay Frequency</label>
                        <select
                            value={paymentDelayFrequency}
                            onChange={(e) => setPaymentDelayFrequency(e.target.value as RiskLevel)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Default History</label>
                        <select
                            value={defaultHistory}
                            onChange={(e) => setDefaultHistory(e.target.value as DefaultHistory)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="none">None</option>
                            <option value="occasional">Occasional</option>
                            <option value="frequent">Frequent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Payment Date</label>
                        <input
                            type="date"
                            value={lastPaymentDate}
                            onChange={(e) => setLastPaymentDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Past Recoveries ($)</label>
                        <input
                            type="number"
                            value={totalPastRecoveries}
                            onChange={(e) => setTotalPastRecoveries(e.target.value)}
                            placeholder="0.00"
                            min={0}
                            step={0.01}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Manual Risk Indicator (Override)</label>
                        <select
                            value={manualRiskIndicator}
                            onChange={(e) => setManualRiskIndicator(e.target.value as RiskLevel | '')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="">Auto (AI decides)</option>
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 5: AI Preview & Assignment (Shown after AI runs) */}
            {aiResult && (
                <div className={`bg-white rounded-xl border-2 shadow-sm p-6 ${priorityStyles(aiResult.priorityScore).border}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Brain size={20} className="text-brand-violet" />
                            <h2 className="text-lg font-semibold text-slate-900">AI Analysis Results</h2>
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onMouseEnter={() => setShowAITooltip(true)}
                                onMouseLeave={() => setShowAITooltip(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <Info size={18} />
                            </button>
                            {showAITooltip && (
                                <div className="absolute right-0 top-8 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                                    {aiResult.decisionLogic}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-500 mb-1">AI Priority Score</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-slate-900">{aiResult.priorityScore}</div>
                                <div className="flex-grow">
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${priorityStyles(aiResult.priorityScore).bar}`} style={{ width: `${aiResult.priorityScore}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-500 mb-1">Risk Classification</div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${priorityStyles(aiResult.priorityScore).tag}`}>
                                {aiResult.riskClassification === 'High' && <AlertTriangle size={14} />}
                                {aiResult.riskClassification === 'Low' && <CheckCircle2 size={14} />}
                                {aiResult.riskClassification}
                            </span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-500 mb-1">Suggested DCA Tier</div>
                            <div className="text-lg font-semibold text-slate-900">{aiResult.suggestedDCATier}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-500 mb-1">Suggested SLA Window</div>
                            <div className="text-lg font-semibold text-slate-900">{aiResult.suggestedSLA} Days</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 6: Assignment Controls */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Assignment Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Auto-Assign DCA</label>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setAutoAssignDCA(!autoAssignDCA)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAssignDCA ? 'bg-brand-blue' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAssignDCA ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm text-slate-600">{autoAssignDCA ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                    {!autoAssignDCA && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Manual DCA Selection *</label>
                                <select
                                    value={manualDCA}
                                    onChange={(e) => setManualDCA(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                                >
                                    <option value="">Select DCA...</option>
                                    {dcaAgencies.map((dca) => (
                                        <option key={dca.id} value={dca.id}>{dca.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Manual Override *</label>
                                <input
                                    type="text"
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    placeholder="Explain override reason..."
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Section 7: Status & Workflow */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Status & Workflow</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Case Status</label>
                        <select
                            value={initialStatus}
                            onChange={(e) => setInitialStatus(e.target.value as 'open' | 'in_progress')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Escalation Enabled</label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="escalation"
                                    checked={escalationEnabled}
                                    onChange={() => setEscalationEnabled(true)}
                                    className="w-4 h-4 text-brand-blue"
                                />
                                <span className="text-sm text-slate-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="escalation"
                                    checked={!escalationEnabled}
                                    onChange={() => setEscalationEnabled(false)}
                                    className="w-4 h-4 text-brand-blue"
                                />
                                <span className="text-sm text-slate-700">No</span>
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Notes (Admin-only)</label>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Internal observations, context, or instructions..."
                            rows={2}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pb-8">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/cases')}
                    className="px-6 py-3 text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Save Draft
                </button>
                <button
                    type="button"
                    onClick={handleCreateCase}
                    disabled={!aiResult}
                    className="px-6 py-3 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create Case & Assign
                </button>
            </div>
        </div>
    );
}
