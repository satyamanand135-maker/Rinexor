/**
 * Rinexor API Client
 * Connects frontend to the FastAPI backend.
 * Falls back to mock data when the backend is unavailable (e.g. Vercel static deployment).
 */

import {
    DEMO_USERS,
    MOCK_DASHBOARD_KPIS,
    MOCK_RECOVERY_CHART,
    MOCK_TOP_DCAS,
    MOCK_REPORTS_DATA,
    MOCK_BACKEND_CASES,
    MOCK_DCAS,
    MOCK_KPI,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginResponse {
    access_token: string;
    token_type: string;
    user?: {
        id: string;
        name: string;
        role: string;
        email: string;
    };
}

interface User {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'enterprise_admin' | 'dca_user';
    enterprise_id?: string;
    dca_id?: string;
}

interface BackendCase {
    id: string;
    borrower_name: string;
    borrower_email: string;
    borrower_phone: string;
    amount: number;
    status: string;
    priority: string;
    ai_score: number;
    sla_deadline: string;
    assigned_dca_id: string;
    enterprise_id: string;
    created_at: string;
    updated_at: string;
    remarks?: string;
}

interface DCA {
    id: string;
    name: string;
    contact_email: string;
    performance_score: number;
    active_cases: number;
    resolved_cases: number;
    sla_breaches: number;
    recovered_amount: number;
    average_resolution_days?: number;
}

interface KPI {
    total_cases: number;
    total_dcas: number;
    total_enterprises: number;
    overall_recovery_rate: number;
    sla_breaches: number;
    high_priority_cases: number;
}

class ApiClient {
    private token: string | null = null;
    private _useMockData: boolean | null = null; // null = not yet checked

    constructor() {
        this.token = localStorage.getItem('rinexor_token');
    }

    /** Check if backend is reachable; cache result */
    private async shouldUseMockData(): Promise<boolean> {
        if (this._useMockData !== null) return this._useMockData;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'probe', password: 'probe' }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            // A real backend returns JSON (even error responses). Vercel returns HTML 404.
            const contentType = res.headers.get('content-type') || '';
            this._useMockData = !contentType.includes('application/json');
        } catch {
            this._useMockData = true;
        }
        return this._useMockData;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication required');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // ─── Authentication ───
    async login(email: string, password: string): Promise<LoginResponse> {
        const useMock = await this.shouldUseMockData();

        if (useMock) {
            const demoUser = DEMO_USERS[email.toLowerCase()];
            if (demoUser && demoUser.password === password) {
                const mockToken = 'demo-token-' + btoa(email);
                this.token = mockToken;
                localStorage.setItem('rinexor_token', mockToken);
                return {
                    access_token: mockToken,
                    token_type: 'bearer',
                    user: demoUser.user,
                };
            }
            throw new Error('Invalid credentials');
        }

        const response = await this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        this.token = response.access_token;
        localStorage.setItem('rinexor_token', response.access_token);

        return response;
    }

    async getProfile(): Promise<User> {
        return this.request<User>('/auth/profile');
    }

    logout(): void {
        this.token = null;
        this._useMockData = null; // reset for next session
        localStorage.removeItem('rinexor_token');
        localStorage.removeItem('rinexor_user');
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    getToken(): string | null {
        return this.token;
    }

    setToken(token: string | null): void {
        this.token = token;
        if (token) {
            localStorage.setItem('rinexor_token', token);
        } else {
            localStorage.removeItem('rinexor_token');
        }
    }

    // ─── Cases ───
    async getCases(filters?: {
        enterprise_id?: string;
        assigned_dca_id?: string;
        status?: string;
        limit?: number;
    }): Promise<BackendCase[]> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return MOCK_BACKEND_CASES as BackendCase[];

        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        return this.request<BackendCase[]>(`/cases?${params}`);
    }

    async getCase(caseId: string): Promise<BackendCase> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            const found = MOCK_BACKEND_CASES.find(c => c.id === caseId);
            return (found || MOCK_BACKEND_CASES[0]) as BackendCase;
        }
        return this.request<BackendCase>(`/cases/${caseId}`);
    }

    async updateCase(caseId: string, updates: Partial<BackendCase>): Promise<BackendCase> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            const found = MOCK_BACKEND_CASES.find(c => c.id === caseId);
            return { ...(found || MOCK_BACKEND_CASES[0]), ...updates } as BackendCase;
        }
        return this.request<BackendCase>(`/cases/${caseId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async uploadCases(): Promise<{ message: string; cases: BackendCase[] }> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return { message: 'Demo: 8 cases uploaded', cases: MOCK_BACKEND_CASES as BackendCase[] };
        return this.request('/cases/upload', { method: 'POST' });
    }

    // ─── Dashboard ───
    async getKPIs(): Promise<KPI> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return MOCK_KPI;
        return this.request<KPI>('/dashboard/kpis');
    }

    async getDCAs(): Promise<DCA[]> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return MOCK_DCAS;
        return this.request<DCA[]>('/dashboard/dcas');
    }

    // ─── AI Analysis ───
    async analyzeCase(caseData: Partial<BackendCase>): Promise<{
        recovery_probability: number;
        recovery_score: number;
        confidence: string;
        key_factors: string[];
        risk_factors: string[];
        recommended_action: string;
    }> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            return {
                recovery_probability: 0.72,
                recovery_score: 78,
                confidence: 'high',
                key_factors: ['Strong payment history', 'Responsive borrower', 'Moderate outstanding'],
                risk_factors: ['Approaching SLA deadline', 'High debt-to-income'],
                recommended_action: 'Escalate to senior agent with restructured payment plan',
            };
        }
        return this.request('/ai/analyze-case', {
            method: 'POST',
            body: JSON.stringify(caseData),
        });
    }

    async getModelStatus(): Promise<{
        model_trained: boolean;
        using_rule_based: boolean;
        message: string;
    }> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            return { model_trained: true, using_rule_based: false, message: 'Demo mode – AI model simulated' };
        }
        return this.request('/ai/model-status');
    }

    // ─── Dashboard Analytics (real data from DB) ───
    async getDashboardKPIs(): Promise<DashboardKPIs> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return MOCK_DASHBOARD_KPIS;
        return this.request<DashboardKPIs>('/reports/dashboard/kpis');
    }

    async getRecoveryChart(months?: number): Promise<RecoveryChartData> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            if (months && months < MOCK_RECOVERY_CHART.chart_data.length) {
                return {
                    ...MOCK_RECOVERY_CHART,
                    chart_data: MOCK_RECOVERY_CHART.chart_data.slice(-months),
                };
            }
            return MOCK_RECOVERY_CHART;
        }
        const params = months ? `?months=${months}` : '';
        return this.request<RecoveryChartData>(`/reports/dashboard/recovery-chart${params}`);
    }

    async getTopDCAs(limit?: number): Promise<TopDCAsResponse> {
        const useMock = await this.shouldUseMockData();
        if (useMock) {
            if (limit) {
                return { top_dcas: MOCK_TOP_DCAS.top_dcas.slice(0, limit) };
            }
            return MOCK_TOP_DCAS;
        }
        const params = limit ? `?limit=${limit}` : '';
        return this.request<TopDCAsResponse>(`/reports/dashboard/top-dcas${params}`);
    }

    async getReportsData(): Promise<ReportsData> {
        const useMock = await this.shouldUseMockData();
        if (useMock) return MOCK_REPORTS_DATA;
        return this.request<ReportsData>('/reports/dashboard/reports-data');
    }
}

interface DashboardKPIs {
    total_cases: number;
    active_cases: number;
    total_outstanding: number;
    total_original: number;
    recovered_amount: number;
    recovery_rate: number;
    active_dcas: number;
    sla_breaches: number;
    high_priority_cases: number;
    cases_this_month: number;
    cases_change_pct: number;
    last_updated: string;
}

interface RecoveryChartData {
    chart_data: Array<{
        name: string;
        month_key: string;
        recovery: number;
        cases_resolved: number;
        amount_created: number;
        cases_created: number;
    }>;
    forecast_data: Array<{
        name: string;
        forecast: number;
        recovery: null;
    }>;
    total_months: number;
}

interface TopDCAsResponse {
    top_dcas: Array<{
        id: string;
        name: string;
        code: string;
        performance_score: number;
        recovery_rate: number;
        sla_compliance: number;
        total_assigned: number;
        resolved: number;
        actual_recovery_pct: number;
    }>;
}

interface ReportsData {
    recovery_comparison: Array<Record<string, any>>;
    dca_keys: Array<{ key: string; name: string }>;
    sla_trends: Array<{ month: string; compliant: number; breached: number }>;
    ageing_data: Array<{ bucket: string; cases: number; amount: number }>;
    dca_comparison: Array<{ agent: string; full_name: string; recovery: number; sla: number }>;
    kpis: {
        recovery_rate: number;
        sla_compliance: number;
        recovered_amount: number;
    };
}

export const apiClient = new ApiClient();
export type { BackendCase, DCA, KPI, User, LoginResponse, DashboardKPIs, RecoveryChartData, TopDCAsResponse, ReportsData };
