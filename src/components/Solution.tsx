import { BrainCircuit, GitMerge, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Solution() {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Prioritization",
      desc: "Predict recovery probability and urgency to focus on high-value cases first."
    },
    {
      icon: GitMerge,
      title: "Smart DCA Allocation",
      desc: "Automatically assign cases to agencies based on performance history and capacity."
    },
    {
      icon: Zap,
      title: "Automated Workflows",
      desc: "Trigger SLAs, escalations, and follow-ups without manual intervention."
    },
    {
      icon: LayoutDashboard,
      title: "Real-Time Governance",
      desc: "Complete transparency into every case, action, and outcome across all agencies."
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-violet/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              One Intelligent Platform.<br />
              <span className="text-brand-blue">Total Control.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Replace fragmented spreadsheets and siloed agencies with a single source of truth. Rinexor orchestrates the entire recovery lifecycle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((item, index) => (
                <div key={index} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <item.icon className="text-brand-blue mb-4" size={28} />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-navy px-4 py-1 rounded-full border border-slate-700 text-xs font-medium text-brand-blue uppercase tracking-wider">
                    Recovery Workflow
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                            <span className="text-2xl">🏢</span>
                        </div>
                        <div className="flex-1 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                            <div className="font-semibold text-white">Enterprise Data</div>
                            <div className="text-xs text-slate-400">Ingest overdue invoices & customer profiles</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="rotate-90 text-brand-blue" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-brand-blue/20 flex items-center justify-center shrink-0 text-brand-blue">
                            <BrainCircuit size={24} />
                        </div>
                        <div className="flex-1 bg-brand-blue/10 p-4 rounded-lg border border-brand-blue/30 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                            <div className="font-semibold text-brand-blue">AI Intelligence</div>
                            <div className="text-xs text-brand-blue/70">Score risk, predict outcome, assign strategy</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="rotate-90 text-brand-blue" />
                    </div>

                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-brand-violet/20 flex items-center justify-center shrink-0 text-brand-violet">
                            <GitMerge size={24} />
                        </div>
                        <div className="flex-1 bg-brand-violet/10 p-4 rounded-lg border border-brand-violet/30">
                            <div className="font-semibold text-brand-violet">Automated Actions</div>
                            <div className="text-xs text-brand-violet/70">Assign to Best DCA, Send Digital Notices</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="rotate-90 text-green-500" />
                    </div>

                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0 text-green-500">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div className="flex-1 bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                            <div className="font-semibold text-green-400">Recovery Outcomes</div>
                            <div className="text-xs text-green-500/70">Funds recovered, cases resolved, data updated</div>
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
