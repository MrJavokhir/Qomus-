'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';
import SlideOver from '@/components/admin/SlideOver';
import { useToast } from '@/components/admin/ToastProvider';

interface Resource {
    id: string;
    titleUz: string;
    titleEn: string;
    descriptionUz: string;
    descriptionEn: string;
    fileUrl: string;
    fileType: 'PDF' | 'DOCX' | 'OTHER';
    tags: string; // JSON string
    createdAt: string;
}

export default function AdminResources() {
    const { lang, t } = useI18n();
    const { showToast } = useToast();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await fetch('/api/resources');
            if (res.ok) {
                const data = await res.json();
                setResources(data.resources);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingResource({
            titleUz: '',
            titleEn: '',
            descriptionUz: '',
            descriptionEn: '',
            fileUrl: '',
            fileType: 'PDF',
            tags: '[]',
        });
        setIsFormOpen(true);
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'uz' ? 'O\'chirishni tasdiqlaysizmi?' : 'Confirm delete?')) return;
        try {
            const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli o\'chirildi' : 'Deleted successfully');
                fetchResources();
            } else {
                showToast('Error deleting resource', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        }
    };

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'resource');

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
                    const fileExt = data.name.split('.').pop()?.toUpperCase();
                    const detectedType = fileExt === 'PDF' ? 'PDF' : fileExt === 'DOCX' ? 'DOCX' : 'OTHER';
                    setEditingResource({ ...editingResource, fileUrl: data.url, fileType: detectedType as any });
                    showToast(lang === 'uz' ? 'Fayl yuklandi' : 'File uploaded');
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
            const method = editingResource?.id ? 'PUT' : 'POST';
            const targetUrl = editingResource?.id ? `/api/resources/${editingResource.id}` : '/api/resources';

            const payload = {
                ...editingResource,
                tags: typeof editingResource?.tags === 'string' ? JSON.parse(editingResource.tags) : editingResource?.tags
            };

            const res = await fetch(targetUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                setIsFormOpen(false);
                fetchResources();
            } else {
                showToast('Error saving resource', 'error');
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
                    <h1 className="heading-1 text-text-primary mb-1">{lang === 'uz' ? 'Resurslar' : 'Resources'}</h1>
                    <p className="text-text-secondary text-sm">
                        {lang === 'uz' ? 'Hujjatlarni boshqarish' : 'Manage legal documents and resources'}
                    </p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {lang === 'uz' ? 'Resurs qo\'shish' : 'Add Resource'}
                </button>
            </div>

            <div className="table-container">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="table-header">
                            <tr className="table-header-row">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Fayl' : 'File'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Nomi' : 'Title'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Turi' : 'Type'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Sana' : 'Date'}</th>
                                <th className="py-4 px-6 text-right">{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {resources.map((resource) => (
                                <tr key={resource.id} className="table-row group">
                                    <td className="py-4 px-6">
                                        <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center text-brand-400">
                                            {resource.fileType === 'PDF' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-semibold text-text-primary text-sm line-clamp-1">{getLocalizedContent(resource, 'title', lang)}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`badge ${resource.fileType === 'PDF' ? 'badge-red' : 'badge-brand'}`}>{resource.fileType}</span>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-text-muted">
                                        {new Date(resource.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={resource.fileUrl} download className="action-btn" title="Download">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                            <button onClick={() => handleEdit(resource)} className="action-btn">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(resource.id)} className="action-btn-danger">
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
                title={editingResource?.id ? (lang === 'uz' ? 'Resursni tahrirlash' : 'Edit Resource') : (lang === 'uz' ? 'Yangi resurs' : 'Add Resource')}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Nomi (UZ)' : 'Title (UZ)'}</label>
                            <input
                                type="text"
                                required
                                value={editingResource?.titleUz || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, titleUz: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Nomi (EN)' : 'Title (EN)'}</label>
                            <input
                                type="text"
                                required
                                value={editingResource?.titleEn || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, titleEn: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (UZ)' : 'Description (UZ)'}</label>
                        <textarea
                            rows={3}
                            value={editingResource?.descriptionUz || ''}
                            onChange={(e) => setEditingResource({ ...editingResource, descriptionUz: e.target.value })}
                            className="input w-full py-3 h-24"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tavsif (EN)' : 'Description (EN)'}</label>
                        <textarea
                            rows={3}
                            value={editingResource?.descriptionEn || ''}
                            onChange={(e) => setEditingResource({ ...editingResource, descriptionEn: e.target.value })}
                            className="input w-full py-3 h-24"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Fayl' : 'File'}</label>
                        <div className="flex items-center gap-4">
                            <div className="file-display">
                                {editingResource?.fileUrl || (lang === 'uz' ? 'Fayl yuklanmagan' : 'No file uploaded')}
                            </div>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                                accept=".pdf,.docx"
                            />
                            <label htmlFor="file-upload" className="btn btn-secondary text-xs cursor-pointer">
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
                            {lang === 'uz' ? 'Ruxsat etilgan: PDF, DOCX (Maks 50MB)' : 'Allowed: PDF, DOCX (Max 50MB)'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">File Type</label>
                            <select
                                value={editingResource?.fileType || 'PDF'}
                                onChange={(e) => setEditingResource({ ...editingResource, fileType: e.target.value as any })}
                                className="input"
                            >
                                <option value="PDF">PDF</option>
                                <option value="DOCX">DOCX</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="btn btn-primary w-full py-4 text-base shadow-glow"
                        >
                            {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save Resource')}
                        </button>
                    </div>
                </form>
            </SlideOver>
        </div>
    );
}
