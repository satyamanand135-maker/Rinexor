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

    constructor() {
        this.token = localStorage.getItem('rinexor_token');
    }

    /** Make a real API request — throws on any error */
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
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        // Verify response is JSON (not Vercel 404 HTML page)
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Not a JSON API response');
        }

        return response.json();
    }

    // ─── Authentication ───
    async login(email: string, password: string): Promise<LoginResponse> {
        // Try real backend first
        try {
            const response = await this.request<LoginResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            this.token = response.access_token;
            localStorage.setItem('rinexor_token', response.access_token);
            return response;
        } catch {
            // Backend unavailable — use demo credentials
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
    }

    async getProfile(): Promise<User> {
        return this.request<User>('/auth/profile');
    }

    logout(): void {
        this.token = null;
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
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, String(value));
                });
            }
            return await this.request<BackendCase[]>(`/cases?${params}`);
        } catch {
            return MOCK_BACKEND_CASES as BackendCase[];
        }
    }

    async getCase(caseId: string): Promise<BackendCase> {
        try {
            return await this.request<BackendCase>(`/cases/${caseId}`);
        } catch {
            const found = MOCK_BACKEND_CASES.find(c => c.id === caseId);
            return (found || MOCK_BACKEND_CASES[0]) as BackendCase;
        }
    }

    async updateCase(caseId: string, updates: Partial<BackendCase>): Promise<BackendCase> {
        try {
            return await this.request<BackendCase>(`/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
        } catch {
            const found = MOCK_BACKEND_CASES.find(c => c.id === caseId);
            return { ...(found || MOCK_BACKEND_CASES[0]), ...updates } as BackendCase;
        }
    }

    async uploadCases(): Promise<{ message: string; cases: BackendCase[] }> {
        try {
            return await this.request('/cases/upload', { method: 'POST' });
        } catch {
            return { message: 'Demo: 8 cases uploaded', cases: MOCK_BACKEND_CASES as BackendCase[] };
        }
    }

    // ─── Dashboard ───
    async getKPIs(): Promise<KPI> {
        try {
            return await this.request<KPI>('/dashboard/kpis');
        } catch {
            return MOCK_KPI;
        }
    }

    async getDCAs(): Promise<DCA[]> {
        try {
            return await this.request<DCA[]>('/dashboard/dcas');
        } catch {
            return MOCK_DCAS;
        }
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
        try {
            return await this.request('/ai/analyze-case', {
                method: 'POST',
                body: JSON.stringify(caseData),
            });
        } catch {
            return {
                recovery_probability: 0.72,
                recovery_score: 78,
                confidence: 'high',
                key_factors: ['Strong payment history', 'Responsive borrower', 'Moderate outstanding'],
                risk_factors: ['Approaching SLA deadline', 'High debt-to-income'],
                recommended_action: 'Escalate to senior agent with restructured payment plan',
            };
        }
    }

    async getModelStatus(): Promise<{
        model_trained: boolean;
        using_rule_based: boolean;
        message: string;
    }> {
        try {
            return await this.request('/ai/model-status');
        } catch {
            return { model_trained: true, using_rule_based: false, message: 'Demo mode – AI model simulated' };
        }
    }

    // ─── Dashboard Analytics (real data from DB) ───
    async getDashboardKPIs(): Promise<DashboardKPIs> {
        try {
            return await this.request<DashboardKPIs>('/reports/dashboard/kpis');
        } catch {
            return MOCK_DASHBOARD_KPIS;
        }
    }

    async getRecoveryChart(months?: number): Promise<RecoveryChartData> {
        try {
            const params = months ? `?months=${months}` : '';
            return await this.request<RecoveryChartData>(`/reports/dashboard/recovery-chart${params}`);
        } catch {
            if (months && months < MOCK_RECOVERY_CHART.chart_data.length) {
                return {
                    ...MOCK_RECOVERY_CHART,
                    chart_data: MOCK_RECOVERY_CHART.chart_data.slice(-months),
                };
            }
            return MOCK_RECOVERY_CHART;
        }
    }

    async getTopDCAs(limit?: number): Promise<TopDCAsResponse> {
        try {
            const params = limit ? `?limit=${limit}` : '';
            return await this.request<TopDCAsResponse>(`/reports/dashboard/top-dcas${params}`);
        } catch {
            if (limit) {
                return { top_dcas: MOCK_TOP_DCAS.top_dcas.slice(0, limit) };
            }
            return MOCK_TOP_DCAS;
        }
    }

    async getReportsData(): Promise<ReportsData> {
        try {
            return await this.request<ReportsData>('/reports/dashboard/reports-data');
        } catch {
            return MOCK_REPORTS_DATA;
        }
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
