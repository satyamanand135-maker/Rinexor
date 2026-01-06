import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Rinexor</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The intelligent debt collection orchestration platform for modern enterprises. Automate, optimize, and recover with confidence.
            </p>
            <div className="flex gap-4">
              <a href="/" aria-label="Twitter" className="text-slate-400 hover:text-brand-blue transition-colors"><Twitter size={20} /></a>
              <a href="/" aria-label="LinkedIn" className="text-slate-400 hover:text-brand-blue transition-colors"><Linkedin size={20} /></a>
              <a href="/" aria-label="GitHub" className="text-slate-400 hover:text-brand-blue transition-colors"><Github size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Features</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Integrations</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Security</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">About</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Careers</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Blog</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">API Reference</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Case Studies</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue text-sm">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Rinexor. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-brand-navy text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-brand-navy text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
