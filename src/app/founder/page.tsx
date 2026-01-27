'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n';

export default function FounderPage() {
    const { lang, t } = useI18n();

    const content = {
        uz: {
            title: "Asoschi haqida",
            name: "Javohir Mutallibov",
            role: "Qomus platformasi asoschisi ва rahbar",
            bio: "Huquq sohasida ko'p yillik tajribaga ega mutaxassis. Talabalik davridan boshlab huquqiy savodxonlikni oshirish va yoshlar o'rtasida huquqiy madaniyatni yuksaltirish maqsadida ushbu platformaga asos solgan.",
            goals: "Platformani yaratishdan maqsad",
            goalsList: [
                "Huquqshunos talabalarni birlashtirish",
                "Amaliy tajriba almashish muhitini yaratish",
                "Zamonaviy yuridik ta'lim resurslarini osonlashtirish"
            ]
        },
        en: {
            title: "About Founder",
            name: "Javohir Mutallibov",
            role: "Founder & Leader of Qomus Platform",
            bio: "A specialist with many years of experience in the field of law. Since his student days, he founded this platform with the goal of increasing legal literacy and raising legal culture among youth.",
            goals: "Goal of creating the platform",
            goalsList: [
                "Uniting law students",
                "Creating an environment for practical experience sharing",
                "Facilitating modern legal educational resources"
            ]
        }
    };

    const c = content[lang];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-3xl overflow-hidden glass border border-white/10 p-8 md:p-12"
                        >
                            {/* Decorative blobs */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />

                            <div className="relative flex flex-col md:flex-row gap-12 items-center">
                                {/* Image Placeholder */}
                                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-dark-surface border border-white/10 p-2 flex-shrink-0">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-brand-600/40 to-brand-800/40 flex items-center justify-center">
                                        <svg className="w-20 h-20 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-block px-3 py-1 bg-brand-600/20 text-brand-400 rounded-lg text-xs font-semibold mb-4 tracking-wider uppercase"
                                    >
                                        {c.title}
                                    </motion.span>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="heading-1 text-text-primary mb-2"
                                    >
                                        {c.name}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-brand-400 font-medium mb-6"
                                    >
                                        {c.role}
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-text-secondary leading-relaxed"
                                    >
                                        {c.bio}
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-12 pt-12 border-t border-white/5"
                            >
                                <h2 className="heading-3 text-text-primary mb-6">{c.goals}</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {c.goalsList.map((goal, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-3 h-3 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-text-secondary">{goal}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
