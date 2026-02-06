'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function ContactPage() {
    const { lang, t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            label: "Email",
            value: "info@qomus.uz",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            label: lang === 'uz' ? "Telefon" : "Phone",
            value: "+998 71 123 45 67",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            label: lang === 'uz' ? "Manzil" : "Location",
            value: "Toshkent shahri, O'zbekiston",
        }
    ];

    return (
        <div className="flex-1 pt-24 pb-16">
            <div className="container-main">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <h1 className="heading-1 text-text-primary mb-4">{t.nav.contact}</h1>
                    <p className="text-text-secondary">
                        {lang === 'uz' ? "Savollaringiz bo'lsa, quyidagi forma orqali bizga murojaat qiling." : "If you have any questions, please contact us using the form below."}
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {contactInfo.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card p-6 border-white/5 bg-dark-card/50"
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1">
                                            {item.label}
                                        </p>
                                        <p className="text-text-primary font-medium">{item.value}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <div className="card p-8 md:p-10 border-white/10 glass">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">{lang === 'uz' ? 'Ismingiz' : 'Full Name'}</label>
                                        <input type="text" required className="input" placeholder="Javohir Mutallibov" />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input type="email" required className="input" placeholder="example@mail.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">{lang === 'uz' ? 'Mavzu' : 'Subject'}</label>
                                    <input type="text" required className="input" placeholder={lang === 'uz' ? 'Hamkorlik bo\'yicha' : 'Regarding collaboration'} />
                                </div>
                                <div>
                                    <label className="label">{lang === 'uz' ? 'Xabar' : 'Message'}</label>
                                    <textarea required rows={5} className="input resize-none" placeholder={lang === 'uz' ? 'Xabaringizni yozing...' : 'Write your message...'} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="btn btn-primary w-full py-4 text-base"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : success ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {lang === 'uz' ? 'Yuborildi!' : 'Sent!'}
                                        </div>
                                    ) : (
                                        lang === 'uz' ? 'Yuborish' : 'Send Message'
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
