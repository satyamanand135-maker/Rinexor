import { Brain, Cpu, Megaphone, Code2, BarChart3, ArrowRight, Calendar, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const categories = [
    { icon: Brain, name: 'AI in Debt Recovery', count: 12 },
    { icon: Cpu, name: 'FinTech & Enterprise Automation', count: 8 },
    { icon: Megaphone, name: 'Product Updates', count: 15 },
    { icon: Code2, name: 'Engineering Deep Dives', count: 6 },
    { icon: BarChart3, name: 'Case Studies & Insights', count: 4 }
];

const featuredPosts = [
    {
        category: 'AI in Debt Recovery',
        title: 'How AI Risk Scoring is Revolutionizing Collection Prioritization',
        excerpt: 'Learn how machine learning models can predict recovery probability with 85% accuracy, helping enterprises focus on the right cases at the right time.',
        author: 'Dr. Priya Sharma',
        date: 'Jan 15, 2026',
        readTime: '8 min read',
        image: 'from-brand-blue to-brand-violet'
    },
    {
        category: 'Engineering Deep Dives',
        title: 'Building a Real-Time SLA Monitoring System at Scale',
        excerpt: 'A technical deep dive into how we built our SLA tracking infrastructure to handle millions of cases with sub-second breach detection.',
        author: 'Rahul Mehta',
        date: 'Jan 10, 2026',
        readTime: '12 min read',
        image: 'from-brand-teal to-emerald-500'
    },
    {
        category: 'Product Updates',
        title: 'Introducing Advanced Analytics Dashboard 2.0',
        excerpt: 'Our biggest analytics update yet: custom report builder, predictive forecasting, and real-time performance benchmarking.',
        author: 'Sarah Chen',
        date: 'Jan 5, 2026',
        readTime: '5 min read',
        image: 'from-amber-400 to-orange-500'
    },
    {
        category: 'Case Studies & Insights',
        title: 'How Axis Financial Increased Recovery Rates by 34%',
        excerpt: 'A detailed case study on how a leading NBFC transformed their debt collection operations with Rinexor\'s intelligent allocation.',
        author: 'Rinexor Team',
        date: 'Dec 28, 2025',
        readTime: '10 min read',
        image: 'from-brand-navy to-brand-slate'
    }
];

export default function Blog() {
    return (
        <PageLayout
            title="Blog"
            subtitle="Insights on AI, debt recovery, and the future of enterprise automation."
        >
            <div className="container mx-auto px-6">
                {/* Categories */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by Category</h2>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-colors"
                            >
                                <category.icon size={16} />
                                {category.name}
                                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{category.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Posts Grid */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Latest Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {featuredPosts.map((post, index) => (
                            <article
                                key={index}
                                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image placeholder */}
                                <div className={`h-48 bg-gradient-to-br ${post.image}`}></div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-medium px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full">
                                            {post.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-blue transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-sm font-medium text-slate-700">{post.author}</span>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Load More */}
                <div className="text-center mb-16">
                    <button className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                        Load More Articles <ArrowRight size={18} />
                    </button>
                </div>

                {/* Newsletter CTA */}
                <div className="bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Stay Updated
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                        Get the latest insights on AI, debt recovery, and enterprise automation delivered to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-grow px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-brand-teal outline-none"
                        />
                        <button className="bg-brand-teal text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
