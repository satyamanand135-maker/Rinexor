/**
 * Rinexor API Client
 * Connects frontend to the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginResponse {
    access_token: string;
    token_type: string;
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

    // Authentication
    async login(email: string, password: string): Promise<LoginResponse> {
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

    // Cases
    async getCases(filters?: {
        enterprise_id?: string;
        assigned_dca_id?: string;
        status?: string;
        limit?: number;
    }): Promise<BackendCase[]> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, String(value));
            });
        }
        return this.request<BackendCase[]>(`/cases?${params}`);
    }

    async getCase(caseId: string): Promise<BackendCase> {
        return this.request<BackendCase>(`/cases/${caseId}`);
    }

    async updateCase(caseId: string, updates: Partial<BackendCase>): Promise<BackendCase> {
        return this.request<BackendCase>(`/cases/${caseId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async uploadCases(): Promise<{ message: string; cases: BackendCase[] }> {
        return this.request('/cases/upload', { method: 'POST' });
    }

    // Dashboard
    async getKPIs(): Promise<KPI> {
        return this.request<KPI>('/dashboard/kpis');
    }

    async getDCAs(): Promise<DCA[]> {
        return this.request<DCA[]>('/dashboard/dcas');
    }

    // AI Analysis
    async analyzeCase(caseData: Partial<BackendCase>): Promise<{
        recovery_probability: number;
        recovery_score: number;
        confidence: string;
        key_factors: string[];
        risk_factors: string[];
        recommended_action: string;
    }> {
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
        return this.request('/ai/model-status');
    }

    // Dashboard Analytics (real data from DB)
    async getDashboardKPIs(): Promise<DashboardKPIs> {
        return this.request<DashboardKPIs>('/reports/dashboard/kpis');
    }

    async getRecoveryChart(months?: number): Promise<RecoveryChartData> {
        const params = months ? `?months=${months}` : '';
        return this.request<RecoveryChartData>(`/reports/dashboard/recovery-chart${params}`);
    }

    async getTopDCAs(limit?: number): Promise<TopDCAsResponse> {
        const params = limit ? `?limit=${limit}` : '';
        return this.request<TopDCAsResponse>(`/reports/dashboard/top-dcas${params}`);
    }

    async getReportsData(): Promise<ReportsData> {
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

