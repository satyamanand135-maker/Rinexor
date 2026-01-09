import type { ReactNode } from 'react'

export function Table({
  columns,
  rows,
  empty,
}: {
  columns: string[]
  rows: ReactNode[][]
  empty?: ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/60">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 bg-slate-950/20">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {empty ?? 'No data'}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40">
                {r.map((cell, cidx) => (
                  <td key={cidx} className="px-4 py-2 align-top text-slate-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

