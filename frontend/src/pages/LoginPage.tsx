import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'
import { Card } from '../components/Card'

export function LoginPage() {
  const { state, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@rinexor.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)

  const isBusy = state.status === 'loading'

  const demoUsers = useMemo(
    () => [
      { label: 'Super Admin', email: 'admin@rinexor.com', password: 'admin123' },
      { label: 'Enterprise Admin', email: 'enterprise@demo.com', password: 'enterprise123' },
      { label: 'DCA User', email: 'dca@demo.com', password: 'dca123' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-6">
            <div className="text-sm font-semibold tracking-wide text-slate-50">Rinexor</div>
            <div className="mt-2 text-2xl font-semibold text-slate-50">Debt Collection Governance</div>
            <div className="mt-3 text-sm leading-6 text-slate-300">
              Role-based dashboards, AI prioritization, SLA monitoring, and audit-ready oversight for enterprise debt recovery.
            </div>
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo Logins</div>
              <div className="mt-3 grid gap-2">
                {demoUsers.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      setEmail(u.email)
                      setPassword(u.password)
                      setError(null)
                    }}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-900"
                  >
                    <span className="font-medium">{u.label}</span>
                    <span className="text-xs text-slate-400">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Card title="Secure Login">
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setError(null)
                try {
                  await login(email, password)
                  navigate('/', { replace: true })
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Login failed')
                }
              }}
            >
              <div>
                <label className="block text-xs font-medium text-slate-400">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-slate-700"
                  placeholder="name@company.com"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-slate-700"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
              {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}
              <button
                disabled={isBusy}
                className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {isBusy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

