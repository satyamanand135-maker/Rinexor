import { FileSpreadsheet, EyeOff, ShieldAlert, Clock } from 'lucide-react';

export default function Problem() {
  const problems = [
    {
      icon: FileSpreadsheet,
      title: "Manual Workflows",
      desc: "Reliance on scattered Excel sheets and email chains creates bottlenecks and data silos."
    },
    {
      icon: EyeOff,
      title: "Zero Visibility",
      desc: "No real-time tracking of case status or DCA performance leads to blind decision making."
    },
    {
      icon: ShieldAlert,
      title: "Weak Governance",
      desc: "Lack of audit trails and compliance monitoring increases legal and reputational risk."
    },
    {
      icon: Clock,
      title: "Delayed Recovery",
      desc: "Inefficient allocation and follow-ups result in aging debt and lower recovery rates."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Problem with Traditional Debt Recovery</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Enterprise debt collection is broken. Fragmented systems and manual processes are costing you millions in unrecovered revenue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((item, index) => (
            <div key={index} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-soft transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
