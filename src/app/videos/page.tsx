'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useI18n, getLocalizedContent } from '@/i18n';

interface Video {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    videoUrl: string;
    durationSeconds: number;
    thumbnailUrl: string;
    createdAt: string;
}

export default function VideosPage() {
    const { t, lang } = useI18n();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch('/api/videos');
                if (res.ok) {
                    const data = await res.json();
                    setVideos(data.videos || []);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                            {t.nav.videos}
                        </h1>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {lang === 'uz'
                                ? "Huquqiy mavzularda qisqa va tushunarli video darsliklar."
                                : "Brief and clear video tutorials on legal topics."}
                        </p>
                    </motion.div>

                    {/* Video Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card overflow-hidden">
                                    <div className="skeleton h-48 w-full" />
                                    <div className="p-5">
                                        <div className="skeleton h-6 w-full rounded mb-2" />
                                        <div className="skeleton h-4 w-3/4 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((video, i) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="card group cursor-pointer overflow-hidden border border-white/5 bg-dark-card hover:border-brand-600/30 transition-all duration-300 shadow-xl"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    <div className="relative aspect-video bg-dark-surface overflow-hidden">
                                        {/* Video Thumbnail Placeholder/Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                            </svg>
                                        </div>

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Duration Badge */}
                                        {video.durationSeconds && (
                                            <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-xs font-medium text-white">
                                                {formatDuration(video.durationSeconds)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-semibold text-text-primary mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                                            {getLocalizedContent(video, 'title', lang)}
                                        </h3>
                                        <p className="text-sm text-text-secondary line-clamp-2">
                                            {getLocalizedContent(video, 'description', lang)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-text-muted">{lang === 'uz' ? 'Videolar topilmadi' : 'No videos found'}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVideo(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-dark-surface rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <div className="aspect-video bg-black flex items-center justify-center relative">
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Video Player */}
                                {(() => {
                                    const url = selectedVideo.videoUrl;
                                    // Detect YouTube
                                    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                    if (youtubeMatch) {
                                        return (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`}
                                                className="w-full h-full"
                                                title={getLocalizedContent(selectedVideo, 'title', lang)}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    }
                                    // Detect Vimeo
                                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                    if (vimeoMatch) {
                                        return (
                                            <iframe
                                                src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`}
                                                className="w-full h-full"
                                                title={getLocalizedContent(selectedVideo, 'title', lang)}
                                                allow="autoplay; fullscreen; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    }
                                    // Direct video file (MP4, WebM, etc.)
                                    return (
                                        <video
                                            src={url}
                                            controls
                                            autoPlay
                                            preload="metadata"
                                            className="w-full h-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLVideoElement;
                                                target.style.display = 'none';
                                                target.parentElement!.innerHTML = `
                                                    <div class="text-center p-8">
                                                        <div class="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
                                                            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                                            </svg>
                                                        </div>
                                                        <p class="text-red-400 font-medium">${lang === 'uz' ? 'Video mavjud emas' : 'Video unavailable'}</p>
                                                        <p class="text-text-muted text-sm mt-2">${lang === 'uz' ? 'Iltimos, keyinroq qayta urinib ko\'ring' : 'Please try again later'}</p>
                                                    </div>
                                                `;
                                            }}
                                        >
                                            <source src={url} type="video/mp4" />
                                            <source src={url} type="video/webm" />
                                            {lang === 'uz' ? 'Brauzeringiz videoni qo\'llab-quvvatlamaydi' : 'Your browser does not support video playback'}
                                        </video>
                                    );
                                })()}
                            </div>

                            <div className="p-6 md:p-8">
                                <h2 className="heading-2 text-text-primary mb-3">
                                    {getLocalizedContent(selectedVideo, 'title', lang)}
                                </h2>
                                <p className="text-text-secondary">
                                    {getLocalizedContent(selectedVideo, 'description', lang)}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
