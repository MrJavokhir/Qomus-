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
    coverImageUrl?: string | null;
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
        >
            <Link href={`/events/${event.id}`}>
                <div className="card card-hover h-full group flex flex-col overflow-hidden">
                    {/* Cover Image Section */}
                    <div className="aspect-[2/1] w-full overflow-hidden relative bg-gradient-to-br from-brand-600/30 to-brand-800/30">
                        {event.coverImageUrl ? (
                            <img
                                src={event.coverImageUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-16 h-16 text-brand-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-60" />
                        {/* Date overlay */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                            <span className="px-3 py-1 bg-brand-600 rounded-lg text-sm font-bold">
                                {day} {month}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className={`badge ${event.status === 'UPCOMING' ? 'badge-green' : 'badge-yellow'}`}>
                                        {event.status === 'UPCOMING' ? t.events.upcoming : t.events.past}
                                    </span>
                                    {event.coverImageUrl && (
                                        <div className="text-xs font-bold text-text-muted">
                                            {day} {month}
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-semibold text-text-primary mb-3 line-clamp-2 group-hover:text-brand-400 transition-colors">
                                    {title}
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="truncate">{location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {event.status === 'UPCOMING' && (
                            <div className="mt-auto pt-4 border-t border-white/10">
                                <span className="text-sm font-medium text-brand-400 group-hover:text-brand-300 flex items-center gap-1">
                                    {t.events.register}
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
