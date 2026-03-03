import { ArrowRight, Building2, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const caseStudies = [
    {
        title: 'Axis Financial Services',
        subtitle: 'Multi-DCA Enterprise Transformation',
        industry: 'NBFC',
        challenge: 'Managing 15+ DCAs with Excel spreadsheets, leading to poor visibility and inconsistent SLA compliance.',
        solution: 'Implemented Rinexor to centralize all DCA operations, automate case allocation, and enable real-time performance tracking.',
        results: [
            { metric: '34%', label: 'Increase in Recovery Rate' },
            { metric: '60%', label: 'Reduction in Manual Work' },
            { metric: '95%', label: 'SLA Compliance' }
        ],
        testimonial: {
            quote: 'Rinexor transformed how we manage our debt portfolio. We now have complete visibility across all our collection partners.',
            author: 'Vikram Mehta',
            role: 'Head of Collections, Axis Financial'
        },
        gradient: 'from-brand-blue to-brand-violet'
    },
    {
        title: 'GlobalBank India',
        subtitle: 'AI-Powered Prioritization at Scale',
        industry: 'Banking',
        challenge: 'Over 50,000 NPAs with no systematic way to prioritize which cases to focus on first.',
        solution: 'Deployed Rinexor\'s AI risk scoring to automatically classify and prioritize cases based on recovery probability.',
        results: [
            { metric: '28%', label: 'Higher Recovery on Priority Cases' },
            { metric: '3x', label: 'Faster Case Triage' },
            { metric: '₹450Cr', label: 'Additional Recovery in Year 1' }
        ],
        testimonial: {
            quote: 'The AI scoring changed everything. We finally know where to focus our limited resources for maximum impact.',
            author: 'Priya Sharma',
            role: 'GM - Recovery Operations, GlobalBank'
        },
        gradient: 'from-brand-teal to-emerald-500'
    },
    {
        title: 'QuickLend',
        subtitle: 'SLA Excellence Through Automation',
        industry: 'Digital Lending',
        challenge: 'Frequent SLA breaches with DCAs going unnoticed for weeks, damaging customer relationships.',
        solution: 'Leveraged Rinexor\'s real-time SLA monitoring with automated escalations and breach prevention alerts.',
        results: [
            { metric: '99.2%', label: 'SLA Compliance (up from 67%)' },
            { metric: '85%', label: 'Faster Breach Detection' },
            { metric: '40%', label: 'Reduction in Customer Complaints' }
        ],
        testimonial: {
            quote: 'We went from firefighting SLA breaches to preventing them entirely. The platform pays for itself.',
            author: 'Rahul Jain',
            role: 'COO, QuickLend'
        },
        gradient: 'from-amber-400 to-orange-500'
    }
];

export default function CaseStudies() {
    return (
        <PageLayout
            title="Case Studies"
            subtitle="See how leading enterprises are transforming their debt recovery operations with Rinexor."
        >
            <div className="container mx-auto px-6">
                {/* Stats Banner */}
                <div className="bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-2xl p-8 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <Building2 size={32} className="mx-auto mb-3 text-brand-teal" />
                            <div className="text-3xl font-bold">50+</div>
                            <div className="text-slate-300">Enterprises Served</div>
                        </div>
                        <div>
                            <Users size={32} className="mx-auto mb-3 text-brand-teal" />
                            <div className="text-3xl font-bold">200+</div>
                            <div className="text-slate-300">DCAs Connected</div>
                        </div>
                        <div>
                            <BarChart3 size={32} className="mx-auto mb-3 text-brand-teal" />
                            <div className="text-3xl font-bold">₹2,500Cr+</div>
                            <div className="text-slate-300">Debt Recovered</div>
                        </div>
                    </div>
                </div>

                {/* Case Studies */}
                <div className="space-y-16">
                    {caseStudies.map((study, index) => (
                        <div
                            key={index}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Header */}
                            <div className={`bg-gradient-to-r ${study.gradient} p-8 text-white`}>
                                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                                    {study.industry}
                                </div>
                                <h2 className="text-3xl font-bold mb-2">{study.title}</h2>
                                <p className="text-white/80 text-lg">{study.subtitle}</p>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Challenge & Solution */}
                                    <div>
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-red-500 uppercase mb-2">The Challenge</h3>
                                            <p className="text-slate-600">{study.challenge}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase mb-2">The Solution</h3>
                                            <p className="text-slate-600">{study.solution}</p>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-sm font-bold text-brand-blue uppercase mb-4">Results</h3>
                                        <div className="space-y-4">
                                            {study.results.map((result, resultIndex) => (
                                                <div key={resultIndex} className="flex items-center gap-4">
                                                    <div className="text-2xl font-bold text-slate-900 w-24">{result.metric}</div>
                                                    <div className="text-slate-600">{result.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial */}
                                <div className="border-t border-slate-100 pt-6">
                                    <blockquote className="text-lg text-slate-700 italic mb-4">
                                        "{study.testimonial.quote}"
                                    </blockquote>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                        <div>
                                            <div className="font-bold text-slate-900">{study.testimonial.author}</div>
                                            <div className="text-sm text-slate-500">{study.testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center bg-slate-50 rounded-2xl p-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Ready to Write Your Success Story?
                    </h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                        Join leading enterprises who have transformed their debt recovery operations with Rinexor.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors"
                    >
                        Request a Demo <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </PageLayout>
    );
}
