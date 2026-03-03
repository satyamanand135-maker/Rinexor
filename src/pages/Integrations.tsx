import { FileSpreadsheet, Database, CreditCard, MessageSquare, Code2, Puzzle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const integrations = [
    {
        icon: FileSpreadsheet,
        title: 'Excel / CSV Data Ingestion',
        description: 'Seamlessly import debt case portfolios from Excel and CSV files with intelligent column mapping and validation.',
        status: 'Available',
        statusColor: 'bg-emerald-100 text-emerald-700'
    },
    {
        icon: Database,
        title: 'CRM & Loan Management Systems',
        description: 'Connect with leading CRM and loan management platforms for real-time case synchronization and customer data enrichment.',
        status: 'Coming Soon',
        statusColor: 'bg-amber-100 text-amber-700'
    },
    {
        icon: CreditCard,
        title: 'Payment Gateway Integration',
        description: 'Integrate with payment processors for automated reconciliation and real-time recovery proof validation.',
        status: 'Coming Soon',
        statusColor: 'bg-amber-100 text-amber-700'
    },
    {
        icon: MessageSquare,
        title: 'Email / SMS / WhatsApp Notifications',
        description: 'Multi-channel communication support for automated debtor notifications, reminders, and status updates.',
        status: 'In Development',
        statusColor: 'bg-brand-blue/10 text-brand-blue'
    },
    {
        icon: Code2,
        title: 'REST API Access',
        description: 'Full programmatic access to all platform capabilities via our comprehensive REST API for custom integrations.',
        status: 'Available',
        statusColor: 'bg-emerald-100 text-emerald-700'
    },
    {
        icon: Puzzle,
        title: 'Webhook Events',
        description: 'Real-time event notifications for case updates, SLA breaches, and recovery milestones to trigger external workflows.',
        status: 'Coming Soon',
        statusColor: 'bg-amber-100 text-amber-700'
    }
];

export default function Integrations() {
    return (
        <PageLayout
            title="Integrations"
            subtitle="Connect Rinexor with your existing enterprise ecosystem for seamless debt recovery orchestration."
        >
            <div className="container mx-auto px-6">
                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {integrations.map((integration, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
                                    <integration.icon size={24} />
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${integration.statusColor}`}>
                                    {integration.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {integration.title}
                            </h3>

                            <p className="text-slate-500 text-sm leading-relaxed">
                                {integration.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Enterprise Interoperability Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 mb-16">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Puzzle size={16} />
                            Enterprise Ready
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Built for Enterprise Interoperability
                        </h2>

                        <p className="text-slate-600 leading-relaxed mb-6">
                            Rinexor is designed with an API-first architecture, enabling seamless integration with your existing enterprise systems. Whether you're connecting legacy platforms, modern SaaS tools, or custom internal systems, our flexible integration layer adapts to your infrastructure.
                        </p>

                        <ul className="space-y-3 mb-8">
                            {[
                                'RESTful API with comprehensive documentation',
                                'OAuth 2.0 and API key authentication options',
                                'Rate limiting and usage analytics',
                                'Sandbox environment for testing',
                                'Dedicated integration support for enterprise customers'
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/api-reference"
                            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:gap-3 transition-all"
                        >
                            Explore API Reference <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        Need a Custom Integration?
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Our enterprise team can help you build custom integrations tailored to your specific requirements.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors"
                    >
                        Contact Sales <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </PageLayout>
    );
}
