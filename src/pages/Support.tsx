import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const faqs = [
    {
        question: 'How do I get started with Rinexor?',
        answer: 'Getting started is easy. Request a demo through our contact page, and our team will walk you through the platform. After onboarding, you can start importing cases immediately via our Excel/CSV import or API integration.'
    },
    {
        question: 'What file formats are supported for case import?',
        answer: 'Rinexor supports Excel (.xlsx, .xls) and CSV file formats. Our intelligent column mapping automatically detects common field names and allows you to map custom columns to our data model.'
    },
    {
        question: 'How does the AI risk scoring work?',
        answer: 'Our AI model analyzes multiple factors including debt amount, customer history, days past due, communication patterns, and industry-specific signals to generate a recovery probability score from 0-100. Higher scores indicate higher likelihood of successful recovery.'
    },
    {
        question: 'Can I integrate Rinexor with my existing systems?',
        answer: 'Yes! Rinexor offers a comprehensive REST API for integration with CRM, loan management, and internal systems. We also support webhook notifications for real-time event updates.'
    },
    {
        question: 'What security measures are in place?',
        answer: 'Rinexor implements JWT-based authentication, role-based access control, TLS 1.3 encryption, and comprehensive audit logging. Our architecture is designed for ISO 27001 and SOC 2 compliance.'
    },
    {
        question: 'How do SLA tracking and alerts work?',
        answer: 'You can configure custom SLA rules for each DCA or case type. Rinexor continuously monitors all cases and automatically triggers alerts when SLAs are at risk of breach or have been breached, with configurable escalation workflows.'
    }
];

const supportTiers = [
    {
        name: 'Standard',
        description: 'Included with all plans',
        features: [
            'Email support',
            'Documentation access',
            '48-hour response time',
            'Community forums'
        ],
        highlight: false
    },
    {
        name: 'Priority',
        description: 'For growing enterprises',
        features: [
            'Priority email & chat support',
            '12-hour response time',
            'Dedicated success manager',
            'Quarterly business reviews'
        ],
        highlight: true
    },
    {
        name: 'Enterprise',
        description: 'For large organizations',
        features: [
            '24/7 phone & email support',
            '2-hour critical response',
            'Dedicated technical team',
            'Custom SLA agreements'
        ],
        highlight: false
    }
];

export default function Support() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <PageLayout
            title="Support Center"
            subtitle="Get the help you need to succeed with Rinexor."
        >
            <div className="container mx-auto px-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Link
                        to="/docs"
                        className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-brand-blue/30 transition-all group"
                    >
                        <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Documentation</h3>
                        <p className="text-sm text-slate-500 mb-3">Browse our comprehensive guides and API docs.</p>
                        <span className="text-brand-blue font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Docs <ArrowRight size={14} />
                        </span>
                    </Link>

                    <Link
                        to="/contact"
                        className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-brand-blue/30 transition-all group"
                    >
                        <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Contact Support</h3>
                        <p className="text-sm text-slate-500 mb-3">Submit a ticket and get help from our team.</p>
                        <span className="text-brand-blue font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            Open Ticket <ArrowRight size={14} />
                        </span>
                    </Link>

                    <div className="p-6 bg-white border border-slate-200 rounded-xl">
                        <div className="p-3 bg-brand-violet/10 text-brand-violet rounded-xl inline-block mb-4">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Enterprise Hotline</h3>
                        <p className="text-sm text-slate-500 mb-3">Priority support for enterprise customers.</p>
                        <span className="text-slate-700 font-medium text-sm">+91 80 4567 8901</span>
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Tiers */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Support Tiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {supportTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-xl ${tier.highlight
                                    ? 'bg-brand-navy text-white ring-4 ring-brand-blue/20'
                                    : 'bg-white border border-slate-200'
                                    }`}
                            >
                                <h3 className={`text-xl font-bold mb-1 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                                    {tier.name}
                                </h3>
                                <p className={`text-sm mb-6 ${tier.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {tier.description}
                                </p>
                                <ul className="space-y-3">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tier.highlight ? 'bg-brand-teal' : 'bg-brand-blue'}`}></div>
                                            <span className={`text-sm ${tier.highlight ? 'text-slate-200' : 'text-slate-600'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Escalation Matrix */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Escalation Matrix</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="pb-4 text-slate-500 font-medium">Priority</th>
                                    <th className="pb-4 text-slate-500 font-medium">Description</th>
                                    <th className="pb-4 text-slate-500 font-medium">Response Time</th>
                                    <th className="pb-4 text-slate-500 font-medium">Escalation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">P1 - Critical</span>
                                    </td>
                                    <td className="py-4 text-slate-600">Platform down or data loss</td>
                                    <td className="py-4 text-slate-900 font-medium">30 minutes</td>
                                    <td className="py-4 text-slate-600">Immediate → CTO</td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">P2 - High</span>
                                    </td>
                                    <td className="py-4 text-slate-600">Major feature unavailable</td>
                                    <td className="py-4 text-slate-900 font-medium">2 hours</td>
                                    <td className="py-4 text-slate-600">4 hrs → Engineering Lead</td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-medium">P3 - Medium</span>
                                    </td>
                                    <td className="py-4 text-slate-600">Workaround available</td>
                                    <td className="py-4 text-slate-900 font-medium">24 hours</td>
                                    <td className="py-4 text-slate-600">48 hrs → Support Manager</td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">P4 - Low</span>
                                    </td>
                                    <td className="py-4 text-slate-600">Minor issue or question</td>
                                    <td className="py-4 text-slate-900 font-medium">48 hours</td>
                                    <td className="py-4 text-slate-600">Weekly review</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        Still Need Help?
                    </h3>
                    <p className="text-slate-500 mb-6">
                        Our support team is ready to assist you with any questions or issues.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors"
                    >
                        Contact Support <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </PageLayout>
    );
}
