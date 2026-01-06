import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-brand-navy relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Transform Debt Recovery into a<br />
          <span className="text-brand-blue">Data-Driven, Automated Operation.</span>
        </h2>
        <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
          Join leading enterprises using Rinexor to optimize collections, reduce risk, and maximize recovery rates.
        </p>
        <button type="button" onClick={() => navigate('/dashboard')} className="bg-white text-brand-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg shadow-white/10 flex items-center gap-2 mx-auto">
          Get Started with Rinexor <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
