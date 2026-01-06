import { useState } from 'react';
import { Layout, Users, Activity } from 'lucide-react';

export default function PlatformModules() {
  const [activeTab, setActiveTab] = useState('enterprise');

  const modules = [
    {
      id: 'super-admin',
      label: 'Super Admin',
      icon: Activity,
      title: "Super Admin Dashboard",
      desc: "Complete system oversight. Monitor DCA performance across the network, manage global configurations, and track system-wide recovery health.",
      color: "bg-brand-violet"
    },
    {
      id: 'enterprise',
      label: 'Enterprise Admin',
      icon: Layout,
      title: "Enterprise Admin Dashboard",
      desc: "The command center for finance teams. Upload debt portfolios, set SLA rules, monitor agency allocation, and handle escalations in real-time.",
      color: "bg-brand-blue"
    },
    {
      id: 'dca',
      label: 'DCA Portal',
      icon: Users,
      title: "Agency Agent Portal",
      desc: "A focused interface for collectors. View assigned cases prioritized by AI, update status, and communicate directly with enterprise stakeholders.",
      color: "bg-brand-teal"
    }
  ];

  const activeModule = modules.find(m => m.id === activeTab) || modules[0];

  return (
    <section id="platform" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Unified Platform, Specialized Modules</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Tailored interfaces for every stakeholder in the recovery ecosystem.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
          {modules.map((module) => (
            <button
              type="button"
              key={module.id}
              onClick={() => setActiveTab(module.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                activeTab === module.id 
                  ? 'bg-brand-navy text-white shadow-lg' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <module.icon size={18} />
              {module.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-5xl mx-auto transition-all duration-300">
          <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            </div>
            <div className="text-xs font-medium text-slate-400 flex-1 text-center">Rinexor {activeModule.label}</div>
            <div className="w-12"></div>
          </div>
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
               <div className={`inline-block p-3 rounded-xl ${activeModule.color} bg-opacity-10`}>
                 <activeModule.icon className={activeModule.color.replace('bg-', 'text-')} size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900">{activeModule.title}</h3>
               <p className="text-slate-500 leading-relaxed text-lg">{activeModule.desc}</p>
               
               <ul className="space-y-3 pt-4">
                 {[1, 2, 3].map(i => (
                   <li key={i} className="flex items-center gap-3 text-slate-700">
                     <div className={`w-2 h-2 rounded-full ${activeModule.color}`}></div>
                     <span>Feature point {i} relevant to {activeModule.label}</span>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="w-full md:w-1/2">
               {/* Simplified Wireframe UI based on active tab */}
               <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 shadow-inner aspect-[4/3] flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
                    <div className={`h-8 w-24 rounded ${activeModule.color} opacity-20`}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                      <div className="h-2 w-8 bg-slate-100 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                      <div className="h-2 w-8 bg-slate-100 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm p-3 space-y-2">
                     <div className="h-2 w-full bg-slate-100 rounded"></div>
                     <div className="h-8 w-full bg-slate-50 rounded flex items-center px-2">
                       <div className="h-4 w-4 rounded-full bg-slate-200 mr-2"></div>
                       <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                     </div>
                     <div className="h-8 w-full bg-slate-50 rounded flex items-center px-2">
                       <div className="h-4 w-4 rounded-full bg-slate-200 mr-2"></div>
                       <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
