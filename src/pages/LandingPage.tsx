import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import PlatformModules from '../components/PlatformModules';
import RoleValue from '../components/RoleValue';
import Trust from '../components/Trust';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-blue selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <PlatformModules />
        <RoleValue />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
