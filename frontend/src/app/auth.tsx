import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { config } from './config'
import type { Role, UserProfile } from './types'

type AuthState =
  | { status: 'loading'; token: string | null; user: UserProfile | null }
  | { status: 'anonymous'; token: null; user: null }
  | { status: 'authenticated'; token: string; user: UserProfile }

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  requireRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(config.tokenStorageKey)
    if (!token) return { status: 'anonymous', token: null, user: null }
    return { status: 'loading', token, user: null }
  })

  const logout = useCallback(() => {
    localStorage.removeItem(config.tokenStorageKey)
    setState({ status: 'anonymous', token: null, user: null })
  }, [])

  const loadProfile = useCallback(async (token: string) => {
    const profile = await apiFetch<UserProfile>('/api/auth/profile', { token, method: 'GET' })
    setState({ status: 'authenticated', token, user: profile })
  }, [])

  useEffect(() => {
    if (state.status !== 'loading' || !state.token) return
    loadProfile(state.token).catch(() => logout())
  }, [loadProfile, logout, state.status, state.token])

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ status: 'loading', token: prev.token, user: null }))
    const tokenRes = await apiFetch<{ access_token: string; token_type: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(config.tokenStorageKey, tokenRes.access_token)
    await loadProfile(tokenRes.access_token)
  }, [loadProfile])

  const requireRole = useCallback(
    (roles: Role[]) => (state.status === 'authenticated' ? roles.includes(state.user.role) : false),
    [state],
  )

  const value = useMemo<AuthContextValue>(() => ({ state, login, logout, requireRole }), [state, login, logout, requireRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

