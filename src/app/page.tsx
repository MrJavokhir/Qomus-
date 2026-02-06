'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import Typewriter from '@/components/Typewriter';
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
    const [highlightStart, setHighlightStart] = useState(false);

    // Reset animation on language change
    useEffect(() => {
        setHighlightStart(false);
    }, [lang]);

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
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />

            {/* HERO SECTION - REDESIGNED */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Visual Elements - Blobs & Mesh */}
                <div className="absolute inset-0 pointer-events-none select-none">
                    {/* Light Mode Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-mesh opacity-60 dark:opacity-20 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />

                    <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-400/30 rounded-full blur-[64px] animate-blob mix-blend-multiply dark:mix-blend-screen dark:bg-brand-600/20" />
                    <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-400/30 rounded-full blur-[64px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen dark:bg-blue-600/20" />
                </div>

                <div className="container-main relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-brand-200 dark:border-brand-500/30 mb-8 mx-auto shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                            </span>
                            <span className="text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                                Qomus 2.0 Available Now
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="heading-display mb-8"
                        >
                            <Typewriter
                                text={c.heroTitle}
                                onComplete={() => setHighlightStart(true)}
                                key={`title-${lang}`}
                                showCursor={!highlightStart}
                            />{' '}
                            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 dark:from-brand-400 dark:via-brand-300 dark:to-indigo-300">
                                <Typewriter
                                    text={c.heroHighlight}
                                    trigger={highlightStart}
                                    key={`highlight-${lang}`}
                                    showCursor={true}
                                />
                                {/* Underline decoration */}
                                <motion.svg
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: highlightStart ? 1 : 0, scaleX: highlightStart ? 1 : 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="absolute w-[110%] h-4 -bottom-2 -left-[5%] text-brand-500/30 dark:text-brand-400/30 -z-10 origin-left"
                                    viewBox="0 0 200 9"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2.00025 6.99997C25.7538 4.77341 55.292 2.05263 88.9416 2.00021C117.478 1.95604 148.887 2.37943 194.258 5.67919" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </motion.svg>
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            {c.heroSubtitle}
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Link href="/events" className="btn btn-primary w-full sm:w-auto text-lg px-8 py-3.5 group">
                                {c.viewEvents}
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link href="/resources" className="btn btn-secondary w-full sm:w-auto text-lg px-8 py-3.5">
                                {c.viewResources}
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats Cards - Floating */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto"
                    >
                        {[
                            { value: stats?.totalEvents ?? '-', label: lang === 'uz' ? 'Tadbirlar' : 'Events', icon: '📅' },
                            { value: stats?.totalRegistrations ?? '-', label: lang === 'uz' ? 'Ro\'yxatlar' : 'Registrations', icon: '📝' },
                            { value: stats?.totalResources ?? '-', label: lang === 'uz' ? 'Resurslar' : 'Resources', icon: '📚' },
                            { value: stats?.totalVideos ?? '-', label: lang === 'uz' ? 'Videolar' : 'Videos', icon: '🎥' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="card bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-white/40 p-6 text-center shadow-lg shadow-brand-500/5 hover:shadow-brand-500/10 transition-all duration-300"
                            >
                                <span className="text-2xl mb-2 block filter grayscale opacity-80">{stat.icon}</span>
                                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-600 to-brand-800 dark:from-white dark:to-slate-300 mb-1 font-display">{stat.value}</div>
                                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* UPCOMING EVENTS */}
            <section className="section">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-end justify-between mb-10"
                    >
                        <div>
                            <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">Don't Miss Out</span>
                            <h2 className="heading-2">{c.upcomingEvents}</h2>
                        </div>
                        <Link href="/events" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
                            {c.viewAll}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card p-6 h-[400px] animate-pulse bg-white/50" />
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {events.map((event, i) => (
                                <EventCard key={event.id} event={event} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-slate-300 text-text-muted">{c.noData}</div>
                    )}
                </div>
            </section>

            {/* RESOURCES & VIDEOS GRID */}
            <section className="section bg-slate-50/50 dark:bg-white/5">
                <div className="container-main">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Resources Column */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-between mb-8"
                            >
                                <h2 className="heading-2">{c.latestResources}</h2>
                                <Link href="/resources" className="text-sm font-semibold text-brand-600 hover:text-brand-700">{c.viewAll}</Link>
                            </motion.div>

                            <div className="space-y-4">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/50 animate-pulse" />)
                                ) : resources.length > 0 ? (
                                    resources.map((resource, i) => (
                                        <motion.div
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="card p-4 hover:border-brand-500/30 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${resource.fileType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} dark:bg-white/5`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-lg text-text-primary truncate group-hover:text-brand-600 transition-colors">
                                                        {getLocalizedContent(resource, 'title', lang)}
                                                    </h3>
                                                    <p className="text-sm text-text-muted truncate">
                                                        {getLocalizedContent(resource, 'description', lang)}
                                                    </p>
                                                </div>
                                                <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-white/10 text-text-secondary">
                                                    {resource.fileType}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : <p className="text-text-muted">{c.noData}</p>}
                            </div>
                        </div>

                        {/* Videos Column */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-between mb-8"
                            >
                                <h2 className="heading-2">{c.latestVideos}</h2>
                                <Link href="/videos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">{c.viewAll}</Link>
                            </motion.div>

                            <div className="grid gap-6">
                                {loading ? (
                                    [1, 2].map(i => <div key={i} className="h-48 rounded-2xl bg-white/50 animate-pulse" />)
                                ) : videos.length > 0 ? (
                                    videos.map((video, i) => (
                                        <motion.div
                                            key={video.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-brand-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                                <h3 className="text-white font-semibold text-lg line-clamp-1">
                                                    {getLocalizedContent(video, 'title', lang)}
                                                </h3>
                                                <span className="text-white/80 text-xs mt-1">
                                                    {formatDuration(video.durationSeconds)} • Watch now
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : <p className="text-text-muted">{c.noData}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
