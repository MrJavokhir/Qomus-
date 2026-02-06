'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Event {
    id: string;
    titleUz: string;
    titleEn: string;
    date: string;
    time: string;
    locationUz: string;
    locationEn: string;
    status: string;
}

interface Resource {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    fileType: string;
}

interface Video {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    durationSeconds: number;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

interface HomeStats {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    totalRegistrations: number;
    totalResources: number;
    totalVideos: number;
    totalUsers: number;
}

export default function HomePage() {
    const { t, lang } = useI18n();
    const [events, setEvents] = useState<Event[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [stats, setStats] = useState<HomeStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, resourcesRes, videosRes, statsRes] = await Promise.all([
                    fetch('/api/events?status=UPCOMING&limit=3'),
                    fetch('/api/resources?limit=3'),
                    fetch('/api/videos?limit=3'),
                    fetch('/api/stats/home'),
                ]);

                if (eventsRes.ok) {
                    const data = await eventsRes.json();
                    setEvents(data.events || []);
                }
                if (resourcesRes.ok) {
                    const data = await resourcesRes.json();
                    setResources(data.resources || []);
                }
                if (videosRes.ok) {
                    const data = await videosRes.json();
                    setVideos(data.videos || []);
                }
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const content = {
        uz: {
            heroTitle: "Huquqiy bilimingizni",
            heroHighlight: "kuchaytiring",
            heroSubtitle: "O'zbekistondagi talabalar uchun huquqiy bilimlar va tajriba almashish platformasi",
            viewEvents: "Tadbirlarni ko'rish",
            viewResources: "Resurslar",
            upcomingEvents: "Kelgusi tadbirlar",
            latestResources: "So'nggi resurslar",
            latestVideos: "So'nggi videolar",
            viewAll: "Hammasini ko'rish",
            noData: "Ma'lumot yo'q",
        },
        en: {
            heroTitle: "Strengthen your",
            heroHighlight: "legal knowledge",
            heroSubtitle: "A platform for legal knowledge and experience sharing for students in Uzbekistan",
            viewEvents: "View Events",
            viewResources: "Resources",
            upcomingEvents: "Upcoming Events",
            latestResources: "Latest Resources",
            latestVideos: "Latest Videos",
            viewAll: "View All",
            noData: "No data available",
        },
    };

    const c = content[lang];

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[100px] animate-pulse-soft" />
                </div>

                <div className="container-main relative">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="heading-display text-text-primary mb-8"
                        >
                            {c.heroTitle}{' '}
                            <span className="text-gradient relative inline-block">
                                {c.heroHighlight}
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-600 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7538 4.77341 55.292 2.05263 88.9416 2.00021C117.478 1.95604 148.887 2.37943 194.258 5.67919" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            {c.heroSubtitle}
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link href="/events" className="btn btn-primary text-base px-8 py-4 shadow-button hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {c.viewEvents}
                            </Link>
                            <Link href="/resources" className="btn btn-secondary text-base px-8 py-4 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {c.viewResources}
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {[
                            { value: stats?.totalEvents ?? '-', label: lang === 'uz' ? 'Tadbirlar' : 'Events' },
                            { value: stats?.totalRegistrations ?? '-', label: lang === 'uz' ? 'Ro\'yxatlar' : 'Registrations' },
                            { value: stats?.totalResources ?? '-', label: lang === 'uz' ? 'Resurslar' : 'Resources' },
                            { value: stats?.totalVideos ?? '-', label: lang === 'uz' ? 'Videolar' : 'Videos' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-400 to-brand-600 mb-2">{stat.value}</div>
                                <div className="text-sm font-medium text-text-muted uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="section bg-dark-surface/30">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <h2 className="heading-2 text-text-primary">{c.upcomingEvents}</h2>
                        <Link href="/events" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                            {c.viewAll}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card p-6">
                                    <div className="skeleton h-14 w-14 rounded-xl mb-4" />
                                    <div className="skeleton h-4 w-20 rounded mb-3" />
                                    <div className="skeleton h-6 w-full rounded mb-2" />
                                    <div className="skeleton h-4 w-3/4 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {events.map((event, i) => (
                                <EventCard key={event.id} event={event} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-text-muted">{c.noData}</div>
                    )}
                </div>
            </section>

            {/* Resources Section */}
            <section className="section">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <h2 className="heading-2 text-text-primary">{c.latestResources}</h2>
                        <Link href="/resources" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                            {c.viewAll}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card p-6">
                                    <div className="skeleton h-12 w-12 rounded-xl mb-4" />
                                    <div className="skeleton h-6 w-full rounded mb-2" />
                                    <div className="skeleton h-4 w-3/4 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : resources.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {resources.map((resource, i) => (
                                <motion.div
                                    key={resource.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card card-hover p-6 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                                            {resource.fileType === 'PDF' ? (
                                                <svg className="w-6 h-6 text-status-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`badge mb-2 ${resource.fileType === 'PDF' ? 'badge-red' : 'badge-brand'}`}>
                                                {resource.fileType}
                                            </span>
                                            <h3 className="font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
                                                {getLocalizedContent(resource, 'title', lang)}
                                            </h3>
                                            <p className="text-sm text-text-muted line-clamp-2">
                                                {getLocalizedContent(resource, 'description', lang)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-text-muted">{c.noData}</div>
                    )}
                </div>
            </section>

            {/* Videos Section */}
            <section className="section bg-dark-surface/30">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-between mb-8"
                    >
                        <h2 className="heading-2 text-text-primary">{c.latestVideos}</h2>
                        <Link href="/videos" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                            {c.viewAll}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card">
                                    <div className="skeleton h-40 rounded-t-2xl" />
                                    <div className="p-4">
                                        <div className="skeleton h-6 w-full rounded mb-2" />
                                        <div className="skeleton h-4 w-2/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {videos.map((video, i) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card card-hover overflow-hidden group"
                                >
                                    <div className="relative h-40 bg-dark-surface flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/40 transition-colors">
                                            <svg className="w-8 h-8 text-brand-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        {video.durationSeconds && (
                                            <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-xs text-white">
                                                {formatDuration(video.durationSeconds)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
                                            {getLocalizedContent(video, 'title', lang)}
                                        </h3>
                                        <p className="text-sm text-text-muted line-clamp-2">
                                            {getLocalizedContent(video, 'description', lang)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-text-muted">{c.noData}</div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
