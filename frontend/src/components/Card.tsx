import type { ReactNode } from 'react'

export function Card({ title, children, right }: { title?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 shadow-sm">
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {right ? <div className="text-sm text-slate-300">{right}</div> : null}
        </div>
      ) : null}
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

