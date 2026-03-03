import { Key, Users, Lock, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const securityFeatures = [
    {
        icon: Key,
        title: 'JWT-Based Authentication',
        description: 'Industry-standard JSON Web Token authentication with secure token rotation, refresh mechanisms, and configurable expiration policies.',
        details: [
            'Secure token generation with RS256 signing',
            'Automatic token refresh and rotation',
            'Configurable session timeouts',
            'Secure token storage best practices'
        ]
    },
    {
        icon: Users,
        title: 'Role-Based Access Control (RBAC)',
        description: 'Granular permission system with hierarchical roles ensuring users only access data and actions relevant to their responsibilities.',
        details: [
            'Three-tier role hierarchy (Super Admin, Enterprise Admin, DCA Agent)',
            'Granular permission assignments',
            'Resource-level access control',
            'Dynamic permission evaluation'
        ]
    },
    {
        icon: Lock,
        title: 'Data Encryption',
        description: 'End-to-end encryption for data in transit and at rest, ensuring sensitive financial information remains protected at all times.',
        details: [
            'TLS 1.3 for all data in transit',
            'AES-256 encryption for data at rest',
            'Encrypted database connections',
            'Secure key management practices'
        ]
    },
    {
        icon: FileText,
        title: 'Audit Logs & Activity Tracking',
        description: 'Comprehensive logging of all user actions, system events, and data modifications for complete operational transparency.',
        details: [
            'Immutable audit trail for all operations',
            'User action tracking with timestamps',
            'Data modification history',
            'Exportable audit reports'
        ]
    },
    {
        icon: ShieldCheck,
        title: 'Compliance Readiness',
        description: 'Architecture designed with enterprise compliance requirements in mind, supporting ISO and SOC-style security frameworks.',
        details: [
            'ISO 27001 aligned security controls',
            'SOC 2 Type II ready architecture',
            'GDPR data handling capabilities',
            'Regular security assessments'
        ]
    }
];

const certifications = [
    { name: 'SOC 2', status: 'Architecture Ready' },
    { name: 'ISO 27001', status: 'In Progress' },
    { name: 'GDPR', status: 'Compliant' },
    { name: 'PCI DSS', status: 'Roadmap' }
];

export default function Security() {
    return (
        <PageLayout
            title="Security & Compliance"
            subtitle="Enterprise-grade security architecture designed to protect sensitive financial data and meet rigorous compliance requirements."
        >
            <div className="container mx-auto px-6">
                {/* Trust Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8 mb-16 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                        <ShieldCheck size={48} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Your Data Security is Our Priority
                        </h2>
                        <p className="text-slate-600">
                            Rinexor is built from the ground up with security-first principles, ensuring your sensitive debt recovery data is protected with industry-leading security measures.
                        </p>
                    </div>
                </div>

                {/* Security Features */}
                <div className="space-y-8 mb-16">
                    {securityFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    <div className="p-4 bg-brand-navy/5 rounded-xl text-brand-navy">
                                        <feature.icon size={32} />
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                        {feature.description}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {feature.details.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="flex items-center gap-2 text-sm text-slate-500">
                                                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Certifications */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        Compliance & Certifications
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {certifications.map((cert, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                                <div className="text-lg font-bold text-slate-900 mb-2">{cert.name}</div>
                                <div className="text-sm text-slate-500">{cert.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-brand-navy rounded-2xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Request a Security Audit
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        For enterprise customers, we provide detailed security documentation, penetration test reports, and compliance attestations upon request.
                    </p>
                    <button className="bg-white text-brand-navy px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                        Contact Security Team
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}
