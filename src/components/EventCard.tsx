'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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

interface EventCardProps {
    event: Event;
    index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
    const { t, lang } = useI18n();

    const title = getLocalizedContent(event, 'title', lang);
    const location = getLocalizedContent(event, 'location', lang);

    const date = new Date(event.date);
    const day = date.getDate();
    const month = date.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short' });
    const year = date.getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
        >
            <Link href={`/events/${event.id}`}>
                <div className="card card-hover h-full group flex flex-col p-6 relative overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Header with Date Badge and Status */}
                    <div className="flex items-start gap-4 mb-4 relative z-10">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-16 h-16 bg-brand-600/10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-brand-600/20 group-hover:border-brand-600/40 transition-colors">
                            <span className="text-2xl font-bold text-brand-400 group-hover:text-brand-300 transition-colors">{day}</span>
                            <span className="text-xs text-brand-400/80 uppercase mb-1">{month}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`badge ${event.status === 'UPCOMING' ? 'badge-green' : 'badge-yellow'}`}>
                                    {event.status === 'UPCOMING' ? t.events.upcoming : t.events.past}
                                </span>
                                <span className="text-xs text-text-muted">{year}</span>
                            </div>

                            <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-brand-400 transition-colors">
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{event.time}</span>
                        </div>
                    </div>

                    {/* CTA */}
                    {event.status === 'UPCOMING' ? (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <span className="text-sm font-medium text-brand-400 group-hover:text-brand-300 flex items-center gap-1">
                                {t.events.register}
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <span className="text-sm font-medium text-text-muted group-hover:text-text-secondary flex items-center gap-1">
                                {lang === 'uz' ? "Ko'rish" : 'View Details'}
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
