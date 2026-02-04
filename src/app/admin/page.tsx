'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Stats {
    totalUsers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
    pendingRegistrations: number;
    totalResources: number;
    totalVideos: number;
}

interface RecentRegistration {
    id: string;
    teamName: string;
    createdAt: string;
    event: { titleEn: string; titleUz: string };
    leader: { username: string };
    ratingStatus: string;
    decisionStatus: string;
}

interface PendingRegistration extends RecentRegistration { }

export default function AdminDashboard() {
    const { lang, t } = useI18n();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
    const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setRecentRegistrations(data.recentRegistrations);
                    setPendingRegistrations(data.pendingRegistrations || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            };
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-text-secondary text-sm">{t.common.loading}</span>
            </div>
        </div>
    );

    const kpis = [
        { label: t.admin.totalUsers, value: stats?.totalUsers || 0, icon: 'Users', color: 'brand' },
        { label: lang === 'uz' ? 'Jami tadbirlar' : 'Total Events', value: stats?.totalEvents || 0, icon: 'Calendar', color: 'green' },
        { label: t.admin.upcomingEvents, value: stats?.upcomingEvents || 0, icon: 'Clock', color: 'yellow' },
        { label: t.admin.totalRegistrations, value: stats?.totalRegistrations || 0, icon: 'Check', color: 'brand' },
        { label: 'Pending Approvals', value: stats?.pendingRegistrations || 0, icon: 'Clock', color: 'orange' },
        { label: lang === 'uz' ? 'Resurslar' : 'Resources', value: stats?.totalResources || 0, icon: 'Book', color: 'yellow' },
        { label: lang === 'uz' ? 'Videolar' : 'Videos', value: stats?.totalVideos || 0, icon: 'Video', color: 'red' },
    ];

    return (
        <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card p-6 border-white/10 group hover:border-brand-600/50 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted mb-1 font-medium">{kpi.label}</p>
                                <p className="text-3xl font-extrabold text-text-primary">{kpi.value.toLocaleString()}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color === 'brand' ? 'bg-brand-600/10 text-brand-400' :
                                kpi.color === 'green' ? 'bg-status-green/10 text-status-green' :
                                    kpi.color === 'yellow' ? 'bg-status-yellow/10 text-status-yellow' :
                                        'bg-status-red/10 text-status-red'
                                } group-hover:scale-110 transition-transform duration-300`}>
                                <Icon name={kpi.icon as any} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Approvals Widget */}
            {pendingRegistrations.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="heading-2 text-text-primary">Action Required</h2>
                        <Link href="/admin/registrations?decisionStatus=PENDING" className="text-sm text-brand-400 hover:text-brand-300">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingRegistrations.map((reg) => (
                            <Link key={reg.id} href={`/admin/registrations?decisionStatus=PENDING`} className="block">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="card p-6 border-status-yellow/30 bg-status-yellow/5 hover:border-status-yellow/50 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-full bg-status-yellow/20 text-status-yellow flex items-center justify-center">
                                            <Icon name="Clock" />
                                        </div>
                                        <span className="text-xs font-bold text-status-yellow bg-status-yellow/10 px-2 py-1 rounded">PENDING</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-text-primary mb-1">{reg.teamName}</h3>
                                    <p className="text-sm text-text-secondary mb-4 line-clamp-1">{getLocalizedContent(reg.event, 'title', lang)}</p>
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                        <span>{reg.leader.username}</span>
                                        <span>•</span>
                                        <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 card p-8 border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="heading-3 text-text-primary">
                            {lang === 'uz' ? 'So\'nggi ro\'yxatdan o\'tishlar' : 'Recent Registrations'}
                        </h3>
                        <Link href="/admin/registrations" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                            {lang === 'uz' ? 'Barchasini ko\'rish' : 'View All'}
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-text-muted text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                    <th className="pb-4 px-2">{lang === 'uz' ? 'Jamoa' : 'Team'}</th>
                                    <th className="pb-4 px-2">{lang === 'uz' ? 'Tadbir' : 'Event'}</th>
                                    <th className="pb-4 px-2">{lang === 'uz' ? 'Sardor' : 'Leader'}</th>
                                    <th className="pb-4 px-2">{lang === 'uz' ? 'Vaqt' : 'Time'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-2">
                                            <p className="font-semibold text-text-primary text-sm">{reg.teamName}</p>
                                        </td>
                                        <td className="py-4 px-2">
                                            <p className="text-sm text-text-secondary line-clamp-1">{getLocalizedContent(reg.event, 'title', lang)}</p>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-[10px] font-bold">
                                                    {reg.leader.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-text-secondary">{reg.leader.username}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <p className="text-xs text-text-muted">{new Date(reg.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 space-y-6"
                >
                    <div className="card p-8 border-white/10 h-full">
                        <h3 className="heading-3 text-text-primary mb-6">
                            {lang === 'uz' ? 'Tezkor havolalar' : 'Quick Actions'}
                        </h3>
                        <div className="space-y-4">
                            <QuickAction href="/admin/events" label={lang === 'uz' ? 'Tadbir qo\'shish' : 'Add Event'} icon="Plus" />
                            <QuickAction href="/admin/resources" label={lang === 'uz' ? 'Resurs yuklash' : 'Upload Resource'} icon="Upload" />
                            <QuickAction href="/admin/videos" label={lang === 'uz' ? 'Video qo\'shish' : 'Add Video'} icon="VideoPlus" />
                            <QuickAction href="/admin/team-members" label={lang === 'uz' ? 'Jamoa a\'zosi qo\'shish' : 'Add Team Member'} icon="UserPlus" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-600/50 hover:bg-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-brand-600/10 text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Icon name={icon as any} size="sm" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
            <svg className="w-4 h-4 ml-auto text-text-muted group-hover:text-brand-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

function Icon({ name, size = 'default' }: { name: 'Users' | 'Calendar' | 'Clock' | 'Check' | 'Book' | 'Video' | 'Plus' | 'Upload' | 'VideoPlus' | 'UserPlus', size?: 'default' | 'sm' }) {
    const s = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    switch (name) {
        case 'Users': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'Calendar': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'Clock': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Check': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'Book': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
        case 'Video': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'Plus': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
        case 'Upload': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>;
        case 'VideoPlus': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 11l3 3m0 0l3-3m-3 3V8" /></svg>;
        case 'UserPlus': return <svg className={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
        default: return null;
    }
}
