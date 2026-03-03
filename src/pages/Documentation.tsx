import { Book, Key, RotateCcw, Code2, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const sections = [
    {
        icon: Book,
        title: 'Platform Overview',
        description: 'Understand Rinexor\'s architecture, core concepts, and how all the pieces fit together.',
        topics: ['System Architecture', 'Core Concepts', 'Data Model', 'Workflow Overview']
    },
    {
        icon: Key,
        title: 'Authentication & Roles',
        description: 'Learn how to authenticate with the platform and understand the role hierarchy.',
        topics: ['JWT Authentication', 'Token Management', 'Role Hierarchy', 'Permission Matrix']
    },
    {
        icon: RotateCcw,
        title: 'Case Lifecycle',
        description: 'Master the complete lifecycle of a debt case from import to resolution.',
        topics: ['Case Creation', 'Status Transitions', 'Allocation Rules', 'Resolution Workflows']
    },
    {
        icon: Code2,
        title: 'API Usage',
        description: 'Integrate Rinexor into your existing systems using our comprehensive REST API.',
        topics: ['API Overview', 'Authentication', 'Rate Limits', 'Error Handling']
    },
    {
        icon: Rocket,
        title: 'Deployment & Onboarding',
        description: 'Get your Rinexor instance up and running with our deployment guides.',
        topics: ['Quick Start', 'Configuration', 'Data Migration', 'Best Practices']
    }
];

const quickLinks = [
    { name: 'Quick Start Guide', href: '#quick-start' },
    { name: 'API Authentication', href: '/api-reference' },
    { name: 'Case Management', href: '#case-lifecycle' },
    { name: 'User Roles', href: '#roles' },
    { name: 'Webhooks', href: '#webhooks' },
    { name: 'FAQs', href: '/support' }
];

export default function Documentation() {
    return (
        <PageLayout
            title="Documentation"
            subtitle="Everything you need to integrate and operate Rinexor effectively."
        >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 rounded-xl p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
                            <nav className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        to={link.href}
                                        className="block text-sm text-slate-600 hover:text-brand-blue transition-colors py-1"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <Link
                                    to="/api-reference"
                                    className="flex items-center justify-between text-brand-blue font-medium text-sm hover:gap-2 transition-all"
                                >
                                    API Reference <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Getting Started */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started</h2>
                            <div className="bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-xl p-8 text-white">
                                <h3 className="text-xl font-bold mb-3">Welcome to Rinexor</h3>
                                <p className="text-slate-300 mb-6 leading-relaxed">
                                    Rinexor is an AI-powered debt recovery orchestration platform that helps enterprises
                                    centralize their collection operations, automate case allocation, and maximize recovery
                                    rates through intelligent prioritization.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-white text-brand-navy px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors">
                                        Quick Start →
                                    </button>
                                    <button className="bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors">
                                        Watch Demo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Documentation Sections */}
                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-brand-blue/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-lg group-hover:scale-110 transition-transform">
                                            <section.icon size={24} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors">
                                                {section.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm mb-4">
                                                {section.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {section.topics.map((topic, topicIndex) => (
                                                    <span
                                                        key={topicIndex}
                                                        className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-brand-blue/10 hover:text-brand-blue transition-colors cursor-pointer"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Code Example */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Example</h2>
                            <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
                                <div className="text-xs text-slate-400 mb-3">Authentication Example</div>
                                <pre className="text-sm text-slate-300 font-mono">
                                    {`// Authenticate and get access token
const response = await fetch('https://api.rinexor.io/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@enterprise.com',
    password: 'secure_password'
  })
});

const { access_token } = await response.json();

// Use token for subsequent requests
const cases = await fetch('https://api.rinexor.io/cases', {
  headers: { 'Authorization': \`Bearer \${access_token}\` }
});`}
                                </pre>
                            </div>
                        </div>

                        {/* Help CTA */}
                        <div className="mt-12 text-center bg-slate-50 rounded-xl p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Need Help?</h3>
                            <p className="text-slate-600 mb-6">
                                Our documentation is continuously updated. If you can't find what you're looking for, reach out to our support team.
                            </p>
                            <Link
                                to="/support"
                                className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors"
                            >
                                Contact Support <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
