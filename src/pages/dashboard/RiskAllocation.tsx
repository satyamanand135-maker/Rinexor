import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Users, PieChart, ArrowRight, Loader2, X } from 'lucide-react';
import { useCases } from '../../context/CaseContext';

// Types
interface RiskDistribution {
    high: { count: number; percentage: number; total_amount: number; avg_risk_score: number };
    intermediate: { count: number; percentage: number; total_amount: number; avg_risk_score: number };
    low: { count: number; percentage: number; total_amount: number; avg_risk_score: number };
}

interface DCAAllocation {
    dca_id: string;
    dca_name: string;
    dca_code: string;
    performance_score: number;
    recovery_rate: number;
    assigned_cases: number;
    amount_to_recover: number;
    risk_breakdown: { high?: number; intermediate?: number; low?: number };
}

interface AllocationSummary {
    total_cases: number;
    total_amount: number;
    total_dcas_assigned: number;
    risk_summary: {
        high: { count: number; percentage: number; amount: number };
        intermediate: { count: number; percentage: number; amount: number };
        low: { count: number; percentage: number; amount: number };
    };
}

type Step = 'upload' | 'analysis' | 'preview' | 'confirm' | 'success';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function RiskAllocation() {
    const { refreshCases } = useCases();
    const [step, setStep] = useState<Step>('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Analysis results
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [totalCases, setTotalCases] = useState(0);
    const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);

    // Allocation preview
    const [allocations, setAllocations] = useState<DCAAllocation[]>([]);
    const [summary, setSummary] = useState<AllocationSummary | null>(null);

    // Final result
    const [allocationResult, setAllocationResult] = useState<{ allocated: number; created: number } | null>(null);

    // Auth token
    const getAuthToken = () => localStorage.getItem('auth_token') || '';

    // File handling
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a CSV or Excel file');
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    // API calls
    const analyzeFile = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/ai/analyze-file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Analysis failed');
            }

            const data = await response.json();
            setAnalysisId(data.analysis_id);
            setTotalCases(data.total_cases);
            setRiskDistribution(data.risk_distribution);
            setStep('analysis');
        } catch (err: any) {
            setError(err.message || 'Failed to analyze file');
        } finally {
            setLoading(false);
        }
    };

    const getPreview = async () => {
        if (!analysisId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/ai/allocation-preview?analysis_id=${analysisId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate preview');
            }

            const data = await response.json();
            setAllocations(data.allocation_preview);
            setSummary(data.summary);
            setStep('preview');
        } catch (err: any) {
            setError(err.message || 'Failed to get allocation preview');
        } finally {
            setLoading(false);
        }
    };

    const confirmAllocation = async () => {
        if (!analysisId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/ai/confirm-allocation?analysis_id=${analysisId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Allocation failed');
            }

            const data = await response.json();
            setAllocationResult({
                allocated: data.allocated_count,
                created: data.cases_created
            });
            // Refresh cases in Case Intelligence
            await refreshCases();
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Failed to allocate cases');
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep('upload');
        setFile(null);
        setAnalysisId(null);
        setTotalCases(0);
        setRiskDistribution(null);
        setAllocations([]);
        setSummary(null);
        setAllocationResult(null);
        setError(null);
    };

    // Risk level colors
    const riskColors = {
        high: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        intermediate: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        low: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AI Allocation</h1>
                    <p className="text-slate-500">Upload cases, analyze risk levels, and allocate to DCAs automatically</p>
                </div>
                {step !== 'upload' && step !== 'success' && (
                    <button
                        onClick={resetFlow}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-2"
                    >
                        <X size={16} /> Start Over
                    </button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                {(['upload', 'analysis', 'preview', 'confirm'] as const).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step === s ? 'bg-brand-blue text-white' :
                                (['analysis', 'preview', 'confirm', 'success'].indexOf(step) > i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600')
                            }`}>
                            {(['analysis', 'preview', 'confirm', 'success'].indexOf(step) > i) ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${step === s ? 'text-brand-blue' : 'text-slate-500'}`}>
                            {s === 'upload' ? 'Upload' : s === 'analysis' ? 'Analyze' : s === 'preview' ? 'Preview' : 'Allocate'}
                        </span>
                        {i < 3 && <ArrowRight size={16} className="text-slate-300 ml-2" />}
                    </div>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="font-medium text-red-700">Error</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {/* Step 1: Upload */}
            {step === 'upload' && (
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${dragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-300 hover:border-brand-blue/50'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center gap-4">
                            {file ? (
                                <>
                                    <FileSpreadsheet className="text-brand-blue" size={48} />
                                    <div>
                                        <p className="font-medium text-slate-900">{file.name}</p>
                                        <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Remove file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-slate-400" size={48} />
                                    <div>
                                        <p className="font-medium text-slate-700">Drop your file here or click to browse</p>
                                        <p className="text-sm text-slate-500 mt-1">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
                                    </div>
                                    <label className="px-6 py-2 bg-brand-blue text-white rounded-lg font-medium cursor-pointer hover:bg-brand-blue/90">
                                        Select File
                                        <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={analyzeFile}
                                disabled={loading}
                                className="px-8 py-3 bg-brand-navy text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <PieChart size={18} />}
                                {loading ? 'Analyzing...' : 'Analyze Risk Levels'}
                            </button>
                        </div>
                    )}

                    {/* Expected format info */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                        <p className="font-medium text-slate-700 mb-2">Expected File Format:</p>
                        <p className="text-sm text-slate-600">
                            Required columns: <code className="bg-slate-200 px-1 rounded">debtor_name</code>, <code className="bg-slate-200 px-1 rounded">original_amount</code>
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            Optional columns: <code className="bg-slate-200 px-1 rounded">days_delinquent</code>, <code className="bg-slate-200 px-1 rounded">credit_score</code>, <code className="bg-slate-200 px-1 rounded">debtor_email</code>, <code className="bg-slate-200 px-1 rounded">debtor_phone</code>
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Analysis Results */}
            {step === 'analysis' && riskDistribution && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-brand-blue/10 rounded-lg">
                                    <FileSpreadsheet className="text-brand-blue" size={20} />
                                </div>
                                <span className="text-sm text-slate-500">Total Cases</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{totalCases}</p>
                        </div>

                        {(['high', 'intermediate', 'low'] as const).map((level) => (
                            <div key={level} className={`bg-white p-6 rounded-xl border ${riskColors[level].border}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 ${riskColors[level].light} rounded-lg`}>
                                        <AlertTriangle className={riskColors[level].text} size={20} />
                                    </div>
                                    <span className="text-sm text-slate-500 capitalize">{level} Risk</span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{riskDistribution[level].count}</p>
                                <p className="text-sm text-slate-500 mt-1">{riskDistribution[level].percentage}% of cases</p>
                            </div>
                        ))}
                    </div>

                    {/* Risk Distribution Chart (Visual) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4">Risk Distribution</h3>
                        <div className="flex h-8 rounded-lg overflow-hidden">
                            {(['high', 'intermediate', 'low'] as const).map((level) => (
                                <div
                                    key={level}
                                    className={`${riskColors[level].bg} flex items-center justify-center text-white text-sm font-medium`}
                                    style={{ width: `${riskDistribution[level].percentage}%` }}
                                >
                                    {riskDistribution[level].percentage > 10 && `${riskDistribution[level].percentage}%`}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-6 mt-4">
                            {(['high', 'intermediate', 'low'] as const).map((level) => (
                                <div key={level} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded ${riskColors[level].bg}`} />
                                    <span className="text-sm text-slate-600 capitalize">{level}: ${riskDistribution[level].total_amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={getPreview}
                            disabled={loading}
                            className="px-8 py-3 bg-brand-navy text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
                            {loading ? 'Generating Preview...' : 'Preview DCA Allocation'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Allocation Preview */}
            {step === 'preview' && summary && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gradient-to-r from-brand-navy to-brand-blue p-6 rounded-xl text-white">
                        <h3 className="text-xl font-bold mb-4">Allocation Summary</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-white/70 text-sm">Total Cases</p>
                                <p className="text-3xl font-bold">{summary.total_cases}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Total Amount</p>
                                <p className="text-3xl font-bold">${summary.total_amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">DCAs Assigned</p>
                                <p className="text-3xl font-bold">{summary.total_dcas_assigned}</p>
                            </div>
                        </div>
                    </div>

                    {/* Risk Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        {(['high', 'intermediate', 'low'] as const).map((level) => (
                            <div key={level} className={`p-4 rounded-xl border ${riskColors[level].border} ${riskColors[level].light}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-semibold capitalize ${riskColors[level].text}`}>{level} Risk</span>
                                    <span className={`text-2xl font-bold ${riskColors[level].text}`}>{summary.risk_summary[level].percentage}%</span>
                                </div>
                                <p className="text-sm text-slate-600">{summary.risk_summary[level].count} cases • ${summary.risk_summary[level].amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    {/* DCA Allocations Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">DCA Allocation Preview</h3>
                            <p className="text-sm text-slate-500">Cases will be allocated based on DCA performance and risk level</p>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">DCA</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Performance</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Cases</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Risk Breakdown</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allocations.map((dca) => (
                                    <tr key={dca.dca_id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{dca.dca_name}</p>
                                                <p className="text-sm text-slate-500">{dca.dca_code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-brand-blue rounded-full"
                                                        style={{ width: `${dca.performance_score * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{(dca.performance_score * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-semibold text-slate-900">{dca.assigned_cases}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">${dca.amount_to_recover.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {dca.risk_breakdown.high && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded">
                                                        {dca.risk_breakdown.high} High
                                                    </span>
                                                )}
                                                {dca.risk_breakdown.intermediate && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded">
                                                        {dca.risk_breakdown.intermediate} Med
                                                    </span>
                                                )}
                                                {dca.risk_breakdown.low && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded">
                                                        {dca.risk_breakdown.low} Low
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Confirm Button */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setStep('analysis')}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                        >
                            Back to Analysis
                        </button>
                        <button
                            onClick={confirmAllocation}
                            disabled={loading}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            {loading ? 'Allocating...' : 'Confirm & Allocate Cases'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && allocationResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-600" size={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Allocation Complete!</h2>
                    <p className="text-slate-600 mb-6">Cases have been successfully created and allocated to DCAs.</p>

                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-brand-blue">{allocationResult.created}</p>
                            <p className="text-sm text-slate-500">Cases Created</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-emerald-600">{allocationResult.allocated}</p>
                            <p className="text-sm text-slate-500">Cases Allocated</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={resetFlow}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                        >
                            Upload Another File
                        </button>
                        <a
                            href="/dashboard/cases"
                            className="px-6 py-3 bg-brand-navy text-white rounded-lg font-medium hover:bg-slate-800"
                        >
                            View Cases
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
