import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Users, Headphones } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const contactOptions = [
    {
        icon: MessageSquare,
        title: 'Sales Inquiry',
        description: 'Learn how Rinexor can transform your debt recovery operations.',
        cta: 'Talk to Sales'
    },
    {
        icon: Users,
        title: 'Partnership',
        description: 'Explore integration and partnership opportunities.',
        cta: 'Partner with Us'
    },
    {
        icon: Headphones,
        title: 'Support',
        description: 'Get help with your existing Rinexor implementation.',
        cta: 'Get Support'
    }
];

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <PageLayout
            title="Contact Us"
            subtitle="Get in touch with our team. We're here to help."
        >
            <div className="container mx-auto px-6">
                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {contactOptions.map((option, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-brand-blue/30 transition-all text-center cursor-pointer group"
                        >
                            <div className="inline-flex p-4 bg-brand-blue/10 text-brand-blue rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                <option.icon size={28} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{option.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{option.description}</p>
                            <span className="text-brand-blue font-semibold text-sm">{option.cta} →</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Send Us a Message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="Acme Corp"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Tell us about your requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand-navy text-white py-4 rounded-xl font-semibold hover:bg-brand-charcoal transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Contact Information
                        </h2>

                        <div className="bg-slate-50 rounded-2xl p-8 mb-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg text-brand-blue">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Email</h4>
                                        <p className="text-slate-600">contact@rinexor.io</p>
                                        <p className="text-slate-600">sales@rinexor.io</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg text-brand-blue">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Phone</h4>
                                        <p className="text-slate-600">+91 80 4567 8900</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg text-brand-blue">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Office</h4>
                                        <p className="text-slate-600">
                                            WeWork Embassy Tech Village<br />
                                            Outer Ring Road, Bangalore<br />
                                            Karnataka 560103, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo CTA */}
                        <div className="bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-2xl p-8 text-white">
                            <h3 className="text-xl font-bold mb-3">Request a Demo</h3>
                            <p className="text-slate-300 mb-6">
                                See Rinexor in action. Get a personalized walkthrough of our platform tailored to your needs.
                            </p>
                            <button className="bg-white text-brand-navy px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                                Schedule Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
