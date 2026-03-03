import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ArrowLeft, Lock, Shield, Building2, Users, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const params = useParams();

  const roleParam = (params.role as UserRole) ?? null;
  const from = (location.state as any)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credential hints
  const DEMO_HINTS: Record<string, { email: string; password: string }> = {
    super_admin: { email: 'superadmin@rinexor.ai', password: 'Super@123' },
    enterprise_admin: { email: 'admin@enterprise.com', password: 'Enterprise@123' },
    dca_agent: { email: 'agent@dca.com', password: 'DCA@123' },
  };

  useEffect(() => {
    if (!roleParam || !['super_admin', 'enterprise_admin', 'dca_agent'].includes(roleParam)) {
      navigate('/auth/roles', { replace: true });
      return;
    }
    // Pre-fill demo credentials as hints
    const hint = DEMO_HINTS[roleParam];
    if (hint) {
      setEmail(hint.email);
      setPassword(hint.password);
    }
  }, [roleParam, navigate]);

  const getRoleDetails = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { title: 'Super Admin', icon: Shield, color: 'text-brand-violet', bg: 'bg-brand-violet' };
      case 'enterprise_admin':
        return { title: 'Enterprise Admin', icon: Building2, color: 'text-brand-blue', bg: 'bg-brand-blue' };
      case 'dca_agent':
        return { title: 'DCA Portal', icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal' };
      default:
        return { title: 'Login', icon: Lock, color: 'text-slate-600', bg: 'bg-slate-600' };
    }
  };

  const roleDetails = getRoleDetails(roleParam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Authenticate via backend API
    const result = await login(email, password);

    if (result.success) {
      navigate(from?.pathname || '/dashboard', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials. Please check your email and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <button onClick={() => navigate('/auth/roles', { state: { from } })} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium">
            <ArrowLeft size={16} /> Change Role
          </button>
          <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-sm">R</div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full ${roleDetails.bg} bg-opacity-10 flex items-center justify-center mx-auto mb-4`}>
              <roleDetails.icon className={roleDetails.color} size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-1">Logging in as <span className={`font-medium ${roleDetails.color}`}>{roleDetails.title}</span></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">User ID / Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-navy hover:bg-slate-800 shadow-brand-navy/20'}`}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <ArrowLeft size={18} className="rotate-180" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
              <span>Demo credentials pre-filled • Enter any valid credentials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
