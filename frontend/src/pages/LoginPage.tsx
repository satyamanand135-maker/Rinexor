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
    <div className="relative min-h-screen bg-surface-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 animate-float rounded-full bg-sky-500/15 blur-3xl [animation-delay:-2s]" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="animate-fade-up rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6 shadow-glow backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold tracking-wide text-slate-50">Rinexor</div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Demo
              </div>
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">Debt Collection Governance</div>
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
                    className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-900/35 px-3 py-2 text-left text-sm text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/80 hover:bg-slate-900"
                  >
                    <span className="font-medium">{u.label}</span>
                    <span className="text-xs text-slate-400">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:40ms]">
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
                  className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition-colors focus:border-slate-700/80"
                  placeholder="name@company.com"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 transition-colors focus:border-slate-700/80"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
              {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}
              <button
                disabled={isBusy}
                className="w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-400 disabled:opacity-60"
              >
                {isBusy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
