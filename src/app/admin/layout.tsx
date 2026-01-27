'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { ToastProvider } from '@/components/admin/ToastProvider';
import { useI18n } from '@/i18n';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { t } = useI18n();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    router.push('/login?redirect=/admin');
                    return;
                }
                const data = await res.json();
                if (data.user.role !== 'ADMIN') {
                    router.push('/dashboard');
                    return;
                }
                setAuthorized(true);
            } catch (err) {
                console.error(err);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-brand-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-text-secondary font-medium anim-pulse">{t.common.loading}</span>
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary">
            <ToastProvider>
                <AdminSidebar />
                <div className="ml-64 flex flex-col min-h-screen">
                    <AdminTopBar />
                    <main className="flex-1 pt-24 pb-12 px-8">
                        {children}
                    </main>
                </div>
            </ToastProvider>
        </div>
    );
}
