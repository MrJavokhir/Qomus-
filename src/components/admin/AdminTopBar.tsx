'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

interface User {
    id: string;
    username: string;
    role: string;
}

export default function AdminTopBar() {
    const { lang, toggleLang, t } = useI18n();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="fixed top-0 right-0 left-64 h-16 glass border-b border-white/10 z-40 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                {/* Search Bar - Aesthetic only for now */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 w-64">
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={lang === 'uz' ? 'Qidirish...' : 'Search...'}
                        className="bg-transparent border-none text-xs text-text-primary focus:ring-0 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Toggle */}
                <button
                    onClick={toggleLang}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold transition-all hover:bg-white/10 flex items-center gap-1"
                >
                    <span className={lang === 'uz' ? 'text-brand-400' : 'text-text-muted'}>UZ</span>
                    <span className="text-text-muted">/</span>
                    <span className={lang === 'en' ? 'text-brand-400' : 'text-text-muted'}>EN</span>
                </button>

                {/* User Info */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <span className="text-sm font-medium text-text-primary hidden sm:inline">{user.username}</span>
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.username[0].toUpperCase()}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-0" onClick={() => setIsUserMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 py-2 glass rounded-2xl border border-white/10 shadow-2xl z-10"
                                    >
                                        <div className="px-4 py-2 border-b border-white/5 mb-2">
                                            <p className="text-xs text-text-muted">{lang === 'uz' ? 'Rol' : 'Role'}</p>
                                            <p className="text-sm font-bold text-brand-400">{user.role}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-status-red hover:bg-white/5 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {lang === 'uz' ? 'Chiqish' : 'Logout'}
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </header>
    );
}
