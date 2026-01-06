import { ShieldCheck, Lock, Server, FileCheck } from 'lucide-react';

export default function Trust() {
  const features = [
    {
      icon: Lock,
      title: "Role-Based Access Control",
      desc: "Granular permission settings ensure data privacy and operational security across all teams."
    },
    {
      icon: FileCheck,
      title: "Complete Audit Trails",
      desc: "Every action, update, and communication is logged for full compliance and accountability."
    },
    {
      icon: ShieldCheck,
      title: "Enterprise-Grade Security",
      desc: "SOC 2 Type II compliant infrastructure with end-to-end encryption for sensitive financial data."
    },
    {
      icon: Server,
      title: "Scalable Architecture",
      desc: "Cloud-native design built to handle millions of cases without compromising performance."
    }
  ];

  return (
    <section id="security" className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          <div className="md:w-1/2">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Enterprise Trust</h2>
             <p className="text-slate-400 text-lg">Security and compliance are not afterthoughts. They are the foundation of the Rinexor platform.</p>
          </div>
          <div className="md:w-1/2 flex justify-end gap-6">
             {/* Mock Trust Badges */}
             <div className="h-12 w-32 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">SOC 2</div>
             <div className="h-12 w-32 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">GDPR</div>
             <div className="h-12 w-32 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm">ISO 27001</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {features.map((feature, index) => (
             <div key={index} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
               <feature.icon className="text-brand-teal mb-4" size={24} />
               <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
               <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
