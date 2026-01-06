import { Building2, Briefcase, TrendingUp, Check } from 'lucide-react';

export default function RoleValue() {
  const roles = [
    {
      icon: Building2,
      title: "For Enterprises",
      benefits: [
        "Accelerate cash recovery cycles",
        "Ensure compliance & governance",
        "Reduce operational overhead",
        "Data-driven agency selection"
      ]
    },
    {
      icon: Briefcase,
      title: "For DCAs",
      benefits: [
        "Receive pre-qualified case files",
        "Clear priority & instruction sets",
        "Automated reporting & updates",
        "Transparent performance scoring"
      ]
    },
    {
      icon: TrendingUp,
      title: "For Leadership",
      benefits: [
        "Accurate cash flow forecasting",
        "Real-time risk visibility",
        "Audit-ready trail for all actions",
        "Strategic vendor insights"
      ]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Value for Every Stakeholder</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div key={index} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-blue/30 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-brand-navy mb-6 shadow-sm border border-slate-100">
                <role.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">{role.title}</h3>
              <ul className="space-y-4">
                {role.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check size={18} className="text-brand-teal mt-0.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
