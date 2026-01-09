import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { apiFetch } from '../api/client'
import type { AuditEvent, Case, CaseStatus, DCA } from '../app/types'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { formatMoney, formatShortDate, isOverdue } from '../app/format'

const statusOptions: CaseStatus[] = ['pending', 'in_progress', 'contacted', 'resolved', 'failed']

export function CaseDetailPage() {
  const { caseId } = useParams()
  const { state } = useAuth()
  const token = state.status === 'authenticated' ? state.token : null
  const role = state.status === 'authenticated' ? state.user.role : null
  const navigate = useNavigate()

  const [caze, setCaze] = useState<Case | null>(null)
  const [dcas, setDcas] = useState<DCA[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const [status, setStatus] = useState<CaseStatus>('pending')
  const [remarks, setRemarks] = useState<string>('')
  const [assignedDcaId, setAssignedDcaId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !caseId) return
    setError(null)
    Promise.all([
      apiFetch<Case>(`/api/cases/${caseId}`, { token }),
      apiFetch<DCA[]>('/api/dashboard/dcas', { token }),
      apiFetch<AuditEvent[]>(`/api/audit?case_id=${encodeURIComponent(caseId)}`, { token }).catch(() => [] as AuditEvent[]),
    ])
      .then(([caseRes, dRes, aRes]) => {
        setCaze(caseRes)
        setStatus(caseRes.status)
        setRemarks(caseRes.remarks ?? '')
        setAssignedDcaId(caseRes.assigned_dca_id)
        setDcas(dRes)
        setAudit(aRes)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [caseId, token])

  const dcaNameById = useMemo(() => new Map(dcas.map((d) => [d.id, d.name])), [dcas])

  if (!caseId) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Case</div>
          <div className="mt-1 text-2xl font-semibold text-slate-50">{caze ? caze.borrower_name : 'Loading…'}</div>
          <div className="mt-2 text-sm text-slate-300">
            <Link className="hover:underline" to="/cases">
              Back to cases
            </Link>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-400">{caseId.slice(0, 12)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900"
        >
          Back
        </button>
      </div>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Borrower">
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-slate-400">Email</div>
              <div className="text-slate-100">{caze?.borrower_email ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Phone</div>
              <div className="text-slate-100">{caze?.borrower_phone ?? '—'}</div>
            </div>
          </div>
        </Card>

        <Card title="Financials & SLA">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-400">Amount</div>
              <div className="font-semibold text-slate-50">{caze ? formatMoney(caze.amount) : '—'}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-slate-400">AI Score</div>
              {caze ? (
                <Badge tone={caze.ai_score >= 85 ? 'info' : caze.ai_score >= 60 ? 'neutral' : 'warning'}>{caze.ai_score}</Badge>
              ) : (
                '—'
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-slate-400">SLA Deadline</div>
              {caze ? (
                <Badge tone={isOverdue(caze.sla_deadline) ? 'danger' : 'success'}>{formatShortDate(caze.sla_deadline)}</Badge>
              ) : (
                '—'
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-slate-400">Assigned DCA</div>
              <div className="text-slate-100">{caze ? dcaNameById.get(caze.assigned_dca_id) ?? caze.assigned_dca_id : '—'}</div>
            </div>
          </div>
        </Card>

        <Card title="Operational Update">
          <div className="space-y-3">
            {role === 'enterprise_admin' ? (
              <div>
                <label className="block text-xs font-medium text-slate-400">Reassign DCA</label>
                <select
                  value={assignedDcaId}
                  onChange={(e) => setAssignedDcaId(e.target.value)}
                  disabled={!caze || saving}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                >
                  {dcas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div>
              <label className="block text-xs font-medium text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                disabled={!caze || role === 'super_admin'}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {role === 'super_admin' ? <div className="mt-1 text-xs text-slate-500">Read-only in governance mode</div> : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={!caze || role === 'super_admin'}
                rows={4}
                className="mt-1 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                placeholder="Add contact outcome, promised payment date, escalation notes..."
              />
            </div>
            <button
              disabled={!caze || role === 'super_admin' || saving}
              onClick={async () => {
                if (!token || !caze) return
                setSaving(true)
                setError(null)
                try {
                  const updated = await apiFetch<Case>(`/api/cases/${caze.id}`, {
                    token,
                    method: 'PUT',
                    body: JSON.stringify({ status, remarks, assigned_dca_id: role === 'enterprise_admin' ? assignedDcaId : undefined }),
                  })
                  setCaze(updated)
                  setAssignedDcaId(updated.assigned_dca_id)
                  const aRes = await apiFetch<AuditEvent[]>(`/api/audit?case_id=${encodeURIComponent(caze.id)}`, { token }).catch(() => [])
                  setAudit(aRes)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Update failed')
                } finally {
                  setSaving(false)
                }
              }}
              className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Update'}
            </button>
          </div>
        </Card>
      </div>

      <Card title="Case History (Audit)">
        <div className="space-y-2 text-sm">
          {audit.length === 0 ? (
            <div className="text-slate-400">No audit events available.</div>
          ) : (
            <div className="space-y-3">
              {audit
                .slice()
                .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                .map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-slate-100">{ev.action}</div>
                      <div className="text-xs text-slate-400">{formatShortDate(ev.at)}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {ev.actor_email} • {ev.actor_role}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
