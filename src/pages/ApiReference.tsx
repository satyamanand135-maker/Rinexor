import { useState } from 'react';
import { Key, FileText, BarChart3, ChevronRight, Copy, Check } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const endpoints = {
    auth: [
        {
            method: 'POST',
            path: '/auth/login',
            description: 'Authenticate user and receive access token',
            request: `{
  "email": "user@enterprise.com",
  "password": "secure_password"
}`,
            response: `{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_123",
    "email": "user@enterprise.com",
    "role": "enterprise_admin"
  }
}`
        },
        {
            method: 'POST',
            path: '/auth/refresh',
            description: 'Refresh an expired access token',
            request: `{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}`,
            response: `{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}`
        }
    ],
    cases: [
        {
            method: 'GET',
            path: '/cases',
            description: 'List all cases with pagination and filtering',
            request: `Query Parameters:
  page: 1
  limit: 20
  status: active
  priority: high`,
            response: `{
  "data": [
    {
      "id": "case_8921",
      "customer_name": "Acme Corp",
      "amount": 45200.00,
      "status": "in_progress",
      "ai_priority_score": 92,
      "assigned_dca": "dca_456",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1284
  }
}`
        },
        {
            method: 'POST',
            path: '/cases',
            description: 'Create a new debt case',
            request: `{
  "customer_name": "TechFlow Inc",
  "customer_email": "accounts@techflow.com",
  "amount": 12850.00,
  "due_date": "2026-02-15",
  "metadata": {
    "loan_id": "LN-2024-0892",
    "product": "Business Loan"
  }
}`,
            response: `{
  "id": "case_8924",
  "customer_name": "TechFlow Inc",
  "amount": 12850.00,
  "status": "pending",
  "ai_priority_score": 74,
  "created_at": "2026-01-18T09:00:00Z"
}`
        },
        {
            method: 'PUT',
            path: '/cases/{id}/allocate',
            description: 'Allocate case to a DCA',
            request: `{
  "dca_id": "dca_789",
  "notes": "High priority - immediate action required"
}`,
            response: `{
  "id": "case_8921",
  "status": "allocated",
  "assigned_dca": "dca_789",
  "allocated_at": "2026-01-18T09:15:00Z"
}`
        }
    ],
    reporting: [
        {
            method: 'GET',
            path: '/reports/recovery',
            description: 'Get recovery performance metrics',
            request: `Query Parameters:
  start_date: 2026-01-01
  end_date: 2026-01-31
  group_by: dca`,
            response: `{
  "total_recovered": 2450230.00,
  "recovery_rate": 0.67,
  "by_dca": [
    {
      "dca_id": "dca_456",
      "dca_name": "Recovery Partners Ltd",
      "recovered": 1250000.00,
      "cases_closed": 234
    }
  ]
}`
        },
        {
            method: 'GET',
            path: '/reports/sla',
            description: 'Get SLA compliance report',
            request: `Query Parameters:
  start_date: 2026-01-01
  end_date: 2026-01-31`,
            response: `{
  "total_cases": 1284,
  "sla_compliant": 1156,
  "sla_breached": 128,
  "compliance_rate": 0.90,
  "breaches_by_type": {
    "response_time": 45,
    "resolution_time": 83
  }
}`
        }
    ]
};

const methodColors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-brand-blue/10 text-brand-blue',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700'
};

export default function ApiReference() {
    const [activeSection, setActiveSection] = useState('auth');
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const sections = [
        { id: 'auth', name: 'Authentication', icon: Key, endpoints: endpoints.auth },
        { id: 'cases', name: 'Case Management', icon: FileText, endpoints: endpoints.cases },
        { id: 'reporting', name: 'Reporting', icon: BarChart3, endpoints: endpoints.reporting }
    ];

    return (
        <PageLayout
            title="API Reference"
            subtitle="Complete REST API documentation for integrating with Rinexor."
        >
            <div className="container mx-auto px-6">
                {/* Base URL */}
                <div className="bg-slate-900 rounded-xl p-6 mb-12">
                    <div className="text-xs text-slate-400 mb-2">Base URL</div>
                    <code className="text-brand-teal font-mono">https://api.rinexor.io/v1</code>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 rounded-xl p-4 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4 px-2">Endpoints</h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                                                ? 'bg-white text-brand-blue shadow-sm'
                                                : 'text-slate-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <section.icon size={18} />
                                        {section.name}
                                        <ChevronRight size={16} className="ml-auto" />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="lg:col-span-3 space-y-8">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                id={section.id}
                                className={activeSection === section.id ? '' : 'hidden lg:block'}
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <section.icon size={24} className="text-brand-blue" />
                                    {section.name}
                                </h2>

                                <div className="space-y-6">
                                    {section.endpoints.map((endpoint, index) => (
                                        <div
                                            key={index}
                                            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                                        >
                                            {/* Endpoint Header */}
                                            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded ${methodColors[endpoint.method]}`}>
                                                    {endpoint.method}
                                                </span>
                                                <code className="text-sm font-mono text-slate-700">{endpoint.path}</code>
                                            </div>

                                            <div className="p-4">
                                                <p className="text-slate-600 mb-4">{endpoint.description}</p>

                                                {/* Request */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">Request</span>
                                                        <button
                                                            onClick={() => handleCopy(endpoint.request, `req-${section.id}-${index}`)}
                                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {copied === `req-${section.id}-${index}` ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                                                        {endpoint.request}
                                                    </pre>
                                                </div>

                                                {/* Response */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">Response</span>
                                                        <button
                                                            onClick={() => handleCopy(endpoint.response, `res-${section.id}-${index}`)}
                                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {copied === `res-${section.id}-${index}` ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                                                        {endpoint.response}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
