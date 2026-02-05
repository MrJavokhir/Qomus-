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

    const upcomingEvents = events
        .filter(e => e.status === 'UPCOMING')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pastEvents = events
        .filter(e => e.status === 'PAST')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const EventGrid = ({ items }: { items: Event[] }) => (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
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
                    ) : (
                        <div className="space-y-20">
                            {/* Upcoming Events */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="heading-2 text-text-primary">{t.events.upcoming}</h2>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                {upcomingEvents.length > 0 ? (
                                    <EventGrid items={upcomingEvents} />
                                ) : (
                                    <p className="text-text-muted italic">{lang === 'uz' ? 'Hozircha kutilayotgan tadbirlar yo\'q' : 'No upcoming events'}</p>
                                )}
                            </section>

                            {/* Past Events */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="heading-2 text-text-primary opacity-80">{t.events.past}</h2>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                                {pastEvents.length > 0 ? (
                                    <EventGrid items={pastEvents} />
                                ) : (
                                    <p className="text-text-muted italic">{lang === 'uz' ? 'O\'tib ketgan tadbirlar yo\'q' : 'No past events'}</p>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
