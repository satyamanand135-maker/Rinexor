import { Rocket, Users, TrendingUp, Heart, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const openPositions = [
    {
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote / Bangalore',
        type: 'Full-time',
        description: 'Build beautiful, performant interfaces for our enterprise platform using React, TypeScript, and modern frontend technologies.'
    },
    {
        title: 'Backend Engineer',
        department: 'Engineering',
        location: 'Remote / Bangalore',
        type: 'Full-time',
        description: 'Design and implement scalable APIs and services using Python, FastAPI, and PostgreSQL to power our debt recovery platform.'
    },
    {
        title: 'ML Engineer',
        department: 'AI & Data',
        location: 'Remote / Bangalore',
        type: 'Full-time',
        description: 'Develop and deploy machine learning models for risk scoring, recovery prediction, and intelligent case allocation.'
    },
    {
        title: 'Product Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        description: 'Shape the user experience of enterprise debt recovery. Create intuitive interfaces that make complex workflows simple.'
    }
];

const benefits = [
    {
        icon: Rocket,
        title: 'High Impact Work',
        description: 'Work on problems that affect millions of businesses. Your code directly improves debt recovery outcomes.'
    },
    {
        icon: Users,
        title: 'World-Class Team',
        description: 'Collaborate with experienced engineers, designers, and domain experts from top tech companies.'
    },
    {
        icon: TrendingUp,
        title: 'Rapid Growth',
        description: 'Join at an early stage where your contributions shape the product and company trajectory.'
    },
    {
        icon: Heart,
        title: 'Culture of Care',
        description: 'Flexible work, competitive compensation, health benefits, and genuine work-life balance.'
    }
];

export default function Careers() {
    return (
        <PageLayout
            title="Careers at Rinexor"
            subtitle="Join us in building the future of intelligent debt recovery."
        >
            <div className="container mx-auto px-6">
                {/* Culture Section */}
                <div className="mb-20">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            A Culture of Innovation & Problem-Solving
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                At Rinexor, we're tackling one of FinTech's most overlooked challenges—making debt recovery intelligent, efficient, and fair. We believe the best solutions come from diverse perspectives, relentless curiosity, and a bias for action.
                            </p>
                            <p>
                                We're building a team of exceptional people who thrive on solving hard problems, shipping great products, and learning continuously. If you want to make a real impact in enterprise AI, this is your opportunity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Work at Rinexor */}
                <div className="bg-gradient-to-br from-brand-navy to-brand-charcoal rounded-2xl p-8 md:p-12 mb-20 text-white">
                    <h2 className="text-3xl font-bold mb-8 text-center">
                        Why Work at Rinexor?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex p-4 bg-white/10 rounded-xl mb-4">
                                    <benefit.icon size={28} className="text-brand-teal" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-slate-300">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Positions */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">
                        Open Positions
                    </h2>
                    <div className="space-y-4">
                        {openPositions.map((position, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-brand-blue/30 transition-all group cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                                            {position.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={14} />
                                                {position.department}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                {position.location}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                                                {position.type}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 mt-3">
                                            {position.description}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="inline-flex items-center gap-2 text-brand-blue font-semibold group-hover:gap-3 transition-all">
                                            Apply <ArrowRight size={18} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-slate-50 rounded-2xl p-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Don't See Your Role?
                    </h2>
                    <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                        We're always looking for exceptional talent. Send us your resume and tell us how you'd like to contribute to Rinexor's mission.
                    </p>
                    <button className="bg-brand-navy text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors">
                        Send General Application
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}
