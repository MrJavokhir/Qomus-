'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Registration {
    id: string;
    teamName: string;
    membersCount: number;
    ratingStatus: string;
    createdAt: string;
    event: {
        id: string;
        titleUz: string;
        titleEn: string;
        date: string;
        status: string;
    };
}

interface User {
    id: string;
    username: string;
    role: string;
}

export default function DashboardPage() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (!userRes.ok) {
                    router.push('/login?redirect=/dashboard');
                    return;
                }
                const userData = await userRes.json();
                setUser(userData.user);

                const regRes = await fetch('/api/registrations/me');
                if (regRes.ok) {
                    const regData = await regRes.json();
                    setRegistrations(regData.registrations || []);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const getRatingBadge = (status: string) => {
        switch (status) {
            case 'GREEN':
                return <span className="badge badge-green">{t.rating.green}</span>;
            case 'YELLOW':
                return <span className="badge badge-yellow">{t.rating.yellow}</span>;
            case 'RED':
                return <span className="badge badge-red">{t.rating.red}</span>;
            default:
                return <span className="badge badge-yellow">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-text-secondary">{t.common.loading}</span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="heading-1 text-text-primary mb-2">
                            {t.dashboard.welcome}, {user?.username}! 👋
                        </h1>
                        <p className="text-text-secondary">
                            {lang === 'uz' ? "Ro'yxatlaringiz va faoliyatingizni boshqaring" : 'Manage your registrations and activity'}
                        </p>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid md:grid-cols-3 gap-6 mb-8"
                    >
                        <div className="card card-hover p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-300 group-hover:bg-brand-600/10" />
                            <div className="flex items-center gap-4 relative">
                                <div className="w-14 h-14 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted font-medium mb-1">{t.dashboard.myRegistrations}</p>
                                    <p className="text-3xl font-bold text-text-primary">{registrations.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-hover p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-status-green/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-300 group-hover:bg-status-green/10" />
                            <div className="flex items-center gap-4 relative">
                                <div className="w-14 h-14 bg-status-green/10 rounded-2xl flex items-center justify-center text-status-green group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted font-medium mb-1">{t.rating.green}</p>
                                    <p className="text-3xl font-bold text-text-primary">
                                        {registrations.filter(r => r.ratingStatus === 'GREEN').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-hover p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-status-yellow/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-300 group-hover:bg-status-yellow/10" />
                            <div className="flex items-center gap-4 relative">
                                <div className="w-14 h-14 bg-status-yellow/10 rounded-2xl flex items-center justify-center text-status-yellow group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted font-medium mb-1">{lang === 'uz' ? 'Kutilmoqda' : 'Pending'}</p>
                                    <p className="text-3xl font-bold text-text-primary">
                                        {registrations.filter(r => r.ratingStatus === 'YELLOW').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Registrations Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card overflow-hidden border border-white/5 bg-dark-card/50 backdrop-blur-sm"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="heading-3 text-text-primary">{t.dashboard.myRegistrations}</h2>
                            <Link href="/events" className="btn btn-primary text-sm shadow-button hover:shadow-glow transition-all">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {lang === 'uz' ? "Yangi ro'yxatdan o'tish" : 'New Registration'}
                            </Link>
                        </div>

                        {registrations.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-text-primary mb-2">{t.dashboard.noRegistrations}</h3>
                                <p className="text-text-muted mb-8 max-w-sm mx-auto">
                                    {lang === 'uz' ? "Hozircha hech qanday tadbirga ro'yxatdan o'tmagansiz. Tadbirlar bo'limidan o'zingizga mosini tanlang." : "You haven't registered for any events yet. Choose an event from the events section."}
                                </p>
                                <Link href="/events" className="btn btn-secondary">
                                    {t.nav.events}
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="text-left py-5 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.registration.teamName}</th>
                                            <th className="text-left py-5 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.nav.events}</th>
                                            <th className="text-left py-5 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.registration.membersCount}</th>
                                            <th className="text-left py-5 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.admin.rating}</th>
                                            <th className="text-left py-5 px-6 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.events.date}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {registrations.map((reg, i) => (
                                            <motion.tr
                                                key={reg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 + 0.2 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="py-5 px-6">
                                                    <span className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors">{reg.teamName}</span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <Link
                                                        href={`/events/${reg.event.id}`}
                                                        className="text-text-secondary hover:text-brand-400 transition-colors"
                                                    >
                                                        {getLocalizedContent(reg.event, 'title', lang)}
                                                    </Link>
                                                </td>
                                                <td className="py-5 px-6 text-text-secondary">{reg.membersCount}</td>
                                                <td className="py-5 px-6">{getRatingBadge(reg.ratingStatus)}</td>
                                                <td className="py-5 px-6 text-text-muted text-sm font-mono">
                                                    {new Date(reg.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
