'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Admin routes dictate their own layout, so we hide the public shell
    const isAdmin = pathname?.startsWith('/admin');

    // Auth pages (login/register) might want a simpler layout, but usually they share the public navbar.
    // The user's current login page has Navbar, so we keep it.

    if (isAdmin) {
        // For admin, we just render the children (which will include AdminLayout)
        // We might want to wrap it in PageTransition too for smooth Admin <-> Public switches?
        // Let's wrap it to be safe and consistent.
        return (
            <PageTransition>
                {children}
            </PageTransition>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
            <Footer />
        </div>
    );
}
