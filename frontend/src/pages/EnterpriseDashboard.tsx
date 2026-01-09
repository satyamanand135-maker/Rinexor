import { useEffect, useMemo, useState } from 'react'
import { useRef } from 'react'
import { useAuth } from '../app/auth'
import { apiFetch } from '../api/client'
import type { AuditEvent, Case, DCA } from '../app/types'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
import { Badge } from '../components/Badge'
import { formatShortDate, isOverdue } from '../app/format'
import { Link } from 'react-router-dom'
import { config } from '../app/config'

export function EnterpriseDashboard() {
  const { state } = useAuth()
  const token = state.status === 'authenticated' ? state.token : null
  const [cases, setCases] = useState<Case[]>([])
  const [dcas, setDcas] = useState<DCA[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [creatingDca, setCreatingDca] = useState(false)
  const [newDcaName, setNewDcaName] = useState('')
  const [newDcaEmail, setNewDcaEmail] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!token) return
    setError(null)
    Promise.all([
      apiFetch<Case[]>('/api/cases', { token }),
      apiFetch<DCA[]>('/api/dashboard/dcas', { token }),
      apiFetch<AuditEvent[]>('/api/audit?limit=8', { token }).catch(() => [] as AuditEvent[]),
    ])
      .then(([c, d, a]) => {
        setCases(c)
        setDcas(d)
        setAudit(a)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [token])

  const derived = useMemo(() => {
    const total = cases.length
    const active = cases.filter((c) => ['pending', 'in_progress', 'contacted'].includes(c.status)).length
    const resolved = cases.filter((c) => c.status === 'resolved').length
    const overdue = cases.filter((c) => isOverdue(c.sla_deadline)).length
    const highRisk = cases.filter((c) => c.priority === 'critical' || (c.ai_score >= 80 && isOverdue(c.sla_deadline))).length
    const recoveryRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    return { total, active, resolved, overdue, highRisk, recoveryRate }
  }, [cases])

  const dcaRows = useMemo(() => {
    const used = new Map<string, number>()
    for (const c of cases) used.set(c.assigned_dca_id, (used.get(c.assigned_dca_id) ?? 0) + 1)
    return dcas
      .filter((d) => used.has(d.id))
      .slice()
      .sort((a, b) => (used.get(b.id) ?? 0) - (used.get(a.id) ?? 0))
      .map((d) => [
        <div key={d.id} className="font-medium text-slate-100">
          {d.name}
          <div className="mt-0.5 text-xs text-slate-400">{d.contact_email}</div>
        </div>,
        <span key={`${d.id}-assigned`}>{used.get(d.id) ?? 0}</span>,
        <Badge key={`${d.id}-score`} tone={d.performance_score >= 85 ? 'success' : d.performance_score >= 75 ? 'warning' : 'danger'}>
          {d.performance_score}
        </Badge>,
        <Badge key={`${d.id}-sla`} tone={d.sla_breaches <= 2 ? 'success' : d.sla_breaches <= 5 ? 'warning' : 'danger'}>
          {d.sla_breaches}
        </Badge>,
      ])
  }, [cases, dcas])

  const riskyRows = useMemo(() => {
    return cases
      .slice()
      .sort((a, b) => {
        const ao = isOverdue(a.sla_deadline) ? 1 : 0
        const bo = isOverdue(b.sla_deadline) ? 1 : 0
        if (bo !== ao) return bo - ao
        if (b.ai_score !== a.ai_score) return b.ai_score - a.ai_score
        const prioRank: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }
        return (prioRank[b.priority] ?? 0) - (prioRank[a.priority] ?? 0)
      })
      .slice(0, 8)
      .map((c) => [
        <div key={c.id} className="font-medium text-slate-100">
          <Link className="hover:underline" to={`/cases/${c.id}`}>
            {c.borrower_name}
          </Link>
          <div className="mt-0.5 text-xs text-slate-400">{c.id.slice(0, 8)}</div>
        </div>,
        <Badge key={`${c.id}-prio`} tone={c.priority === 'critical' ? 'danger' : c.priority === 'high' ? 'warning' : 'neutral'}>
          {c.priority.toUpperCase()}
        </Badge>,
        <Badge key={`${c.id}-ai`} tone={c.ai_score >= 80 ? 'info' : c.ai_score >= 50 ? 'neutral' : 'warning'}>
          AI {c.ai_score}
        </Badge>,
        <Badge key={`${c.id}-sla`} tone={isOverdue(c.sla_deadline) ? 'danger' : 'success'}>
          {isOverdue(c.sla_deadline) ? 'OVERDUE' : 'OK'}
        </Badge>,
      ])
  }, [cases])

  const auditRows = useMemo(() => {
    return audit.map((ev) => [
      <div key={ev.id} className="font-medium text-slate-100">
        {ev.action}
        <div className="mt-0.5 text-xs text-slate-400">{ev.case_id ? `Case ${ev.case_id.slice(0, 8)}` : '—'}</div>
      </div>,
      <span key={`${ev.id}-actor`} className="text-slate-200">
        {ev.actor_email}
      </span>,
      <span key={`${ev.id}-at`} className="text-slate-300">
        {formatShortDate(ev.at)}
      </span>,
    ])
  }, [audit])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Enterprise Admin</div>
        <div className="mt-1 text-2xl font-semibold text-slate-50">Recovery Control Center</div>
        <div className="mt-2 text-sm text-slate-300">Allocate work to DCAs, track recoveries, and enforce SLA governance.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f || !token) return
              setCsvUploading(true)
              setError(null)
              try {
                const form = new FormData()
                form.append('file', f)
                const res = await fetch(`${config.apiBaseUrl}/api/cases/upload-csv`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                  body: form,
                })
                if (!res.ok) {
                  const payload = await res.json().catch(() => null)
                  const msg =
                    payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
                      ? payload.detail
                      : `Upload failed (${res.status})`
                  throw new Error(msg)
                }

                const c = await apiFetch<Case[]>('/api/cases', { token })
                const a = await apiFetch<AuditEvent[]>('/api/audit?limit=8', { token }).catch(() => [] as AuditEvent[])
                setCases(c)
                setAudit(a)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'CSV upload failed')
              } finally {
                setCsvUploading(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }
            }}
          />

          <button
            disabled={!token || csvUploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-800/70 bg-slate-900/35 px-3 py-2 text-sm text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-60"
          >
            {csvUploading ? 'Uploading CSV…' : 'Upload CSV'}
          </button>

          <button
            disabled={!token || uploading}
            onClick={async () => {
              if (!token) return
              setUploading(true)
              setError(null)
              try {
                await apiFetch('/api/cases/upload', { token, method: 'POST' })
                const c = await apiFetch<Case[]>('/api/cases', { token })
                const a = await apiFetch<AuditEvent[]>('/api/audit?limit=8', { token }).catch(() => [] as AuditEvent[])
                setCases(c)
                setAudit(a)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed')
              } finally {
                setUploading(false)
              }
            }}
            className="rounded-xl border border-slate-800/70 bg-slate-900/35 px-3 py-2 text-sm text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Bulk Upload (Demo)'}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Cases" value={String(derived.total)} />
        <StatCard label="Recovery Rate" value={`${derived.recoveryRate}%`} hint="Resolved / total" />
        <StatCard label="Overdue (SLA)" value={String(derived.overdue)} hint="Immediate attention required" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="High-Risk Queue" right={<span className="text-xs text-slate-400">Top priority and overdue</span>}>
          <Table columns={['Case', 'Priority', 'AI', 'SLA']} rows={riskyRows} empty="No cases" />
        </Card>
        <Card title="DCA Performance (Active Enterprise Work)">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-400">Manage DCAs that can receive enterprise work.</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newDcaName}
                onChange={(e) => setNewDcaName(e.target.value)}
                placeholder="DCA name"
                className="w-40 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500"
              />
              <input
                value={newDcaEmail}
                onChange={(e) => setNewDcaEmail(e.target.value)}
                placeholder="Contact email (optional)"
                className="w-52 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500"
              />
              <button
                disabled={!token || creatingDca || !newDcaName.trim()}
                onClick={async () => {
                  if (!token || !newDcaName.trim()) return
                  setCreatingDca(true)
                  setError(null)
                  try {
                    await apiFetch<DCA>('/api/dashboard/dcas', {
                      token,
                      method: 'POST',
                      body: JSON.stringify({
                        name: newDcaName.trim(),
                        contact_email: newDcaEmail.trim() || undefined,
                      }),
                    })
                    const d = await apiFetch<DCA[]>('/api/dashboard/dcas', { token })
                    setDcas(d)
                    setNewDcaName('')
                    setNewDcaEmail('')
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to create DCA')
                  } finally {
                    setCreatingDca(false)
                  }
                }}
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-60"
              >
                {creatingDca ? 'Adding…' : 'Add DCA'}
              </button>
            </div>
          </div>
          <Table columns={['DCA', 'Assigned', 'Score', 'SLA Breaches']} rows={dcaRows} empty="No DCAs assigned" />
        </Card>
      </div>

      <Card title="Recent Activity" right={<span className="text-xs text-slate-400">Audit-style summary</span>}>
        <Table columns={['Action', 'Actor', 'When']} rows={auditRows} empty="No audit events" />
      </Card>
    </div>
  )
}
