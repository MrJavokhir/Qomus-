'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n } from '@/i18n';

interface TeamMember {
    id: string;
    fullName: string;
    positionUz: string;
    positionEn: string;
    bioUz: string;
    bioEn: string;
    photoUrl: string;
    telegramUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
}

export default function AboutPage() {
    const { t, lang } = useI18n();
    const [team, setTeam] = useState<TeamMember[]>([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch('/api/team-members?visible=true');
                if (res.ok) {
                    const data = await res.json();
                    setTeam(data.members || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeam();
    }, []);

    const content = {
        uz: {
            title: "Qomus haqida",
            subtitle: "Bizning maqsadimiz — talabalarning huquqiy savodxonligini oshirish va yosh huquqshunoslarni qo'llab-quvvatlash.",
            mission: "Bizning missiyamiz",
            missionText: "Talabalarga nazariy bilimlarini amaliyotda qo'llash uchun platforma yaratish, ularning professional mahoratini oshirish va jamiyatda huquqiy madaniyatni yuksaltirish.",
            values: "Bizning qadriyatlarimiz",
            teamTitle: "Bizning jamoa",
            teamSubtitle: "Qomus platformasi ortidagi professional jamoa bilan tanishing",
            valuesList: [
                { title: "Bilim", dec: "Har doim yangilikka intilish va bilimlarni ulashish." },
                { title: "Shaffoflik", dec: "Barcha jarayonlarda ochiqlik va adolatni ta'minlash." },
                { title: "Hamkorlik", dec: "Jamoaviy ruh va do'stona muhitni qadrlash." }
            ]
        },
        en: {
            title: "About Qomus",
            subtitle: "Our goal is to increase the legal literacy of students and support young lawyers.",
            mission: "Our Mission",
            missionText: "To create a platform for students to apply their theoretical knowledge in practice, improve their professional skills, and elevate legal culture in society.",
            values: "Our Values",
            teamTitle: "Our Team",
            teamSubtitle: "Meet the professional community behind the Qomus platform",
            valuesList: [
                { title: "Knowledge", dec: "Always striving for innovation and sharing knowledge." },
                { title: "Transparency", dec: "Ensuring openness and fairness in all processes." },
                { title: "Collaboration", dec: "Valuing team spirit and a friendly environment." }
            ]
        }
    };

    const c = content[lang];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h1 className="heading-1 text-text-primary mb-6">{c.title}</h1>
                        <p className="text-xl text-text-secondary">{c.subtitle}</p>
                    </motion.div>

                    {/* Mission */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-3xl overflow-hidden glass border border-white/10 flex items-center justify-center p-12"
                        >
                            <div className="w-32 h-32 bg-brand-600/30 rounded-full blur-3xl absolute top-10 left-10" />
                            <div className="w-40 h-40 bg-brand-600/20 rounded-full blur-3xl absolute bottom-10 right-10" />
                            <div className="w-48 h-48 bg-brand-600 rounded-2xl flex items-center justify-center shadow-glow relative z-10">
                                <span className="text-white text-7xl font-bold">Q</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="heading-2 text-text-primary mb-6 flex items-center gap-3">
                                <span className="w-8 h-1 bg-brand-600 rounded-full" />
                                {c.mission}
                            </h2>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                {c.missionText}
                            </p>
                        </motion.div>
                    </div>

                    {/* Values */}
                    <section className="mb-32">
                        <h2 className="heading-2 text-text-primary mb-12 text-center">{c.values}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {c.valuesList.map((val, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card p-8 card-hover"
                                >
                                    <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center mb-6 text-brand-400">
                                        {i === 0 && (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}
                                        {i === 1 && (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                        {i === 2 && (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="heading-3 text-text-primary mb-3">{val.title}</h3>
                                    <p className="text-text-secondary text-sm">
                                        {val.dec}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Team Members Grid */}
                    {team.length > 0 && (
                        <section className="pb-20">
                            <div className="text-center mb-16">
                                <h2 className="heading-2 text-text-primary mb-4">{c.teamTitle}</h2>
                                <p className="text-text-secondary">{c.teamSubtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {team.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="card group overflow-hidden"
                                    >
                                        <div className="aspect-[4/5] bg-dark-bg relative overflow-hidden">
                                            {member.photoUrl ? (
                                                <img
                                                    src={member.photoUrl}
                                                    alt={member.fullName}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-brand-600/30">
                                                    {member.fullName[0]}
                                                </div>
                                            )}
                                            {/* Social Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-4">
                                                {member.telegramUrl && (
                                                    <a href={member.telegramUrl} target="_blank" className="w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:text-brand-400 transition-colors">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.35-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.33 3.68-1.51 4.44-1.78 4.94-1.79.11 0 .35.03.5.16.13.1.17.24.18.34.02.06.02.18.01.22z" /></svg>
                                                    </a>
                                                )}
                                                {member.linkedinUrl && (
                                                    <a href={member.linkedinUrl} target="_blank" className="w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:text-brand-400 transition-colors">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.2 0-2 .7-2.3 1.2v-1h-3v7.8h3v-4.1c0-.4.1-.8.2-1 .3-.7.7-1.1 1.4-1.1.9 0 1.2.7 1.2 1.7v4.5h3zM8.5 7.5A1.5 1.5 0 1 0 7 9a1.5 1.5 0 0 0 1.5-1.5m-1.5 3h-3v7.8h3v-7.8z" /></svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5 text-center">
                                            <h3 className="font-bold text-text-primary text-lg mb-1">{member.fullName}</h3>
                                            <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest">{lang === 'uz' ? member.positionUz : member.positionEn}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
