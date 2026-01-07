import Cookies from 'js-cookie';
import type {
  User,
  LoginRequest,
  LoginResponse,
  Case,
  DCA,
  DashboardStats,
  UploadResult,
  ReportData,
  ApiError,
  CaseFilters,
  DCAFilters,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = Cookies.get('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('API login called with:', credentials);
    
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    console.log('Sending request to:', `${this.baseURL}/api/v1/auth/login`);

    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      console.error('Login error response:', errorData);
      throw new Error(errorData.detail || 'Invalid credentials');
    }

    const data = await response.json();
    console.log('Login response data:', data);
    
    // Store token in cookie
    Cookies.set('access_token', data.access_token, { expires: 1 });
    
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me');
  }

  logout(): void {
    Cookies.remove('access_token');
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/v1/reports/dashboard/overview');
  }

  // Cases endpoints
  async getCases(filters?: CaseFilters): Promise<Case[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<Case[]>(`/api/v1/cases${queryString}`);
  }

  async getCase(id: string): Promise<Case> {
    return this.request<Case>(`/api/v1/cases/${id}`);
  }

  async createCase(caseData: Partial<Case>): Promise<Case> {
    return this.request<Case>('/api/v1/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    return this.request<Case>(`/api/v1/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async allocateCases(caseIds: string[], dcaId: string): Promise<any> {
    return this.request('/api/v1/cases/allocate', {
      method: 'POST',
      body: JSON.stringify({
        case_ids: caseIds,
        dca_id: dcaId,
      }),
    });
  }

  // DCAs endpoints
  async getDCAs(filters?: DCAFilters): Promise<DCA[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<DCA[]>(`/api/v1/dcas${queryString}`);
  }

  async getDCA(id: string): Promise<DCA> {
    return this.request<DCA>(`/api/v1/dcas/${id}`);
  }

  async createDCA(dcaData: Partial<DCA>): Promise<DCA> {
    return this.request<DCA>('/api/v1/dcas', {
      method: 'POST',
      body: JSON.stringify(dcaData),
    });
  }

  async updateDCA(id: string, updates: Partial<DCA>): Promise<DCA> {
    return this.request<DCA>(`/api/v1/dcas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Upload endpoints
  async uploadCases(file: File): Promise<UploadResult> {
    const token = Cookies.get('access_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/admin/upload-cases`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async getUploadTemplate(): Promise<any> {
    return this.request('/api/v1/admin/upload-template');
  }

  // Reports endpoints
  async getDCAPerformance(periodDays: number = 30): Promise<ReportData> {
    return this.request<ReportData>(`/api/v1/reports/performance/dcas?period_days=${periodDays}`);
  }

  async getRecoveryTrends(periodDays: number = 90, granularity: string = 'daily'): Promise<any> {
    return this.request(`/api/v1/reports/recovery/trends?period_days=${periodDays}&granularity=${granularity}`);
  }

  async getSLACompliance(periodDays: number = 30): Promise<any> {
    return this.request(`/api/v1/reports/sla/compliance?period_days=${periodDays}`);
  }

  async getPortfolioAnalysis(): Promise<any> {
    return this.request('/api/v1/reports/portfolio/analysis');
  }

  // AI endpoints
  async analyzeCase(caseData: Record<string, any>): Promise<any> {
    return this.request('/api/v1/ai/analyze-case', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async analyzePortfolio(caseIds?: string[]): Promise<any> {
    return this.request('/api/v1/ai/analyze-portfolio', {
      method: 'POST',
      body: JSON.stringify({ case_ids: caseIds }),
    });
  }

  // Users endpoints (Admin only)
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/v1/admin/users');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/api/v1/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deactivateUser(id: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${id}/deactivate`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);