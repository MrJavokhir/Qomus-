'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';
import SlideOver from '@/components/admin/SlideOver';
import { useToast } from '@/components/admin/ToastProvider';

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
    startsAt: string;
    locationUz: string;
    locationEn: string;
    coverImageUrl: string | null;
    status: 'UPCOMING' | 'PAST';
    createdAt: string;
    createdById: string;
    registrationDeadlineAt: string | null;
    gallery: EventImage[];
}

export default function AdminEvents() {
    const { lang, t } = useI18n();
    const { showToast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'media'>('info');
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [uploadingMedia, setUploadingMedia] = useState<'cover' | 'gallery' | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [statusFilter]);

    const fetchEvents = async () => {
        try {
            const url = statusFilter ? `/api/events?status=${statusFilter}` : '/api/events';
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingEvent({
            titleUz: '',
            titleEn: '',
            descriptionUz: '',
            descriptionEn: '',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            locationUz: '',
            locationEn: '',
            status: 'UPCOMING',
            registrationDeadlineAt: null,
            gallery: [],
        });
        setActiveTab('info');
        setIsFormOpen(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent({
            ...event,
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            registrationDeadlineAt: event.registrationDeadlineAt,
        });
        setActiveTab('info');
        setIsFormOpen(true);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMedia('cover');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setEditingEvent({ ...editingEvent, coverImageUrl: data.url });
                showToast(lang === 'uz' ? 'Muqova yuklandi' : 'Cover image uploaded');
            }
        } catch (err) {
            console.error(err);
            showToast('Upload failed', 'error');
        } finally {
            setUploadingMedia(null);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingMedia('gallery');
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'image');
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    const newImage = {
                        id: crypto.randomUUID(),
                        imageUrl: data.url,
                        order: (editingEvent?.gallery?.length || 0)
                    };
                    setEditingEvent(prev => ({
                        ...prev,
                        gallery: [...(prev?.gallery || []), newImage]
                    }));
                }
            }
            showToast(lang === 'uz' ? 'Rasmlar qo\'shildi' : 'Images added to gallery');
        } catch (err) {
            console.error(err);
            showToast('Upload failed', 'error');
        } finally {
            setUploadingMedia(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'uz' ? 'O\'chirishni tasdiqlaysizmi?' : 'Confirm delete?')) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli o\'chirildi' : 'Deleted successfully');
                fetchEvents();
            } else {
                showToast('Error deleting event', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editingEvent?.id ? 'PUT' : 'POST';
            const targetUrl = editingEvent?.id ? `/api/events/${editingEvent.id}` : '/api/events';

            // Clean data for submission
            const submissionData = {
                ...editingEvent,
                gallery: editingEvent?.gallery?.map(img => ({
                    imageUrl: img.imageUrl,
                    order: img.order
                }))
            };

            const res = await fetch(targetUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                setIsFormOpen(false);
                fetchEvents();
            } else {
                showToast('Error saving event', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-1 text-text-primary mb-1">{lang === 'uz' ? 'Tadbirlar' : 'Events'}</h1>
                    <p className="text-text-secondary text-sm">
                        {lang === 'uz' ? 'Seminarlar va musobaqalarni boshqarish' : 'Manage legal seminars and competitions'}
                    </p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {lang === 'uz' ? 'Tadbir qo\'shish' : 'Add Event'}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-text-primary outline-none focus:border-brand-600 transition-all font-medium"
                >
                    <option value="">All Status</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="PAST">Past</option>
                </select>
            </div>

            <div className="card border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-text-muted text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Nomi' : 'Title'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Sana' : 'Date'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Joy' : 'Location'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Status' : 'Status'}</th>
                                <th className="py-4 px-6 text-right">{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-text-primary text-sm line-clamp-1">{getLocalizedContent(event, 'title', lang)}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm text-text-secondary">{new Date(event.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}</p>
                                        <p className="text-xs text-text-muted">{event.time}</p>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-text-secondary line-clamp-1">{lang === 'uz' ? event.locationUz : event.locationEn}</td>
                                    <td className="py-4 px-6">
                                        <span className={`badge ${event.status === 'UPCOMING' ? 'badge-green' : 'badge-red'}`}>{event.status}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(event)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-brand-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-status-red transition-colors">
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
                title={editingEvent?.id ? (lang === 'uz' ? 'Tadbirni tahrirlash' : 'Edit Event') : (lang === 'uz' ? 'Yangi tadbir' : 'Add Event')}
            >
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'info' ? 'bg-brand-600 text-white shadow-glow' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        {lang === 'uz' ? 'Ma\'lumot' : 'Information'}
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'media' ? 'bg-brand-600 text-white shadow-glow' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        {lang === 'uz' ? 'Media' : 'Media'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'info' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Sarlavha (UZ)' : 'Title (UZ)'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingEvent?.titleUz || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, titleUz: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Sarlavha (EN)' : 'Title (EN)'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingEvent?.titleEn || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, titleEn: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (UZ)' : 'Description (UZ)'}</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={editingEvent?.descriptionUz || ''}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, descriptionUz: e.target.value })}
                                    className="input w-full py-3 h-32"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (EN)' : 'Description (EN)'}</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={editingEvent?.descriptionEn || ''}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, descriptionEn: e.target.value })}
                                    className="input w-full py-3 h-32"
                                />
                            </div>

                            <div className="space-y-4 rounded-xl bg-brand-600/5 border border-brand-600/20 p-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                                        {lang === 'uz' ? 'Vaqt va Sana' : 'Date and Time'}
                                    </label>
                                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        GMT+5 (Tashkent)
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <input
                                            type="date"
                                            required
                                            value={editingEvent?.date || ''}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <input
                                            type="time"
                                            required
                                            value={editingEvent?.time || ''}
                                            onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Holat' : 'Status'}</label>
                                <select
                                    value={editingEvent?.status || 'UPCOMING'}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="UPCOMING">{lang === 'uz' ? 'Kutilmoqda' : 'Upcoming'}</option>
                                    <option value="PAST">{lang === 'uz' ? 'O\'tib ketgan' : 'Past'}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Manzil (UZ)' : 'Location (UZ)'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingEvent?.locationUz || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, locationUz: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Manzil (EN)' : 'Location (EN)'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingEvent?.locationEn || ''}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, locationEn: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-8">
                            {/* Cover Image */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Muqova Rasmi' : 'Cover Image'}</label>
                                <div className="aspect-video w-full rounded-2xl bg-white/5 border-2 border-dashed border-white/10 overflow-hidden relative group hover:border-brand-600/50 transition-all">
                                    {editingEvent?.coverImageUrl ? (
                                        <>
                                            <img src={editingEvent.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label htmlFor="cover-upload" className="btn btn-primary btn-sm cursor-pointer">
                                                    {lang === 'uz' ? 'O\'zgartirish' : 'Change'}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingEvent({ ...editingEvent, coverImageUrl: null })}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    {lang === 'uz' ? 'O\'chirish' : 'Remove'}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label htmlFor="cover-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-colors">
                                            <svg className="w-8 h-8 text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <p className="text-xs text-text-muted font-bold">{lang === 'uz' ? 'Yuklash' : 'Upload Image'}</p>
                                        </label>
                                    )}
                                    <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={!!uploadingMedia} />
                                    {uploadingMedia === 'cover' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Galereya' : 'Gallery'}</label>
                                    <label htmlFor="gallery-upload" className={`btn btn-secondary btn-sm cursor-pointer ${uploadingMedia === 'gallery' ? 'opacity-50' : ''}`}>
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        {lang === 'uz' ? 'Qo\'shish' : 'Add Photos'}
                                    </label>
                                    <input type="file" id="gallery-upload" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} disabled={!!uploadingMedia} />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {(editingEvent?.gallery || []).map((img, idx) => (
                                        <div key={img.id} className="aspect-square rounded-xl bg-white/5 overflow-hidden relative group">
                                            <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                title={lang === 'uz' ? 'O\'chirish' : 'Remove'}
                                                onClick={() => {
                                                    if (editingEvent) {
                                                        setEditingEvent({
                                                            ...editingEvent,
                                                            gallery: editingEvent.gallery?.filter(g => g.id !== img.id)
                                                        });
                                                    }
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-status-red rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {uploadingMedia === 'gallery' && (
                                        <div className="aspect-square rounded-xl bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                                            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting || !!uploadingMedia}
                            className="btn btn-primary w-full py-4 text-base shadow-glow"
                        >
                            {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save Event')}
                        </button>
                    </div>
                </form>
            </SlideOver>
        </div>
    );
}
