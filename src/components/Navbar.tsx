import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    navigate('/auth/roles');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Rinexor</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#product" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Product</a>
          <a href="#platform" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Platform</a>
          <a href="#solutions" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Solutions</a>
          <a href="#security" className="text-slate-600 hover:text-brand-blue font-medium transition-colors">Security</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button type="button" onClick={handleLogin} className="bg-brand-navy text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">Log in</button>
        </div>

        <button type="button" aria-label="Toggle mobile menu" className="md:hidden text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 md:hidden p-6 flex flex-col gap-4 shadow-lg">
          <a href="#product" className="text-slate-600 font-medium py-2">Product</a>
          <a href="#platform" className="text-slate-600 font-medium py-2">Platform</a>
          <a href="#solutions" className="text-slate-600 font-medium py-2">Solutions</a>
          <a href="#security" className="text-slate-600 font-medium py-2">Security</a>
          <hr className="border-slate-100" />
          <button type="button" onClick={handleLogin} className="text-slate-900 font-medium py-2 text-left">Log in</button>
        </div>
      )}
    </nav>
  );
}
