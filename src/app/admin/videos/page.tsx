'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';
import SlideOver from '@/components/admin/SlideOver';
import { useToast } from '@/components/admin/ToastProvider';

interface Video {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    videoUrl: string;
    sourceType: 'UPLOAD' | 'URL';
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    createdAt: string;
}

export default function AdminVideos() {
    const { lang, t } = useI18n();
    const { showToast } = useToast();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/videos');
            if (res.ok) {
                const data = await res.json();
                setVideos(data.videos);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingVideo({
            titleUz: '',
            titleEn: '',
            descriptionUz: '',
            descriptionEn: '',
            videoUrl: '',
            sourceType: 'URL',
            durationSeconds: 0,
        });
        setIsFormOpen(true);
    };

    const handleEdit = (video: Video) => {
        setEditingVideo(video);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'uz' ? 'O\'chirishni tasdiqlaysizmi?' : 'Confirm delete?')) return;
        try {
            const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli o\'chirildi' : 'Deleted successfully');
                fetchVideos();
            } else {
                showToast('Error deleting video', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'video');

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    setEditingVideo({ ...editingVideo, videoUrl: data.url, sourceType: 'UPLOAD' });
                    showToast(lang === 'uz' ? 'Video yuklandi' : 'Video uploaded');
                } else {
                    const error = JSON.parse(xhr.responseText);
                    showToast(error.error || 'Upload failed', 'error');
                }
                setUploading(false);
                setUploadProgress(0);
            };

            xhr.onerror = () => {
                showToast('Upload failed', 'error');
                setUploading(false);
                setUploadProgress(0);
            };

            xhr.send(formData);
        } catch (err) {
            console.error(err);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editingVideo?.id ? 'PUT' : 'POST';
            const targetUrl = editingVideo?.id ? `/api/videos/${editingVideo.id}` : '/api/videos';
            const res = await fetch(targetUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingVideo),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                setIsFormOpen(false);
                fetchVideos();
            } else {
                showToast('Error saving video', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-1 text-text-primary mb-1">{lang === 'uz' ? 'Videolar' : 'Videos'}</h1>
                    <p className="text-text-secondary text-sm">
                        {lang === 'uz' ? 'Qisqa huquqiy videolarni boshqarish' : 'Manage short legal videos'}
                    </p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {lang === 'uz' ? 'Video qo\'shish' : 'Add Video'}
                </button>
            </div>

            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="table-header">
                            <tr className="table-header-row">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Video' : 'Video'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Nomi' : 'Title'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Davomiyligi' : 'Duration'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Sana' : 'Date'}</th>
                                <th className="py-4 px-6 text-right">{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {videos.map((video) => (
                                <tr key={video.id} className="table-row group">
                                    <td className="py-4 px-6">
                                        <div className="w-16 h-10 rounded-lg bg-dark-bg overflow-hidden relative group-hover:ring-2 ring-brand-600 transition-all">
                                            {getYoutubeId(video.videoUrl) ? (
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYoutubeId(video.videoUrl)}/mqdefault.jpg`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-brand-600/20 text-brand-400">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-text-primary text-sm line-clamp-1">{getLocalizedContent(video, 'title', lang)}</p>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-text-secondary">
                                        {video.durationSeconds ? `${Math.floor(video.durationSeconds / 60)}:${(video.durationSeconds % 60).toString().padStart(2, '0')}` : '--:--'}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-text-muted">
                                        {new Date(video.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(video)} className="action-btn">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(video.id)} className="action-btn-danger">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingVideo?.id ? (lang === 'uz' ? 'Videoni tahrirlash' : 'Edit Video') : (lang === 'uz' ? 'Yangi video' : 'Add Video')}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Nomi (UZ)' : 'Title (UZ)'}</label>
                            <input
                                type="text"
                                required
                                value={editingVideo?.titleUz || ''}
                                onChange={(e) => setEditingVideo({ ...editingVideo, titleUz: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Nomi (EN)' : 'Title (EN)'}</label>
                            <input
                                type="text"
                                required
                                value={editingVideo?.titleEn || ''}
                                onChange={(e) => setEditingVideo({ ...editingVideo, titleEn: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (UZ)' : 'Description (UZ)'}</label>
                        <textarea
                            rows={3}
                            value={editingVideo?.descriptionUz || ''}
                            onChange={(e) => setEditingVideo({ ...editingVideo, descriptionUz: e.target.value })}
                            className="input w-full py-3 h-24"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (EN)' : 'Description (EN)'}</label>
                        <textarea
                            rows={3}
                            value={editingVideo?.descriptionEn || ''}
                            onChange={(e) => setEditingVideo({ ...editingVideo, descriptionEn: e.target.value })}
                            className="input w-full py-3 h-24"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Video Manbasi' : 'Video Source'}</label>
                        <div className="flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setEditingVideo({ ...editingVideo, sourceType: 'URL', videoUrl: '' })}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editingVideo?.sourceType === 'URL' ? 'bg-brand-600 text-white shadow-glow' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {lang === 'uz' ? 'Havola (YouTube)' : 'URL (YouTube)'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingVideo({ ...editingVideo, sourceType: 'UPLOAD', videoUrl: '' })}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editingVideo?.sourceType === 'UPLOAD' ? 'bg-brand-600 text-white shadow-glow' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {lang === 'uz' ? 'Fayl Yuklash' : 'Upload File'}
                            </button>
                        </div>
                    </div>

                    {editingVideo?.sourceType === 'URL' ? (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Video havolasi (YouTube)' : 'Video URL (YouTube)'}</label>
                            <input
                                type="url"
                                required
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={editingVideo?.videoUrl || ''}
                                onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'MP4 Fayl' : 'MP4 File'}</label>
                            <div className="flex items-center gap-4">
                                <div className="file-display">
                                    {editingVideo?.videoUrl || (lang === 'uz' ? 'Fayl yuklanmagan' : 'No file uploaded')}
                                </div>
                                <input
                                    type="file"
                                    onChange={handleVideoUpload}
                                    className="hidden"
                                    id="video-upload"
                                    accept="video/mp4"
                                />
                                <label htmlFor="video-upload" className="btn btn-secondary text-xs cursor-pointer">
                                    {uploading ? `${uploadProgress}%` : (lang === 'uz' ? 'Tanlash' : 'Browse')}
                                </label>
                            </div>
                            {uploading && (
                                <div className="progress-bar mt-2">
                                    <motion.div
                                        className="h-full bg-brand-600"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}
                            <p className="text-[10px] text-text-muted mt-1">
                                {lang === 'uz' ? 'Ruxsat etilgan: MP4 (Maks 300MB)' : 'Allowed: MP4 (Max 300MB)'}
                            </p>
                        </div>
                    )}

                    {editingVideo?.videoUrl && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 ring-1 ring-brand-600/30">
                            {editingVideo.sourceType === 'URL' && getYoutubeId(editingVideo.videoUrl) ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(editingVideo.videoUrl)}`}
                                    title="Preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : editingVideo.sourceType === 'UPLOAD' ? (
                                <video
                                    src={editingVideo.videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            ) : null}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Davomiyligi (soniya)' : 'Duration (seconds)'}</label>
                            <input
                                type="number"
                                value={editingVideo?.durationSeconds || 0}
                                onChange={(e) => setEditingVideo({ ...editingVideo, durationSeconds: parseInt(e.target.value) })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary w-full py-4 text-base shadow-glow"
                        >
                            {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save Video')}
                        </button>
                    </div>
                </form>
            </SlideOver>
        </div>
    );
}
