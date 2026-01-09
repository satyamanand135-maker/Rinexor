export type Role = 'super_admin' | 'enterprise_admin' | 'dca_user'

export type UserProfile = {
  id: string
  email: string
  name: string
  role: Role
  enterprise_id: string | null
  dca_id: string | null
}

export type CaseStatus = 'pending' | 'in_progress' | 'contacted' | 'resolved' | 'failed'
export type CasePriority = 'low' | 'medium' | 'high' | 'critical'

export type Case = {
  id: string
  borrower_name: string
  borrower_email: string
  borrower_phone: string
  amount: number
  status: CaseStatus
  priority: CasePriority
  ai_score: number
  sla_deadline: string
  assigned_dca_id: string
  enterprise_id: string
  created_at: string
  updated_at: string
  remarks?: string | null
}

export type KPI = {
  total_cases: number
  total_dcas: number
  total_enterprises: number
  overall_recovery_rate: number
  sla_breaches: number
  high_priority_cases: number
}

export type DCA = {
  id: string
  name: string
  contact_email: string
  performance_score: number
  active_cases: number
  resolved_cases: number
  sla_breaches: number
}

export type Enterprise = {
  id: string
  name: string
  total_cases: number
  active_cases: number
  resolved_cases: number
  recovery_rate: number
}

export type AuditEvent = {
  id: string
  at: string
  actor_email: string
  actor_role: Role
  action: string
  case_id?: string | null
  enterprise_id?: string | null
  dca_id?: string | null
  details?: Record<string, unknown> | null
}

