'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Resource {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    fileUrl: string;
    fileType: string;
    tags: string;
    createdAt: string;
}

export default function ResourcesPage() {
    const { t, lang } = useI18n();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'PDF' | 'DOCX'>('ALL');
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch('/api/resources');
                if (res.ok) {
                    const data = await res.json();
                    setResources(data.resources || []);
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const filteredResources = resources.filter((res) => {
        const title = getLocalizedContent(res, 'title', lang).toLowerCase();
        const desc = getLocalizedContent(res, 'description', lang).toLowerCase();
        const matchesSearch = title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
        const matchesType = typeFilter === 'ALL' || res.fileType === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container-main">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="heading-1 text-text-primary mb-4">
                            {t.nav.resources}
                        </h1>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {lang === 'uz'
                                ? "Huquqiy hujjatlar, qo'llanmalar va o'quv materiallari to'plami."
                                : "Collection of legal documents, manuals, and educational materials."}
                        </p>
                    </motion.div>

                    {/* Filters Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center"
                    >
                        <div className="relative flex-1 w-full">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder={t.common.search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-12"
                            />
                        </div>

                        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 w-full md:w-auto">
                            {['ALL', 'PDF', 'DOCX'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type as any)}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none ${typeFilter === type
                                        ? 'text-text-primary'
                                        : 'text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    {typeFilter === type && (
                                        <motion.div
                                            layoutId="resource-tab-indicator"
                                            className="absolute inset-0 bg-brand-600 rounded-lg"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-10">{type === 'ALL' ? t.common.all : type}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card p-6">
                                    <div className="flex gap-4">
                                        <div className="skeleton h-12 w-12 rounded-xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="skeleton h-6 w-full rounded mb-2" />
                                            <div className="skeleton h-4 w-3/4 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredResources.length > 0 ? (
                        <motion.div
                            layout
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredResources.map((res) => (
                                    <motion.div
                                        key={res.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="card card-hover p-6 flex flex-col group"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${res.fileType === 'PDF' ? 'bg-status-red/20 text-status-red' : 'bg-brand-600/20 text-brand-400'
                                                }`}>
                                                {res.fileType === 'PDF' ? (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`badge mb-2 ${res.fileType === 'PDF' ? 'badge-red' : 'badge-brand'}`}>
                                                    {res.fileType}
                                                </span>
                                                <h3 className="font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
                                                    {getLocalizedContent(res, 'title', lang)}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-1">
                                            {getLocalizedContent(res, 'description', lang)}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPreviewResource(res)}
                                                className="btn btn-secondary text-sm flex-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {lang === 'uz' ? "Ko'rish" : 'Preview'}
                                            </button>
                                            <a
                                                href={`/api/resources/${res.id}/download`}
                                                className="btn btn-primary text-sm flex-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                {t.common.download}
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-text-muted">{lang === 'uz' ? 'Hech qanday resurs topilmadi' : 'No resources found'}</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Preview Modal */}
            <AnimatePresence>
                {previewResource && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPreviewResource(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-dark-surface rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${previewResource.fileType === 'PDF' ? 'bg-status-red/20 text-status-red' : 'bg-brand-600/20 text-brand-400'}`}>
                                        {previewResource.fileType === 'PDF' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary">
                                            {getLocalizedContent(previewResource, 'title', lang)}
                                        </h3>
                                        <span className={`text-xs ${previewResource.fileType === 'PDF' ? 'text-status-red' : 'text-brand-400'}`}>
                                            {previewResource.fileType}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={previewResource.fileUrl}
                                        download
                                        className="btn btn-primary text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        {t.common.download}
                                    </a>
                                    <button
                                        onClick={() => setPreviewResource(null)}
                                        aria-label="Close preview"
                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 bg-gray-900">
                                {previewResource.fileType === 'PDF' ? (
                                    <iframe
                                        src={previewResource.fileUrl}
                                        className="w-full h-full"
                                        title={getLocalizedContent(previewResource, 'title', lang)}
                                    />
                                ) : (
                                    // Use Google Docs Viewer for DOCX
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewResource.fileUrl)}&embedded=true`}
                                        className="w-full h-full"
                                        title={getLocalizedContent(previewResource, 'title', lang)}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
