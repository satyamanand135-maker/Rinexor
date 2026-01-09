import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { apiFetch } from '../api/client'
import type { Case, CaseStatus } from '../app/types'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
import { Badge } from '../components/Badge'
import { isOverdue } from '../app/format'

export function DcaDashboard() {
  const { state } = useAuth()
  const token = state.status === 'authenticated' ? state.token : null
  const [cases, setCases] = useState<Case[]>([])
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setError(null)
    apiFetch<Case[]>('/api/cases', { token })
      .then(setCases)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [token])

  const derived = useMemo(() => {
    const total = cases.length
    const todo = cases.filter((c) => c.status !== 'resolved' && c.status !== 'failed').length
    const overdue = cases.filter((c) => isOverdue(c.sla_deadline)).length
    const critical = cases.filter((c) => c.priority === 'critical' || c.ai_score >= 85).length
    return { total, todo, overdue, critical }
  }, [cases])

  const worklistRows = useMemo(() => {
    const prioRank: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }
    return cases
      .slice()
      .sort((a, b) => {
        const ao = isOverdue(a.sla_deadline) ? 1 : 0
        const bo = isOverdue(b.sla_deadline) ? 1 : 0
        if (bo !== ao) return bo - ao
        if (b.ai_score !== a.ai_score) return b.ai_score - a.ai_score
        return (prioRank[b.priority] ?? 0) - (prioRank[a.priority] ?? 0)
      })
      .slice(0, 10)
      .map((c) => {
        const nextStatus: CaseStatus =
          c.status === 'pending'
            ? 'in_progress'
            : c.status === 'in_progress'
            ? 'promised'
            : c.status === 'promised'
            ? 'recovered'
            : c.status

        return [
          <div key={c.id} className="font-medium text-slate-100">
            <Link className="hover:underline" to={`/cases/${c.id}`}>
              {c.borrower_name}
            </Link>
            <div className="mt-0.5 text-xs text-slate-400">{c.borrower_phone}</div>
          </div>,
          <div key={`${c.id}-status`} className="flex items-center gap-2">
            <Badge tone={c.status === 'recovered' || c.status === 'resolved' ? 'success' : c.status === 'failed' ? 'danger' : 'neutral'}>
              {c.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {nextStatus !== c.status ? (
              <button
                type="button"
                disabled={!token || updatingId === c.id}
                onClick={async () => {
                  if (!token) return
                  let proof_type: string | undefined
                  let proof_reference: string | undefined
                  if (nextStatus === 'resolved' || nextStatus === 'recovered') {
                    const pt = window.prompt('Enter proof type (e.g. UTR, gateway_reference, settlement_letter)')
                    if (!pt) {
                      return
                    }
                    const pr = window.prompt('Enter proof reference (transaction ID, document ID, etc.)')
                    if (!pr) {
                      return
                    }
                    proof_type = pt
                    proof_reference = pr
                  }
                  setUpdatingId(c.id)
                  setError(null)
                  try {
                    const updated = await apiFetch<Case>(`/api/cases/${c.id}`, {
                      token,
                      method: 'PUT',
                      body: JSON.stringify({
                        status: nextStatus,
                        proof_type: proof_type,
                        proof_reference: proof_reference,
                      }),
                    })
                    setCases((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to update status')
                  } finally {
                    setUpdatingId(null)
                  }
                }}
                className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60"
              >
                {updatingId === c.id ? 'Updating…' : `Mark ${nextStatus.replace('_', ' ')}`}
              </button>
            ) : null}
          </div>,
          <Badge key={`${c.id}-prio`} tone={c.priority === 'critical' ? 'danger' : c.priority === 'high' ? 'warning' : 'neutral'}>
            {c.priority.toUpperCase()}
          </Badge>,
          <Badge key={`${c.id}-ai`} tone={c.ai_score >= 85 ? 'info' : c.ai_score >= 60 ? 'neutral' : 'warning'}>
            {c.ai_score}
          </Badge>,
          <Badge key={`${c.id}-sla`} tone={isOverdue(c.sla_deadline) ? 'danger' : 'success'}>
            {isOverdue(c.sla_deadline) ? 'OVERDUE' : 'OK'}
          </Badge>,
        ]
      })
  }, [cases, token, updatingId])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">DCA User</div>
        <div className="mt-1 text-2xl font-semibold text-slate-50">Execution Workbench</div>
        <div className="mt-2 text-sm text-slate-300">AI-ranked queue focused on fast outreach and closure.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Assigned Cases" value={String(derived.total)} />
        <StatCard label="Open Tasks" value={String(derived.todo)} />
        <StatCard label="Overdue (SLA)" value={String(derived.overdue)} />
        <StatCard label="High Priority" value={String(derived.critical)} />
      </div>

      <Card title="Top Worklist" right={<span className="text-xs text-slate-400">Sorted by SLA + AI score</span>}>
        <Table columns={['Borrower', 'Status', 'Priority', 'AI', 'SLA']} rows={worklistRows} empty="No assigned cases" />
      </Card>
    </div>
  )
}
