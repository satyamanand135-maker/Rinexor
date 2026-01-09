import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './app/auth'
import { Shell } from './components/Shell'
import { CaseDetailPage } from './pages/CaseDetailPage.tsx'
import { CasesPage } from './pages/CasesPage.tsx'
import { DcaDashboard } from './pages/DcaDashboard.tsx'
import { EnterpriseDashboard } from './pages/EnterpriseDashboard'
import { LoginPage } from './pages/LoginPage'
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import type { Role } from './app/types'

function HomeRedirect() {
  const { state } = useAuth()
  if (state.status === 'loading') return null
  if (state.status !== 'authenticated') return <Navigate to="/login" replace />

  if (state.user.role === 'super_admin') return <Navigate to="/super-admin" replace />
  if (state.user.role === 'enterprise_admin') return <Navigate to="/enterprise" replace />
  return <Navigate to="/dca" replace />
}

function Protected({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  if (state.status === 'loading') return null
  if (state.status !== 'authenticated') return <Navigate to="/login" replace />
  return children
}

function RequireRoles({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { state } = useAuth()
  if (state.status === 'loading') return null
  if (state.status !== 'authenticated') return <Navigate to="/login" replace />
  if (!roles.includes(state.user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        >
          <Route index element={<HomeRedirect />} />
          <Route
            path="super-admin"
            element={
              <RequireRoles roles={['super_admin']}>
                <SuperAdminDashboard />
              </RequireRoles>
            }
          />
          <Route
            path="enterprise"
            element={
              <RequireRoles roles={['enterprise_admin']}>
                <EnterpriseDashboard />
              </RequireRoles>
            }
          />
          <Route
            path="dca"
            element={
              <RequireRoles roles={['dca_user']}>
                <DcaDashboard />
              </RequireRoles>
            }
          />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:caseId" element={<CaseDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
