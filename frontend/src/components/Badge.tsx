import type { ReactNode } from 'react'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
        : tone === 'danger'
          ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30'
          : tone === 'info'
            ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30'
            : 'bg-slate-500/15 text-slate-200 ring-1 ring-slate-500/30'

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>
}

