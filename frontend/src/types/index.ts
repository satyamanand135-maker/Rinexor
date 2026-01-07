export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'enterprise_admin' | 'collection_manager' | 'dca_agent';
  dca_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Case {
  id: string;
  account_id: string;
  debtor_name: string;
  debtor_email?: string;
  debtor_phone?: string;
  debtor_address?: string;
  original_amount: number;
  current_amount: number;
  currency: string;
  days_delinquent: number;
  debt_age_days: number;
  status: 'new' | 'allocated' | 'in_progress' | 'escalated' | 'resolved' | 'returned' | 'closed';
  priority: 'high' | 'medium' | 'low';
  recovery_score: number;
  recovery_score_band: 'high' | 'medium' | 'low';
  dca_id?: string;
  allocated_by?: string;
  allocation_date?: string;
  ml_features?: Record<string, any>;
  sla_contact_deadline?: string;
  sla_resolution_deadline?: string;
  first_contact_date?: string;
  resolved_date?: string;
  created_at: string;
  updated_at?: string;
  dca_name?: string;
  allocated_by_name?: string;
}

export interface DCA {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  performance_score: number;
  recovery_rate: number;
  avg_resolution_days?: number;
  max_concurrent_cases?: number;
  current_active_cases?: number;
  specialization?: string[];
  sla_compliance_rate?: number;
  is_active: boolean;
  is_accepting_cases: boolean;
  onboarded_date?: string;
  last_performance_update?: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_cases: number;
  total_amount: number;
  recovered_amount: number;
  recovery_rate: number;
  active_dcas: number;
  sla_breaches: number;
  cases_this_month: number;
  status_breakdown: Record<string, number>;
  last_updated: string;
}

export interface UploadResult {
  total_rows: number;
  successful: Array<{
    row: number;
    case_id: string;
    account_id: string;
    priority: string;
    recovery_score: number;
    allocated_dca?: string;
  }>;
  failed: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  summary: {
    total_processed: number;
    successful_count: number;
    failed_count: number;
    success_rate: number;
    uploaded_by: string;
    upload_timestamp: string;
  };
}

export interface ReportData {
  period_start: string;
  period_end: string;
  period_days: number;
  total_dcas: number;
  performance_data: Array<{
    dca_id: string;
    dca_name: string;
    dca_code: string;
    cases_assigned: number;
    cases_resolved: number;
    resolution_rate: number;
    amount_assigned: number;
    amount_recovered: number;
    recovery_rate: number;
    avg_resolution_days: number;
    sla_compliance: number;
    performance_score: number;
  }>;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CaseFilters {
  status?: string;
  priority?: string;
  dca_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface DCAFilters {
  is_active?: boolean;
  is_accepting_cases?: boolean;
  search?: string;
}