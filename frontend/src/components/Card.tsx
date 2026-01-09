import type { ReactNode } from 'react'

export function Card({ title, children, right }: { title?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/40 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/80 hover:bg-slate-950/60">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      {title ? (
        <div className="relative flex items-center justify-between gap-3 border-b border-slate-800/70 px-4 py-3">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {right ? <div className="text-sm text-slate-300">{right}</div> : null}
        </div>
      ) : null}
      <div className="relative px-4 py-3">{children}</div>
    </div>
  )
}
