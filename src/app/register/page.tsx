'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function RegisterPage() {
    const { t, lang } = useI18n();

    const content = {
        uz: {
            title: "Ro'yxatdan o'tish yo'riqnomasi",
            subtitle: "Qomus platformasida qatnashish va jamoani ro'yxatdan o'tkazish bosqichlari",
            step1Title: "1. Akkaunt yarating",
            step1Text: "Foydalanuvchi nomi va parol bilan ro'yxatdan o'ting",
            step2Title: "2. Tadbirni tanlang",
            step2Text: "Kelgusi tadbirlar ro'yxatidan o'zingizga mosini tanlang",
            step3Title: "3. Jamoangizni ro'yxatdan o'tkazing",
            step3Text: "Jamoa nomi va a'zolar sonini kiriting",
            step4Title: "4. Reytingingizni kuzating",
            step4Text: "Administrator jamoangiz faoliyatini baholab boradi",
            createAccount: "Akkaunt yaratish",
            viewEvents: "Tadbirlarni ko'rish",
        },
        en: {
            title: "Registration Guide",
            subtitle: "Steps to participate and register your team on the Qomus platform",
            step1Title: "1. Create an Account",
            step1Text: "Sign up with a username and password",
            step2Title: "2. Choose an Event",
            step2Text: "Select a suitable event from the upcoming events list",
            step3Title: "3. Register Your Team",
            step3Text: "Enter your team name and number of members",
            step4Title: "4. Track Your Rating",
            step4Text: "The administrator will evaluate your team's performance",
            createAccount: "Create Account",
            viewEvents: "View Events",
        },
    };

    const c = content[lang];

    const steps = [
        { title: c.step1Title, text: c.step1Text, icon: "user", color: "brand" },
        { title: c.step2Title, text: c.step2Text, icon: "calendar", color: "green" },
        { title: c.step3Title, text: c.step3Text, icon: "users", color: "yellow" },
        { title: c.step4Title, text: c.step4Text, icon: "check", color: "brand" },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case "user":
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
            case "calendar":
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
            case "users":
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
            case "check":
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 pt-32 pb-20">
            <div className="container-main">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h1 className="heading-1 text-text-primary mb-4">
                        {c.title}
                    </h1>
                    <p className="text-xl text-text-secondary">{c.subtitle}</p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card p-8 border-white/10 glass card-hover flex gap-6"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${step.color === 'brand' ? 'bg-brand-600/20 text-brand-400' :
                                    step.color === 'green' ? 'bg-status-green/20 text-status-green' :
                                        'bg-status-yellow/20 text-status-yellow'
                                    }`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getIcon(step.icon)}
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="heading-3 text-text-primary mb-2">{step.title}</h3>
                                    <p className="text-text-secondary text-sm leading-relaxed">{step.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link href="/signup" className="btn btn-primary text-lg px-12 py-4 shadow-glow">
                            {c.createAccount}
                        </Link>
                        <Link href="/events" className="btn btn-secondary text-lg px-12 py-4">
                            {t.nav.events}
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
