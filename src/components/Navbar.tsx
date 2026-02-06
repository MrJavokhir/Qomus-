'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useTheme } from 'next-themes';

interface User {
    id: string;
    username: string;
    role: string;
}

export default function Navbar() {
    const { t, lang, toggleLang } = useI18n();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch {
                setUser(null);
            }
        };
        checkAuth();
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setIsUserMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { href: '/', label: t.nav.home },
        { href: '/events', label: t.nav.events },
        { href: '/resources', label: t.nav.resources },
        { href: '/videos', label: t.nav.videos },
        { href: '/about', label: t.nav.about },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-0`}
        >
            <div className={`container-main rounded-2xl transition-all duration-300 ${scrolled ? 'glass py-3 shadow-lg' : 'bg-transparent py-4'
                }`}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-display font-bold text-xl">Q</span>
                        </div>
                        <span className="text-xl font-display font-bold text-text-primary tracking-tight group-hover:text-brand-600 transition-colors">Qomus</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 dark:border-white/5 shadow-sm">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${pathname === link.href
                                    ? 'text-brand-600 dark:text-white'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/40 dark:hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 text-text-secondary hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                            aria-label="Toggle theme"
                        >
                            <span className="sr-only">Toggle theme</span>
                            <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
                                <motion.div
                                    animate={{ rotate: theme === 'dark' ? 0 : 90, scale: theme === 'dark' ? 1 : 0 }}
                                    className="absolute"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: theme === 'light' ? 0 : -90, scale: theme === 'light' ? 1 : 0 }}
                                    className="absolute"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </motion.div>
                            </div>
                        </button>

                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 text-sm font-semibold transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md"
                        >
                            <span className={lang === 'uz' ? 'text-brand-600 dark:text-brand-400' : 'text-text-muted'}>UZ</span>
                            <span className="text-text-muted/50">|</span>
                            <span className={lang === 'en' ? 'text-brand-600 dark:text-brand-400' : 'text-text-muted'}>EN</span>
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md group"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                                        <span className="text-white text-xs font-bold">
                                            {user.username[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-text-primary hidden sm:block">{user.username}</span>
                                </button>
                                {/* User Dropdown (Same functionality, improved style) */}
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 py-2 glass rounded-2xl border border-white/40 dark:border-white/10 shadow-xl origin-top-right overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                                                <p className="text-sm font-medium text-text-primary">{user.username}</p>
                                                <p className="text-xs text-text-muted truncate">Student Access</p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2.5 text-sm text-text-secondary hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t.nav.dashboard}
                                            </Link>
                                            {user.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2.5 text-sm text-text-secondary hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    {t.nav.admin}
                                                </Link>
                                            )}
                                            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                {t.auth.logout}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary px-6 py-2 text-sm shadow-lg shadow-brand-500/25">
                                {t.auth.login}
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-text-primary transition-colors"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-between">
                            <span className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`w-full h-0.5 bg-current rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="pt-4 pb-2 flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.href
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <hr className="my-2 border-dashed border-black/10 dark:border-white/10" />

                                <div className="flex items-center justify-between px-4 py-2">
                                    <span className="text-sm font-medium text-text-muted">{t.common.language}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={toggleLang}
                                            className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-sm font-medium"
                                        >
                                            {lang === 'uz' ? 'UZ' : 'EN'}
                                        </button>
                                        <button
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5"
                                        >
                                            {theme === 'dark' ? '🌙' : '☀️'}
                                        </button>
                                    </div>
                                </div>

                                {user ? (
                                    <div className="space-y-1 px-2">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                                        >
                                            {t.nav.dashboard}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                        >
                                            {t.auth.logout}
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="btn btn-primary w-full justify-center mt-2"
                                    >
                                        {t.auth.login}
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}
