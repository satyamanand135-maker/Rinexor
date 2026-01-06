import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'super_admin' | 'enterprise_admin' | 'dca_agent' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // We don't need navigate here since login will be called from components that can navigate
  
  const login = (role: UserRole) => {
    let userData: User;
    
    switch (role) {
      case 'super_admin':
        userData = { id: 'SA-001', name: 'System Administrator', role: 'super_admin', email: 'superadmin@rinexor.ai' };
        break;
      case 'enterprise_admin':
        userData = { id: 'EA-001', name: 'John Doe', role: 'enterprise_admin', email: 'admin@enterprise.com' };
        break;
      case 'dca_agent':
        userData = { id: 'DA-001', name: 'Agent Smith', role: 'dca_agent', email: 'agent@dca.com' };
        break;
      default:
        return;
    }
    
    setUser(userData);
    localStorage.setItem('rinexor_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rinexor_user');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('rinexor_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
