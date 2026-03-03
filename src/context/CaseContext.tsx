import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export type CaseRow = {
    id: string;
    customer: string;
    enterprise: string;
    amount: string;
    agency: string;
    agent?: string;
    score: number;
    sla: string;
    slaStatus: SLAStatus;
    status: string;
    createdAt: string;
    riskLevel?: string;
};

interface CaseContextType {
    cases: CaseRow[];
    addCase: (newCase: CaseRow) => void;
    updateCase: (id: string, updates: Partial<CaseRow>) => void;
    refreshCases: () => Promise<void>;
    loading: boolean;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const initialCases: CaseRow[] = [
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

export function CaseProvider({ children }: { children: ReactNode }) {
    const [cases, setCases] = useState<CaseRow[]>(initialCases);
    const [loading, setLoading] = useState(false);

    const fetchCases = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/cases/`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    // Merge backend cases with initial cases, backend takes priority
                    const backendCaseIds = new Set(data.map((c: CaseRow) => c.id));
                    const filteredInitial = initialCases.filter(c => !backendCaseIds.has(c.id));
                    setCases([...data, ...filteredInitial]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch cases:', err);
            // Keep using initial cases on error
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCases = useCallback(async () => {
        await fetchCases();
    }, [fetchCases]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const addCase = (newCase: CaseRow) => {
        setCases((prev) => [newCase, ...prev]);
    };

    const updateCase = (id: string, updates: Partial<CaseRow>) => {
        setCases((prev) => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    return (
        <CaseContext.Provider value={{ cases, addCase, updateCase, refreshCases, loading }}>
            {children}
        </CaseContext.Provider>
    );
}

export function useCases() {
    const context = useContext(CaseContext);
    if (!context) {
        throw new Error('useCases must be used within CaseProvider');
    }
    return context;
}

