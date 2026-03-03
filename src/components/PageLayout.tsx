import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    showBackButton?: boolean;
}

export default function PageLayout({ title, subtitle, children, showBackButton = true }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-blue selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-6">
                    {showBackButton && (
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors mb-8 group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <main className="pb-20">
                {children}
            </main>

            <Footer />
        </div>
    );
}
