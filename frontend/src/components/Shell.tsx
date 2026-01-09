import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-64 shrink-0">
          <Link to="/" className="block rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3">
            <div className="text-sm font-semibold tracking-wide text-slate-50">Rinexor</div>
            <div className="mt-1 text-xs text-slate-400">DCA Management Platform</div>
          </Link>
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 p-2">
            {nav.map((n) => (
              <NavItem key={n.to} to={n.to} label={n.label} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3">
            <div className="text-xs text-slate-400">Signed in</div>
            <div className="mt-1 text-sm font-medium text-slate-100">{state.user.name}</div>
            <div className="mt-1 text-xs text-slate-400">{state.user.email}</div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="mt-3 w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

