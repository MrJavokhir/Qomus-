'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Report {
    id: string;
    titleUz: string;
    titleEn: string;
    bodyUz: string;
    bodyEn: string;
    coverImageUrl: string | null;
    createdAt: string;
}

export default function ReportsPage() {
    const { t, lang } = useI18n();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                const data = await res.json();
                setReports(data.reports || []);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        {t.nav.reports}
                    </h1>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-pulse text-gray-500">{t.common.loading}</div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No reports available</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {reports.map((report) => {
                                const title = getLocalizedContent(report, 'title', lang);
                                const body = getLocalizedContent(report, 'body', lang);
                                const date = new Date(report.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                });

                                return (
                                    <Link href={`/reports/${report.id}`} key={report.id}>
                                        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
                                            {report.coverImageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={report.coverImageUrl}
                                                    alt={title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div className="p-6">
                                                <p className="text-sm text-gray-500 mb-2">{date}</p>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                                                <p className="text-gray-600 line-clamp-3">{body}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
