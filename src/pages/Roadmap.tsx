import { CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const phases = [
    {
        phase: 'Phase 1',
        title: 'Core AI Allocation & Dashboards',
        status: 'completed',
        timeline: 'Q4 2025',
        features: [
            'AI-driven risk scoring engine',
            'Intelligent case allocation algorithm',
            'Role-based dashboards (Super Admin, Enterprise Admin, DCA Agent)',
            'Basic SLA tracking and monitoring',
            'Case management workflows',
            'JWT authentication & RBAC'
        ]
    },
    {
        phase: 'Phase 2',
        title: 'Advanced ML Models & Recovery Forecasting',
        status: 'in-progress',
        timeline: 'Q1-Q2 2026',
        features: [
            'Enhanced ML models with behavioral analysis',
            'Recovery probability forecasting',
            'Dynamic risk reassessment',
            'A/B testing for allocation strategies',
            'Advanced performance analytics',
            'Custom reporting builder'
        ]
    },
    {
        phase: 'Phase 3',
        title: 'RPA & Legacy System Automation',
        status: 'planned',
        timeline: 'Q3-Q4 2026',
        features: [
            'Robotic Process Automation (RPA) integration',
            'Legacy system connectors',
            'Automated data extraction pipelines',
            'Workflow automation templates',
            'Multi-channel communication automation',
            'Payment gateway integrations'
        ]
    },
    {
        phase: 'Phase 4',
        title: 'Predictive Analytics & Compliance Automation',
        status: 'planned',
        timeline: '2027+',
        features: [
            'Predictive recovery intelligence',
            'Market trend analysis',
            'Automated compliance monitoring',
            'Regulatory reporting automation',
            'Cross-enterprise benchmarking',
            'AI-powered negotiation recommendations'
        ]
    }
];

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'completed':
            return {
                icon: CheckCircle2,
                label: 'Completed',
                bgColor: 'bg-emerald-100',
                textColor: 'text-emerald-700',
                borderColor: 'border-emerald-200',
                iconColor: 'text-emerald-600'
            };
        case 'in-progress':
            return {
                icon: Clock,
                label: 'In Progress',
                bgColor: 'bg-brand-blue/10',
                textColor: 'text-brand-blue',
                borderColor: 'border-brand-blue/30',
                iconColor: 'text-brand-blue'
            };
        default:
            return {
                icon: Circle,
                label: 'Planned',
                bgColor: 'bg-slate-100',
                textColor: 'text-slate-600',
                borderColor: 'border-slate-200',
                iconColor: 'text-slate-400'
            };
    }
};

export default function Roadmap() {
    return (
        <PageLayout
            title="Product Roadmap"
            subtitle="Our vision for the future of intelligent debt recovery orchestration."
        >
            <div className="container mx-auto px-6">
                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-brand-blue to-slate-200 hidden md:block"></div>

                    <div className="space-y-8">
                        {phases.map((phase, index) => {
                            const statusConfig = getStatusConfig(phase.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={index} className="relative flex gap-8">
                                    {/* Timeline dot */}
                                    <div className="hidden md:flex flex-shrink-0 w-16 items-start justify-center pt-8">
                                        <div className={`p-2 rounded-full ${statusConfig.bgColor} ${statusConfig.iconColor}`}>
                                            <StatusIcon size={20} />
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div className={`flex-grow p-8 bg-white border ${statusConfig.borderColor} rounded-2xl hover:shadow-lg transition-shadow`}>
                                        <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <span className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                                                {phase.phase}
                                            </span>
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                                {statusConfig.label}
                                            </span>
                                            <span className="text-sm text-slate-400">
                                                {phase.timeline}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                                            {phase.title}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {phase.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center gap-3 text-slate-600">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${phase.status === 'completed' ? 'bg-emerald-500' : phase.status === 'in-progress' ? 'bg-brand-blue' : 'bg-slate-300'}`}></div>
                                                    <span className="text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-16 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-4">
                        <Sparkles size={24} className="text-brand-violet flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Vision-Driven & Scalable</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                This roadmap represents our current vision and is subject to change based on customer feedback, market conditions, and technological advancements. We are committed to continuous innovation and will adapt our priorities to deliver maximum value to our customers. Features and timelines may be adjusted to ensure the highest quality and relevance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        Have a Feature Request?
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-xl mx-auto">
                        We're building Rinexor for you. Share your ideas and help shape the future of intelligent debt recovery.
                    </p>
                    <button className="bg-brand-navy text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors">
                        Submit Feature Request
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}
