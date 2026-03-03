import { Target, Lightbulb, Zap, Heart } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const values = [
    {
        icon: Target,
        title: 'Mission-Driven',
        description: 'We exist to solve real problems in debt recovery, transforming an industry that impacts millions of businesses and individuals.'
    },
    {
        icon: Lightbulb,
        title: 'Innovation First',
        description: 'We believe AI and intelligent automation can bring fairness, efficiency, and transparency to financial recovery.'
    },
    {
        icon: Zap,
        title: 'Execution Excellence',
        description: 'We move fast without breaking things. Quality and speed are not mutually exclusive.'
    },
    {
        icon: Heart,
        title: 'Human-Centered',
        description: 'Technology should serve people. We build tools that empower humans to do their best work.'
    }
];

export default function About() {
    return (
        <PageLayout
            title="About Rinexor"
            subtitle="The intelligent platform redefining how enterprises manage debt recovery."
        >
            <div className="container mx-auto px-6">
                {/* Why We Built Rinexor */}
                <div className="mb-20">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            Why Rinexor Exists
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                The debt recovery industry has been stuck in the past. Enterprises manage millions in outstanding receivables using fragmented Excel sheets, endless email chains, and disconnected agency relationships. This chaos leads to delayed recoveries, compliance risks, and zero visibility into performance.
                            </p>
                            <p>
                                We built Rinexor to change that. By combining AI-driven intelligence with enterprise-grade orchestration, we're creating a world where debt recovery is transparent, efficient, and data-driven.
                            </p>
                        </div>
                    </div>
                </div>

                {/* The Problem */}
                <div className="bg-slate-50 rounded-2xl p-8 md:p-12 mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        The Problem with Traditional Debt Recovery
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                stat: '60%',
                                label: 'of enterprises still use Excel for case tracking'
                            },
                            {
                                stat: '45%',
                                label: 'of recoverable debt goes uncollected due to poor prioritization'
                            },
                            {
                                stat: '3-6 months',
                                label: 'average delay in identifying SLA breaches'
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-brand-blue mb-2">{item.stat}</div>
                                <div className="text-slate-600">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vision */}
                <div className="mb-20">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            Our Vision: Intelligent Orchestration
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                We envision a future where enterprises have complete visibility and control over their debt recovery operations. Where AI automatically prioritizes the right cases, allocates them to the best-suited agencies, and continuously optimizes for maximum recovery.
                            </p>
                            <p>
                                Rinexor is not just software—it's an intelligent layer that sits between enterprises and their collection partners, bringing order, efficiency, and intelligence to every interaction.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How AI Transforms Recovery */}
                <div className="bg-gradient-to-br from-brand-navy to-brand-charcoal rounded-2xl p-8 md:p-12 mb-20 text-white">
                    <h2 className="text-3xl font-bold mb-6">
                        How AI Transforms Recovery Operations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            'Predictive scoring identifies high-probability cases instantly',
                            'Automated allocation matches cases with optimal agencies',
                            'Real-time SLA monitoring prevents breaches before they happen',
                            'Performance analytics drive continuous improvement',
                            'Audit trails ensure complete compliance transparency',
                            'Unified dashboards eliminate information silos'
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-teal flex-shrink-0"></div>
                                <span className="text-slate-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Values */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="p-6 bg-white border border-slate-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                                <div className="inline-flex p-3 bg-brand-blue/10 text-brand-blue rounded-xl mb-4">
                                    <value.icon size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-sm text-slate-500">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="text-center bg-slate-50 rounded-2xl p-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Our Mission
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        To empower enterprises with intelligent tools that transform debt recovery from a reactive, fragmented process into a proactive, orchestrated operation—maximizing recoveries while minimizing friction.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}
