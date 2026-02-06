'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

interface User {
    id: string;
    username: string;
    role: string;
}

export default function Navbar() {
    const { t, lang, toggleLang } = useI18n();
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3 shadow-glass' : 'bg-transparent py-4'
                }`}
        >
            <div className="container-main">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Q</span>
                        </div>
                        <span className="text-xl font-bold text-text-primary">Qomus</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                    ? 'text-text-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-600 rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium transition-all hover:bg-white/10"
                        >
                            <span className={lang === 'uz' ? 'text-text-primary' : 'text-text-muted'}>UZ</span>
                            <span className="text-text-muted">/</span>
                            <span className={lang === 'en' ? 'text-text-primary' : 'text-text-muted'}>EN</span>
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {user.username[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">{user.username}</span>
                                    <svg className={`w-4 h-4 text-text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 py-2 glass rounded-xl border border-white/10"
                                        >
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t.nav.dashboard}
                                            </Link>
                                            {user.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    {t.nav.admin}
                                                </Link>
                                            )}
                                            <hr className="my-2 border-white/10" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-status-red hover:bg-white/5"
                                            >
                                                {t.auth.logout}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary text-sm">
                                {t.auth.login}
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/5"
                    >
                        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4"
                        >
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href
                                            ? 'bg-brand-600/20 text-brand-400'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <hr className="my-3 border-white/10" />

                                <div className="flex items-center justify-between px-4">
                                    <span className="text-sm text-text-muted">{t.common.language}</span>
                                    <button
                                        onClick={toggleLang}
                                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium"
                                    >
                                        {lang === 'uz' ? 'O\'zbekcha' : 'English'}
                                    </button>
                                </div>

                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5"
                                        >
                                            {t.nav.dashboard}
                                        </Link>
                                        {user.role === 'ADMIN' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/5"
                                            >
                                                {t.nav.admin}
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-3 rounded-xl text-sm font-medium text-status-red text-left hover:bg-white/5"
                                        >
                                            {t.auth.logout}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="btn btn-primary mx-4 mt-2"
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
