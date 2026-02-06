'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';

interface EventImage {
    id: string;
    imageUrl: string;
    order: number;
}

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
    status: 'UPCOMING' | 'PAST';
    coverImageUrl: string | null;
    gallery: EventImage[];
    _count: { registrations: number };
}

interface User {
    id: string;
    username: string;
    role: string;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t, lang } = useI18n();
    const router = useRouter();

    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Registration State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [modalView, setModalView] = useState<'AUTH' | 'FORM' | 'SUCCESS'>('FORM');
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

    // Form State
    const [teamName, setTeamName] = useState('');
    const [membersCount, setMembersCount] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, userRes] = await Promise.all([
                    fetch(`/api/events/${id}`),
                    fetch('/api/auth/me')
                ]);

                if (eventRes.ok) {
                    const data = await eventRes.json();
                    setEvent(data.event);
                }

                if (userRes.ok) {
                    const data = await userRes.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const endpoint = authMode === 'LOGIN' ? '/api/auth/login' : '/api/auth/signup';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setModalView('FORM');
                setError('');
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setModalView('AUTH');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: id,
                    teamName,
                    membersCount,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setModalView('SUCCESS');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-text-secondary">{t.common.loading}</span>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-text-secondary text-lg">Event not found</p>
                <Link href="/events" className="btn btn-primary mt-6">{t.nav.events}</Link>
            </div>
        );
    }

    const title = getLocalizedContent(event, 'title', lang);
    const description = getLocalizedContent(event, 'description', lang);
    const location = getLocalizedContent(event, 'location', lang);
    const formattedDate = new Date(event.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <div className="flex-1 pt-32 pb-20">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-3 gap-12"
                    >
                        {/* Left Column: Content */}
                        <div className="lg:col-span-2">
                            <div className="mb-6">
                                <Link href="/events" className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-sm font-medium mb-8">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    {lang === 'uz' ? 'Tadbirlarga qaytish' : 'Back to Events'}
                                </Link>

                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`badge ${event.status === 'UPCOMING' ? 'badge-green' : 'badge-yellow'}`}>
                                        {event.status === 'UPCOMING' ? t.events.upcoming : t.events.past}
                                    </span>
                                    <span className="text-text-muted text-sm flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {event._count.registrations} {lang === 'uz' ? 'jamoa' : 'teams'}
                                    </span>
                                </div>

                                <h1 className="heading-1 text-text-primary mb-8">{title}</h1>

                                {event.coverImageUrl && (
                                    <div className="aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-glow-brand ring-1 ring-brand-600/20">
                                        <img src={event.coverImageUrl} alt={title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="prose prose-invert max-w-none mb-12">
                                    <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap">
                                        {description}
                                    </p>
                                </div>

                                {/* Gallery Section */}
                                {event.gallery && event.gallery.length > 0 && (
                                    <div className="space-y-6 mt-16">
                                        <h2 className="heading-2 text-text-primary">{lang === 'uz' ? 'Tadbirdan galereya' : 'Gallery from the event'}</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.gallery.map((img) => (
                                                <motion.div
                                                    key={img.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                                                    onClick={() => window.open(img.imageUrl, '_blank')}
                                                >
                                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Info Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                <div className="card p-8 border-white/10 glass">
                                    <div className="space-y-6 mb-8">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-text-muted font-bold mb-1">{t.events.date}</p>
                                                <p className="text-text-primary font-medium">{formattedDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-text-muted font-bold mb-1">{t.events.time}</p>
                                                <p className="text-text-primary font-medium">{event.time}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-text-muted font-bold mb-1">{t.events.location}</p>
                                                <p className="text-text-primary font-medium">{location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {event.status === 'UPCOMING' ? (
                                        <button
                                            onClick={() => {
                                                setModalView(user ? 'FORM' : 'AUTH');
                                                setShowRegisterModal(true);
                                            }}
                                            className="btn btn-primary w-full py-4 text-base animate-pulse-soft"
                                        >
                                            {t.events.register}
                                        </button>
                                    ) : (
                                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-text-muted text-sm">{lang === 'uz' ? 'Bu tadbir yakunlangan' : 'This event has ended'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Share Card */}
                                <div className="card p-6 border-white/10 bg-dark-surface/50">
                                    <p className="text-sm text-text-muted mb-4">{lang === 'uz' ? 'Do\'stlar bilan ulashing:' : 'Share with friends:'}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const url = window.location.href;
                                                const text = encodeURIComponent(`${title}\n${formattedDate}\n${location}`);
                                                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
                                            }}
                                            className="flex-1 btn btn-secondary py-2 text-xs"
                                        >
                                            Telegram
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(window.location.href);
                                                    alert(lang === 'uz' ? 'Havola nusxalandi!' : 'Link copied!');
                                                } catch {
                                                    // Fallback for older browsers
                                                    const textArea = document.createElement('textarea');
                                                    textArea.value = window.location.href;
                                                    document.body.appendChild(textArea);
                                                    textArea.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(textArea);
                                                    alert(lang === 'uz' ? 'Havola nusxalandi!' : 'Link copied!');
                                                }
                                            }}
                                            className="flex-1 btn btn-secondary py-2 text-xs"
                                        >
                                            {lang === 'uz' ? 'Havolani nusxalash' : 'Copy Link'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modern Registration Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="p-8">
                                {modalView === 'AUTH' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <h3 className="heading-3 text-text-primary mb-2">
                                            {authMode === 'LOGIN' ? t.auth.login : t.auth.signup}
                                        </h3>
                                        <p className="text-text-secondary text-sm mb-6">
                                            {lang === 'uz'
                                                ? 'Ro\'yxatdan o\'tish uchun avval tizimga kiring.'
                                                : 'Please login or signup first to register your team.'}
                                        </p>

                                        <form onSubmit={handleAuth} className="space-y-4">
                                            {error && (
                                                <div className="bg-status-red/10 border border-status-red/20 text-status-red p-3 rounded-xl text-xs">
                                                    {error}
                                                </div>
                                            )}
                                            <div>
                                                <label className="label">{t.auth.username}</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="johndoe"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="label">{t.auth.password}</label>
                                                <input
                                                    type="password"
                                                    className="input"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn btn-primary w-full py-3 mt-2"
                                            >
                                                {submitting ? t.common.loading : (authMode === 'LOGIN' ? t.auth.loginButton : t.auth.signupButton)}
                                            </button>
                                        </form>

                                        <div className="mt-6 text-center">
                                            <button
                                                onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                                                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                                            >
                                                {authMode === 'LOGIN' ? t.auth.noAccount + ' ' + t.auth.signupHere : t.auth.haveAccount + ' ' + t.auth.loginHere}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {modalView === 'FORM' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                            </div>
                                            <h3 className="heading-3 text-text-primary">{t.registration.title}</h3>
                                        </div>

                                        <form onSubmit={handleRegister} className="space-y-5">
                                            {error && (
                                                <div className="bg-status-red/10 border border-status-red/20 text-status-red p-3 rounded-xl text-xs">
                                                    {error}
                                                </div>
                                            )}
                                            <div>
                                                <label className="label">{t.registration.teamName}</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                    placeholder={lang === 'uz' ? 'Jamoa nomi' : 'Enter Team Name'}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="label">{t.registration.membersCount}</label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[2, 3, 4, 5, 8].map((num) => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setMembersCount(num)}
                                                            className={`py-2 text-sm font-medium rounded-lg border transition-all ${membersCount === num
                                                                ? 'bg-brand-600 border-brand-600 text-white'
                                                                : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="20"
                                                    value={membersCount}
                                                    onChange={(e) => setMembersCount(parseInt(e.target.value))}
                                                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer mt-4"
                                                />
                                                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                                    <span>1</span>
                                                    <span>20</span>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn btn-primary w-full py-4 text-base"
                                            >
                                                {submitting ? t.common.loading : t.registration.submit}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {modalView === 'SUCCESS' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6"
                                    >
                                        <div className="w-20 h-20 bg-status-green/20 text-status-green rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="heading-3 text-text-primary mb-2">{t.registration.success}</h3>
                                        <p className="text-text-secondary text-sm mb-8">
                                            {lang === 'uz'
                                                ? `"${teamName}" jamoasi muvaffaqiyatli ro'yxatdan o'tkazildi.`
                                                : `Team "${teamName}" has been successfully registered.`}
                                        </p>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="btn btn-primary w-full py-3"
                                        >
                                            {t.registration.viewRegistrations}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </>
    );
}
