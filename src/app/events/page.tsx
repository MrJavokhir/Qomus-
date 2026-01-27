'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { useI18n } from '@/i18n';

interface Event {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    date: string;
    time: string;
    locationUz: string;
    locationEn: string;
    status: string;
    coverImageUrl: string | null;
}

export default function EventsPage() {
    const { t, lang } = useI18n();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter((event) => {
        if (filter === 'ALL') return true;
        return event.status === filter;
    });

    const tabs = [
        { key: 'ALL', label: t.common.all },
        { key: 'UPCOMING', label: t.events.upcoming },
        { key: 'PAST', label: t.events.past },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="heading-1 text-text-primary mb-4">
                            {t.events.title}
                        </h1>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {lang === 'uz'
                                ? "Huquqiy seminarlar, musobaqalar va konferensiyalar haqida bilib oling va qatnashing."
                                : "Learn about and participate in legal seminars, competitions, and conferences."}
                        </p>
                    </motion.div>

                    {/* Filter Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center mb-10"
                    >
                        <div className="inline-flex bg-white/5 rounded-xl p-1 border border-white/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key as 'ALL' | 'UPCOMING' | 'PAST')}
                                    className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === tab.key
                                        ? 'text-text-primary'
                                        : 'text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    {filter === tab.key && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute inset-0 bg-brand-600 rounded-lg"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Events Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card p-6">
                                    <div className="flex gap-4">
                                        <div className="skeleton h-14 w-14 rounded-xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="skeleton h-4 w-20 rounded mb-3" />
                                            <div className="skeleton h-6 w-full rounded mb-2" />
                                            <div className="skeleton h-4 w-3/4 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: { staggerChildren: 0.1 },
                                },
                            }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredEvents.map((event, i) => (
                                <EventCard key={event.id} event={event} index={i} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-text-muted text-lg">{t.events.noEvents}</p>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
