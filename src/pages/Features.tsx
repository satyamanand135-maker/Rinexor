import { Brain, Shuffle, LayoutDashboard, Clock, BarChart3, Shield } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const features = [
    {
        icon: Brain,
        title: 'AI-Driven Risk Scoring & Classification',
        description: 'Leverage machine learning algorithms to automatically score and classify debt cases based on recovery probability, customer behavior patterns, and historical data.',
        whyItMatters: 'Prioritize high-value cases with the greatest recovery potential, reducing manual analysis time by up to 70%.',
        color: 'text-brand-blue',
        bg: 'bg-brand-blue/10'
    },
    {
        icon: Shuffle,
        title: 'Intelligent Case Allocation Engine',
        description: 'Automatically distribute cases to the most suitable Debt Collection Agencies based on expertise, capacity, performance history, and case characteristics.',
        whyItMatters: 'Optimize DCA utilization and improve recovery rates by matching cases with agencies that have proven success in similar profiles.',
        color: 'text-brand-violet',
        bg: 'bg-brand-violet/10'
    },
    {
        icon: LayoutDashboard,
        title: 'Role-Based Dashboards',
        description: 'Purpose-built interfaces for Super Admins, Enterprise Admins, and DCA Agents with relevant KPIs, actions, and insights tailored to each role.',
        whyItMatters: 'Every stakeholder sees exactly what they need—no information overload, just actionable intelligence.',
        color: 'text-brand-teal',
        bg: 'bg-brand-teal/10'
    },
    {
        icon: Clock,
        title: 'SLA Tracking & Escalation System',
        description: 'Real-time monitoring of Service Level Agreements with automated alerts, breach detection, and escalation workflows.',
        whyItMatters: 'Never miss a deadline. Automated escalations ensure accountability and faster resolution times.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        icon: BarChart3,
        title: 'Performance Analytics & Reporting',
        description: 'Comprehensive dashboards with recovery metrics, agency performance comparisons, trend analysis, and exportable reports.',
        whyItMatters: 'Data-driven decisions backed by real-time insights. Identify bottlenecks and optimize recovery strategies.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        icon: Shield,
        title: 'Secure Authentication & Access Control',
        description: 'Enterprise-grade security with JWT authentication, role-based access control, and comprehensive audit logging.',
        whyItMatters: 'Protect sensitive financial data with bank-level security while maintaining full compliance traceability.',
        color: 'text-red-500',
        bg: 'bg-red-500/10'
    }
];

export default function Features() {
    return (
        <PageLayout
            title="Platform Features"
            subtitle="Discover the intelligent capabilities that power modern debt recovery operations."
        >
            <div className="container mx-auto px-6">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                        >
                            <div className={`inline-flex p-3 rounded-xl ${feature.bg} ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                {feature.title}
                            </h3>

                            <p className="text-slate-500 leading-relaxed mb-4">
                                {feature.description}
                            </p>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm font-medium text-brand-blue">
                                    Why it matters:
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {feature.whyItMatters}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-2xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Transform Your Recovery Operations?
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        See how Rinexor's intelligent features can increase your recovery rates while reducing operational overhead.
                    </p>
                    <button className="bg-white text-brand-navy px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                        Request a Demo
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}
