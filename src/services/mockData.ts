/**
 * Mock / Demo Data for Rinexor Frontend
 * Used as fallback when the backend API is not available (e.g. Vercel static deployment)
 */

// ─── Demo Users ───
export const DEMO_USERS: Record<string, { email: string; password: string; user: { id: string; name: string; role: string; email: string } }> = {
    'superadmin@rinexor.ai': {
        email: 'superadmin@rinexor.ai',
        password: 'Super@123',
        user: { id: 'USR-SA-001', name: 'System Administrator', role: 'super_admin', email: 'superadmin@rinexor.ai' },
    },
    'admin@enterprise.com': {
        email: 'admin@enterprise.com',
        password: 'Enterprise@123',
        user: { id: 'USR-EA-001', name: 'John Doe', role: 'enterprise_admin', email: 'admin@enterprise.com' },
    },
    'agent@dca.com': {
        email: 'agent@dca.com',
        password: 'DCA@123',
        user: { id: 'USR-DCA-001', name: 'Agent Smith', role: 'dca_agent', email: 'agent@dca.com' },
    },
};

// ─── Dashboard KPIs ───
export const MOCK_DASHBOARD_KPIS = {
    total_cases: 1247,
    active_cases: 438,
    total_outstanding: 52700000,
    total_original: 78500000,
    recovered_amount: 25800000,
    recovery_rate: 32.8,
    active_dcas: 12,
    sla_breaches: 23,
    high_priority_cases: 67,
    cases_this_month: 84,
    cases_change_pct: 12.4,
    last_updated: new Date().toISOString(),
};

// ─── Recovery Chart ───
const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
export const MOCK_RECOVERY_CHART = {
    chart_data: months.slice(0, 7).map((name, i) => ({
        name,
        month_key: `2025-${String(i + 7).padStart(2, '0')}`,
        recovery: [1850000, 2100000, 2450000, 2800000, 3100000, 3600000, 4200000][i],
        cases_resolved: [42, 51, 58, 63, 71, 78, 85][i],
        amount_created: [5200000, 4800000, 5500000, 6100000, 5800000, 6400000, 7000000][i],
        cases_created: [120, 105, 130, 140, 128, 145, 155][i],
    })),
    forecast_data: months.slice(7).map((name, i) => ({
        name,
        forecast: [4800000, 5200000, 5600000][i],
        recovery: null,
    })),
    total_months: 10,
};

// ─── Top DCAs ───
export const MOCK_TOP_DCAS = {
    top_dcas: [
        { id: 'DCA-001', name: 'Global Collections', code: 'GC', performance_score: 92, recovery_rate: 0.38, sla_compliance: 0.95, total_assigned: 185, resolved: 78, actual_recovery_pct: 38 },
        { id: 'DCA-002', name: 'Alpha Recoveries', code: 'AR', performance_score: 87, recovery_rate: 0.34, sla_compliance: 0.91, total_assigned: 142, resolved: 56, actual_recovery_pct: 34 },
        { id: 'DCA-003', name: 'Summit Financial', code: 'SF', performance_score: 84, recovery_rate: 0.31, sla_compliance: 0.88, total_assigned: 128, resolved: 44, actual_recovery_pct: 31 },
        { id: 'DCA-004', name: 'Zenith Partners', code: 'ZP', performance_score: 79, recovery_rate: 0.28, sla_compliance: 0.85, total_assigned: 96, resolved: 32, actual_recovery_pct: 28 },
        { id: 'DCA-005', name: 'Apex Solutions', code: 'AS', performance_score: 74, recovery_rate: 0.25, sla_compliance: 0.82, total_assigned: 78, resolved: 24, actual_recovery_pct: 25 },
    ],
};

// ─── Reports Data ───
export const MOCK_REPORTS_DATA = {
    recovery_comparison: [
        { month: 'Jul', GC: 520000, AR: 380000, SF: 290000, ZP: 210000, AS: 160000 },
        { month: 'Aug', GC: 580000, AR: 420000, SF: 340000, ZP: 250000, AS: 190000 },
        { month: 'Sep', GC: 650000, AR: 480000, SF: 380000, ZP: 290000, AS: 220000 },
        { month: 'Oct', GC: 720000, AR: 540000, SF: 420000, ZP: 330000, AS: 260000 },
        { month: 'Nov', GC: 800000, AR: 610000, SF: 470000, ZP: 370000, AS: 300000 },
        { month: 'Dec', GC: 880000, AR: 680000, SF: 530000, ZP: 420000, AS: 340000 },
    ],
    dca_keys: [
        { key: 'GC', name: 'Global Collections' },
        { key: 'AR', name: 'Alpha Recoveries' },
        { key: 'SF', name: 'Summit Financial' },
        { key: 'ZP', name: 'Zenith Partners' },
        { key: 'AS', name: 'Apex Solutions' },
    ],
    sla_trends: [
        { month: 'Jul', compliant: 92, breached: 8 },
        { month: 'Aug', compliant: 90, breached: 10 },
        { month: 'Sep', compliant: 93, breached: 7 },
        { month: 'Oct', compliant: 88, breached: 12 },
        { month: 'Nov', compliant: 91, breached: 9 },
        { month: 'Dec', compliant: 94, breached: 6 },
    ],
    ageing_data: [
        { bucket: '0-30 Days', cases: 185, amount: 8500000 },
        { bucket: '31-60 Days', cases: 142, amount: 12400000 },
        { bucket: '61-90 Days', cases: 98, amount: 15200000 },
        { bucket: '90+ Days', cases: 67, amount: 16600000 },
    ],
    dca_comparison: [
        { agent: 'GC', full_name: 'Global Collections', recovery: 38, sla: 95 },
        { agent: 'AR', full_name: 'Alpha Recoveries', recovery: 34, sla: 91 },
        { agent: 'SF', full_name: 'Summit Financial', recovery: 31, sla: 88 },
        { agent: 'ZP', full_name: 'Zenith Partners', recovery: 28, sla: 85 },
        { agent: 'AS', full_name: 'Apex Solutions', recovery: 25, sla: 82 },
    ],
    kpis: {
        recovery_rate: 32.8,
        sla_compliance: 91.2,
        recovered_amount: 25800000,
    },
};

// ─── Mock Cases (backend format) ───
export const MOCK_BACKEND_CASES = [
    { id: 'CS-8921', borrower_name: 'Acme Corp', borrower_email: 'finance@acme.com', borrower_phone: '+91-9876543210', amount: 4520000, status: 'in_progress', priority: 'high', ai_score: 92, sla_deadline: '2026-03-05', assigned_dca_id: 'DCA-001', enterprise_id: 'ENT-001', created_at: '2025-12-18T10:30:00Z', updated_at: '2026-01-15T14:20:00Z' },
    { id: 'CS-8922', borrower_name: 'TechFlow Inc', borrower_email: 'accounts@techflow.com', borrower_phone: '+91-9876543211', amount: 1285000, status: 'negotiating', priority: 'medium', ai_score: 74, sla_deadline: '2026-03-08', assigned_dca_id: 'DCA-002', enterprise_id: 'ENT-001', created_at: '2025-12-22T09:15:00Z', updated_at: '2026-01-20T11:45:00Z' },
    { id: 'CS-8923', borrower_name: 'Stark Industries', borrower_email: 'billing@stark.com', borrower_phone: '+91-9876543212', amount: 11200000, status: 'escalated', priority: 'critical', ai_score: 98, sla_deadline: '2026-02-28', assigned_dca_id: 'DCA-003', enterprise_id: 'ENT-002', created_at: '2025-11-29T08:00:00Z', updated_at: '2026-02-01T16:30:00Z' },
    { id: 'CS-8924', borrower_name: 'Wayne Enterprises', borrower_email: 'payments@wayne.com', borrower_phone: '+91-9876543213', amount: 850000, status: 'pending', priority: 'low', ai_score: 65, sla_deadline: '2026-03-13', assigned_dca_id: 'DCA-001', enterprise_id: 'ENT-001', created_at: '2025-12-28T11:00:00Z', updated_at: '2025-12-28T11:00:00Z' },
    { id: 'CS-8925', borrower_name: 'Cyberdyne Systems', borrower_email: 'ar@cyberdyne.com', borrower_phone: '+91-9876543214', amount: 15600000, status: 'in_progress', priority: 'high', ai_score: 88, sla_deadline: '2026-03-04', assigned_dca_id: 'DCA-001', enterprise_id: 'ENT-002', created_at: '2025-12-10T14:30:00Z', updated_at: '2026-01-25T09:15:00Z' },
    { id: 'CS-8926', borrower_name: 'Massive Dynamic', borrower_email: 'finance@massive.com', borrower_phone: '+91-9876543215', amount: 2340000, status: 'pending', priority: 'low', ai_score: 45, sla_deadline: '2026-03-18', assigned_dca_id: 'DCA-002', enterprise_id: 'ENT-001', created_at: '2025-12-05T10:45:00Z', updated_at: '2025-12-05T10:45:00Z' },
    { id: 'CS-8927', borrower_name: 'Hooli', borrower_email: 'payments@hooli.com', borrower_phone: '+91-9876543216', amount: 6700000, status: 'negotiating', priority: 'medium', ai_score: 82, sla_deadline: '2026-03-06', assigned_dca_id: 'DCA-003', enterprise_id: 'ENT-002', created_at: '2025-12-12T13:00:00Z', updated_at: '2026-01-28T15:40:00Z' },
    { id: 'CS-8928', borrower_name: 'Umbrella Health', borrower_email: 'billing@umbrella.com', borrower_phone: '+91-9876543217', amount: 1890000, status: 'in_progress', priority: 'high', ai_score: 90, sla_deadline: '2026-03-03', assigned_dca_id: 'DCA-004', enterprise_id: 'ENT-003', created_at: '2025-12-30T09:30:00Z', updated_at: '2026-02-15T12:00:00Z' },
];

// ─── Mock DCAs (for Agencies page) ───
export const MOCK_DCAS = [
    { id: 'DCA-001', name: 'Global Collections', contact_email: 'ops@globalcollections.com', performance_score: 92, active_cases: 85, resolved_cases: 78, sla_breaches: 4, recovered_amount: 8800000, average_resolution_days: 18 },
    { id: 'DCA-002', name: 'Alpha Recoveries', contact_email: 'team@alpharecoveries.com', performance_score: 87, active_cases: 62, resolved_cases: 56, sla_breaches: 7, recovered_amount: 6800000, average_resolution_days: 22 },
    { id: 'DCA-003', name: 'Summit Financial', contact_email: 'contact@summitfin.com', performance_score: 84, active_cases: 54, resolved_cases: 44, sla_breaches: 9, recovered_amount: 5300000, average_resolution_days: 25 },
    { id: 'DCA-004', name: 'Zenith Partners', contact_email: 'info@zenithpartners.com', performance_score: 79, active_cases: 42, resolved_cases: 32, sla_breaches: 11, recovered_amount: 4200000, average_resolution_days: 28 },
    { id: 'DCA-005', name: 'Apex Solutions', contact_email: 'hello@apexsolutions.com', performance_score: 74, active_cases: 35, resolved_cases: 24, sla_breaches: 14, recovered_amount: 3400000, average_resolution_days: 30 },
];

// ─── KPI data (legacy endpoint) ───
export const MOCK_KPI = {
    total_cases: 1247,
    total_dcas: 12,
    total_enterprises: 8,
    overall_recovery_rate: 32.8,
    sla_breaches: 23,
    high_priority_cases: 67,
};
