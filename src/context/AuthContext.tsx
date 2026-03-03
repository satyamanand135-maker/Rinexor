import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

export type UserRole = 'super_admin' | 'enterprise_admin' | 'dca_agent' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials for quick access  
const DEMO_CREDENTIALS: Record<string, { email: string; password: string; name: string }> = {
  super_admin: { email: 'superadmin@rinexor.ai', password: 'Super@123', name: 'System Administrator' },
  enterprise_admin: { email: 'admin@enterprise.com', password: 'Enterprise@123', name: 'John Doe' },
  dca_agent: { email: 'agent@dca.com', password: 'DCA@123', name: 'Agent Smith' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login(email, password);
      if (response?.access_token) {
        apiClient.setToken(response.access_token);

        // Extract user data from login response
        const userData: User = {
          id: (response as any).user?.id || 'U-001',
          name: (response as any).user?.name || email.split('@')[0],
          role: (response as any).user?.role as UserRole || 'dca_agent',
          email: (response as any).user?.email || email,
        };

        setUser(userData);
        localStorage.setItem('rinexor_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'No access token received' };
    } catch (err: any) {
      console.error('Login failed:', err);
      return { success: false, error: err?.message || 'Invalid credentials' };
    }
  };

  // Quick demo login using preset credentials
  const loginDemo = async (role: UserRole) => {
    if (!role) return;
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return;

    const result = await login(creds.email, creds.password);
    if (!result.success) {
      // Fallback: set user locally even if backend is down
      const userData: User = {
        id: `DEMO-${role}`,
        name: creds.name,
        role,
        email: creds.email,
      };
      setUser(userData);
      localStorage.setItem('rinexor_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rinexor_user');
    localStorage.removeItem('rinexor_token');
    apiClient.setToken(null);
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('rinexor_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Re-authenticate with backend
      const storedToken = localStorage.getItem('rinexor_token');
      if (storedToken) {
        apiClient.setToken(storedToken);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
