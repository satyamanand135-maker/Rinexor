import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../app/auth'
import { apiFetch } from '../api/client'
import type { AuditEvent, DCA, Enterprise, KPI } from '../app/types'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
import { Badge } from '../components/Badge'
import { formatShortDate } from '../app/format'

export function SuperAdminDashboard() {
  const { state } = useAuth()
  const token = state.status === 'authenticated' ? state.token : null
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [dcas, setDcas] = useState<DCA[]>([])
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setError(null)
    Promise.all([
      apiFetch<KPI>('/api/dashboard/kpis', { token }),
      apiFetch<DCA[]>('/api/dashboard/dcas', { token }),
      apiFetch<Enterprise[]>('/api/dashboard/enterprises', { token }),
      apiFetch<AuditEvent[]>('/api/audit?limit=10', { token }).catch(() => [] as AuditEvent[]),
    ])
      .then(([k, d, e, a]) => {
        setKpi(k)
        setDcas(d)
        setEnterprises(e)
        setAudit(a)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [token])

  const enterpriseRows = useMemo(
    () =>
      enterprises
        .slice()
        .sort((a, b) => b.total_cases - a.total_cases)
        .map((e) => [
          <div key={e.id} className="font-medium text-slate-100">
            {e.name}
            <div className="mt-0.5 text-xs text-slate-400">{e.id}</div>
          </div>,
          <span key={`${e.id}-cases`} className="text-slate-200">
            {e.total_cases}
          </span>,
          <span key={`${e.id}-active`} className="text-slate-200">
            {e.active_cases}
          </span>,
          <span key={`${e.id}-resolved`} className="text-slate-200">
            {e.resolved_cases}
          </span>,
          <Badge key={`${e.id}-rate`} tone={e.recovery_rate >= 70 ? 'success' : e.recovery_rate >= 50 ? 'warning' : 'danger'}>
            {e.recovery_rate}%
          </Badge>,
        ]),
    [enterprises],
  )

  const dcaRows = useMemo(
    () =>
      dcas
        .slice()
        .sort((a, b) => b.performance_score - a.performance_score)
        .map((d) => [
          <div key={d.id} className="font-medium text-slate-100">
            {d.name}
            <div className="mt-0.5 text-xs text-slate-400">{d.id}</div>
          </div>,
          <Badge key={`${d.id}-score`} tone={d.performance_score >= 85 ? 'success' : d.performance_score >= 75 ? 'warning' : 'danger'}>
            {d.performance_score}
          </Badge>,
          <span key={`${d.id}-active`}>{d.active_cases}</span>,
          <span key={`${d.id}-resolved`}>{d.resolved_cases}</span>,
          <span key={`${d.id}-recovered`}>{d.recovered_amount ?? 0}</span>,
          <span key={`${d.id}-time`}>
            {typeof d.average_resolution_days === 'number' ? `${d.average_resolution_days}d` : '–'}
          </span>,
          <Badge key={`${d.id}-sla`} tone={d.sla_breaches <= 2 ? 'success' : d.sla_breaches <= 5 ? 'warning' : 'danger'}>
            {d.sla_breaches}
          </Badge>,
        ]),
    [dcas],
  )

  const auditRows = useMemo(() => {
    return audit.map((ev) => [
      <div key={ev.id} className="font-medium text-slate-100">
        {ev.action}
        <div className="mt-0.5 text-xs text-slate-400">{ev.case_id ? `Case ${ev.case_id.slice(0, 8)}` : '—'}</div>
      </div>,
      <span key={`${ev.id}-actor`} className="text-slate-200">
        {ev.actor_email}
      </span>,
      <Badge key={`${ev.id}-role`} tone={ev.actor_role === 'super_admin' ? 'info' : ev.actor_role === 'enterprise_admin' ? 'neutral' : 'warning'}>
        {ev.actor_role}
      </Badge>,
      <span key={`${ev.id}-at`} className="text-slate-300">
        {formatShortDate(ev.at)}
      </span>,
    ])
  }, [audit])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Super Admin</div>
        <div className="mt-1 text-2xl font-semibold text-slate-50">Platform Governance Overview</div>
        <div className="mt-2 text-sm text-slate-300">System-wide visibility across enterprises, DCAs, and SLA performance.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Cases" value={kpi ? String(kpi.total_cases) : '—'} />
        <StatCard label="Recovery Rate" value={kpi ? `${kpi.overall_recovery_rate}%` : '—'} hint="Resolved cases platform-wide" />
        <StatCard label="SLA Breaches" value={kpi ? String(kpi.sla_breaches) : '—'} hint="Overdue deadlines" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Enterprise Performance">
          <Table columns={['Enterprise', 'Total', 'Active', 'Resolved', 'Recovery']} rows={enterpriseRows} empty="No enterprises" />
        </Card>
        <Card title="DCA Performance">
          <Table
            columns={['DCA', 'Score', 'Active', 'Resolved', 'Recovered Amount', 'Avg Days to Recover', 'SLA Breaches']}
            rows={dcaRows}
            empty="No DCAs"
          />
        </Card>
      </div>

      <Card title="Recent Activity" right={<span className="text-xs text-slate-400">Audit-style summary</span>}>
        <Table columns={['Action', 'Actor', 'Role', 'When']} rows={auditRows} empty="No audit events" />
      </Card>
    </div>
  )
}
