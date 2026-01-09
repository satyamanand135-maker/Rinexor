import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/auth'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-300 hover:bg-slate-900/60 hover:text-slate-50'}`
      }
    >
      {label}
    </NavLink>
  )
}

export function Shell() {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (state.status !== 'authenticated') return null

  const role = state.user.role
  const nav =
    role === 'super_admin'
      ? [
          { to: '/super-admin', label: 'Overview' },
          { to: '/cases', label: 'Cases' },
        ]
      : role === 'enterprise_admin'
        ? [
            { to: '/enterprise', label: 'Overview' },
            { to: '/cases', label: 'Cases' },
          ]
        : [
            { to: '/dca', label: 'My Work' },
            { to: '/cases', label: 'Assigned Cases' },
          ]

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-72 shrink-0">
          <Link to="/" className="block rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-wide text-slate-50">Rinexor</div>
                <div className="mt-1 text-xs text-slate-400">DCA Management Platform</div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                {role.replace('_', ' ')}
              </div>
            </div>
          </Link>
          <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-2 shadow-soft backdrop-blur">
            {nav.map((n) => (
              <NavItem key={n.to} to={n.to} label={n.label} />
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 shadow-soft backdrop-blur">
            <div className="text-xs text-slate-400">Signed in</div>
            <div className="mt-1 text-sm font-medium text-slate-100">{state.user.name}</div>
            <div className="mt-1 text-xs text-slate-400">{state.user.email}</div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="mt-3 w-full rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 transition-colors hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div key={location.pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
