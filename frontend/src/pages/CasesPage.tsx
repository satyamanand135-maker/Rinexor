import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { apiFetch } from '../api/client'
import type { Case, CasePriority, CaseStatus, DCA } from '../app/types'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
import { formatMoney, formatShortDate, isOverdue } from '../app/format'

const statuses: CaseStatus[] = ['pending', 'in_progress', 'contacted', 'promised', 'recovered', 'resolved', 'failed']
const priorities: CasePriority[] = ['low', 'medium', 'high', 'critical']

export function CasesPage() {
  const { state } = useAuth()
  const token = state.status === 'authenticated' ? state.token : null
  const role = state.status === 'authenticated' ? state.user.role : null
  const [cases, setCases] = useState<Case[]>([])
  const [dcas, setDcas] = useState<DCA[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const status = (searchParams.get('status') as CaseStatus | null) ?? ''
  const priority = (searchParams.get('priority') as CasePriority | null) ?? ''
  const overdue = (searchParams.get('overdue') as '1' | null) ?? ''

  useEffect(() => {
    if (!token) return
    setError(null)
    const qs = new URLSearchParams()
    if (status) qs.set('status', status)
    const url = qs.toString() ? `/api/cases?${qs.toString()}` : '/api/cases'
    Promise.all([apiFetch<Case[]>(url, { token }), apiFetch<DCA[]>('/api/dashboard/dcas', { token })])
      .then(([c, d]) => {
        setCases(c)
        setDcas(d)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [status, token])

  const dcaNameById = useMemo(() => new Map(dcas.map((d) => [d.id, d.name])), [dcas])

  const filtered = useMemo(() => {
    let list = cases
    if (priority) list = list.filter((c) => c.priority === priority)
    if (overdue) list = list.filter((c) => isOverdue(c.sla_deadline))
    return list
  }, [cases, overdue, priority])

  const rows = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => {
          const ao = isOverdue(a.sla_deadline) ? 1 : 0
          const bo = isOverdue(b.sla_deadline) ? 1 : 0
          if (bo !== ao) return bo - ao
          return b.ai_score - a.ai_score
        })
        .map((c) => [
          <div key={c.id} className="font-medium text-slate-100">
            <Link className="hover:underline" to={`/cases/${c.id}`}>
              {c.borrower_name}
            </Link>
            <div className="mt-0.5 text-xs text-slate-400">{c.borrower_email}</div>
          </div>,
          <span key={`${c.id}-amount`} className="font-medium text-slate-100">
            {formatMoney(c.amount)}
          </span>,
          <Badge key={`${c.id}-status`} tone={c.status === 'resolved' ? 'success' : c.status === 'failed' ? 'danger' : 'neutral'}>
            {c.status.replace('_', ' ').toUpperCase()}
          </Badge>,
          <Badge key={`${c.id}-prio`} tone={c.priority === 'critical' ? 'danger' : c.priority === 'high' ? 'warning' : 'neutral'}>
            {c.priority.toUpperCase()}
          </Badge>,
          <Badge key={`${c.id}-ai`} tone={c.ai_score >= 85 ? 'info' : c.ai_score >= 60 ? 'neutral' : 'warning'}>
            {c.ai_score}
          </Badge>,
          <Badge key={`${c.id}-sla`} tone={isOverdue(c.sla_deadline) ? 'danger' : 'success'}>
            {formatShortDate(c.sla_deadline)}
          </Badge>,
          <span key={`${c.id}-dca`} className="text-slate-200">
            {dcaNameById.get(c.assigned_dca_id) ?? c.assigned_dca_id}
          </span>,
        ]),
    [dcaNameById, filtered],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cases</div>
          <div className="mt-1 text-2xl font-semibold text-slate-50">
            {role === 'dca_user' ? 'Assigned Cases' : role === 'enterprise_admin' ? 'Enterprise Cases' : 'System Cases'}
          </div>
          <div className="mt-2 text-sm text-slate-300">Filters highlight priority and SLA risk for fast action.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === 'enterprise_admin' ? (
            <button
              disabled={!token || uploading}
              onClick={async () => {
                if (!token) return
                setUploading(true)
                setError(null)
                try {
                  await apiFetch('/api/cases/upload', { token, method: 'POST' })
                  const qs = new URLSearchParams()
                  if (status) qs.set('status', status)
                  const url = qs.toString() ? `/api/cases?${qs.toString()}` : '/api/cases'
                  const [c, d] = await Promise.all([apiFetch<Case[]>(url, { token }), apiFetch<DCA[]>('/api/dashboard/dcas', { token })])
                  setCases(c)
                  setDcas(d)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Upload failed')
                } finally {
                  setUploading(false)
                }
              }}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900 disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : 'Bulk Upload'}
            </button>
          ) : null}
          <select
            value={status}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams)
              const v = e.target.value
              if (!v) next.delete('status')
              else next.set('status', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Status: All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams)
              const v = e.target.value
              if (!v) next.delete('priority')
              else next.set('priority', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Priority: All</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              if (overdue) next.delete('overdue')
              else next.set('overdue', '1')
              setSearchParams(next, { replace: true })
            }}
            className={`rounded-lg border px-3 py-2 text-sm ${
              overdue ? 'border-rose-500/40 bg-rose-500/10 text-rose-200' : 'border-slate-800 bg-slate-900/40 text-slate-100 hover:bg-slate-900'
            }`}
          >
            Overdue only
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <Card title={`Results (${filtered.length})`} right={<span className="text-xs text-slate-400">AI score + SLA badges drive prioritization</span>}>
        <Table columns={['Borrower', 'Amount', 'Status', 'Priority', 'AI', 'SLA', 'DCA']} rows={rows} empty="No cases match filters" />
      </Card>
    </div>
  )
}
