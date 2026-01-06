import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Building2, Users, ArrowLeft } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from;

  const roles = [
    {
      id: 'super_admin',
      title: 'Super Admin',
      subtitle: 'System-wide control & governance',
      icon: Shield,
      color: 'bg-brand-violet',
      textColor: 'text-brand-violet'
    },
    {
      id: 'enterprise_admin',
      title: 'Enterprise Admin',
      subtitle: 'Enterprise case & DCA management',
      icon: Building2,
      color: 'bg-brand-blue',
      textColor: 'text-brand-blue'
    },
    {
      id: 'dca_agent',
      title: 'DCA Portal',
      subtitle: 'Agency-level case execution',
      icon: Users,
      color: 'bg-brand-teal',
      textColor: 'text-brand-teal'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
           <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
             <ArrowLeft size={20} /> Back to Home
           </button>
           
           <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-navy rounded-xl text-white font-bold text-2xl mb-6">R</div>
           <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Your Role</h1>
           <p className="text-slate-500">Choose your access level to proceed to the secure portal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(`/auth/login/${role.id}`, { state: { from } })}
              className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${role.color}`}></div>
              <div className={`w-14 h-14 rounded-xl ${role.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <role.icon className={role.textColor} size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors">{role.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{role.subtitle}</p>
            </button>
          ))}
        </div>
        
        <div className="mt-12 text-center">
           <p className="text-sm text-slate-400">
             Secure Enterprise Access • SOC 2 Type II Compliant
           </p>
        </div>
      </div>
    </div>
  );
}
