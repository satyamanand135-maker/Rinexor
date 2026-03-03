import { Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Rinexor</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The intelligent debt collection orchestration platform for modern enterprises. Automate, optimize, and recover with confidence.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-brand-blue transition-colors"><Twitter size={20} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-brand-blue transition-colors"><Linkedin size={20} /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-slate-400 hover:text-brand-blue transition-colors"><Github size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Features</Link></li>
              <li><Link to="/integrations" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Integrations</Link></li>
              <li><Link to="/security" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Security</Link></li>
              <li><Link to="/roadmap" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">About</Link></li>
              <li><Link to="/careers" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/docs" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Documentation</Link></li>
              <li><Link to="/api-reference" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">API Reference</Link></li>
              <li><Link to="/case-studies" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Case Studies</Link></li>
              <li><Link to="/support" className="text-slate-500 hover:text-brand-blue text-sm transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Rinexor. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-slate-400 hover:text-brand-navy text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-brand-navy text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
