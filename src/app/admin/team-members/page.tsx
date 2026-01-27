'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import SlideOver from '@/components/admin/SlideOver';
import { useToast } from '@/components/admin/ToastProvider';

interface TeamMember {
    id: string;
    fullName: string;
    positionUz: string;
    positionEn: string;
    bioUz: string;
    bioEn: string;
    photoUrl: string;
    order: number;
    status: 'VISIBLE' | 'HIDDEN';
    telegramUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
}

export default function AdminTeam() {
    const { lang, t } = useI18n();
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Team Section State
    const [sectionEditing, setSectionEditing] = useState(false);
    const [teamSection, setTeamSection] = useState({
        titleUz: 'Bizning jamoa',
        titleEn: 'Our Team',
        bodyUz: 'Qomus platformasi ortidagi professional jamoa bilan tanishing',
        bodyEn: 'Meet the professional team behind the Qomus platform',
    });

    useEffect(() => {
        fetchMembers();
        fetchTeamSection();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/team-members');
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamSection = async () => {
        try {
            const res = await fetch('/api/site-sections/team_section');
            if (res.ok) {
                const data = await res.json();
                if (data.section) {
                    setTeamSection(data.section);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSection = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/site-sections/team_section', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamSection),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Bo\'lim saqlandi' : 'Section saved');
                setSectionEditing(false);
            } else {
                showToast('Error saving section', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreate = () => {
        setEditingMember({
            fullName: '',
            positionUz: '',
            positionEn: '',
            bioUz: '',
            bioEn: '',
            photoUrl: '',
            order: 0,
            status: 'VISIBLE',
            telegramUrl: '',
            linkedinUrl: '',
            instagramUrl: '',
        });
        setIsFormOpen(true);
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'uz' ? 'O\'chirishni tasdiqlaysizmi?' : 'Confirm delete?')) return;
        try {
            const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli o\'chirildi' : 'Deleted successfully');
                fetchMembers();
            } else {
                showToast(lang === 'uz' ? 'Xatolik yuz berdi' : 'Error deleting member', 'error');
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
            const method = editingMember?.id ? 'PUT' : 'POST';
            const url = editingMember?.id ? `/api/team-members/${editingMember.id}` : '/api/team-members';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingMember),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                setIsFormOpen(false);
                fetchMembers();
            } else {
                showToast('Error saving member', 'error');
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
                    <h1 className="heading-1 text-text-primary mb-1">{lang === 'uz' ? 'Jamoa a\'zolari' : 'Team Members'}</h1>
                    <p className="text-text-secondary text-sm">
                        {lang === 'uz' ? 'Jamoani boshqarish' : 'Manage your team members'}
                    </p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {lang === 'uz' ? 'Qo\'shish' : 'Add Member'}
                </button>
            </div>

            {/* Team Section Editor */}
            <div className="card border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-text-primary">
                        {lang === 'uz' ? "Bo'lim matni" : 'Section Text'}
                    </h2>
                    {!sectionEditing ? (
                        <button
                            onClick={() => setSectionEditing(true)}
                            className="btn btn-secondary text-xs"
                        >
                            {lang === 'uz' ? 'Tahrirlash' : 'Edit'}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSectionEditing(false)}
                                className="btn btn-secondary text-xs"
                            >
                                {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleSaveSection}
                                disabled={submitting}
                                className="btn btn-primary text-xs"
                            >
                                {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save')}
                            </button>
                        </div>
                    )}
                </div>

                {sectionEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Title (UZ)</label>
                                <input
                                    type="text"
                                    value={teamSection.titleUz}
                                    onChange={(e) => setTeamSection({ ...teamSection, titleUz: e.target.value })}
                                    className="input w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description (UZ)</label>
                                <textarea
                                    value={teamSection.bodyUz}
                                    onChange={(e) => setTeamSection({ ...teamSection, bodyUz: e.target.value })}
                                    className="input w-full mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Title (EN)</label>
                                <input
                                    type="text"
                                    value={teamSection.titleEn}
                                    onChange={(e) => setTeamSection({ ...teamSection, titleEn: e.target.value })}
                                    className="input w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description (EN)</label>
                                <textarea
                                    value={teamSection.bodyEn}
                                    onChange={(e) => setTeamSection({ ...teamSection, bodyEn: e.target.value })}
                                    className="input w-full mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-text-muted mb-1">UZ</p>
                            <p className="font-medium text-text-primary">{teamSection.titleUz}</p>
                            <p className="text-sm text-text-secondary mt-1">{teamSection.bodyUz}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted mb-1">EN</p>
                            <p className="font-medium text-text-primary">{teamSection.titleEn}</p>
                            <p className="text-sm text-text-secondary mt-1">{teamSection.bodyEn}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="card border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-text-muted text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Rasm' : 'Photo'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'F.I.O' : 'Full Name'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Lavozim' : 'Position'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Tartib' : 'Order'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Status' : 'Status'}</th>
                                <th className="py-4 px-6 text-right">{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                            {member.photoUrl ? (
                                                <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold">{member.fullName[0]}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-text-primary text-sm">{member.fullName}</td>
                                    <td className="py-4 px-6 text-xs text-text-secondary">{lang === 'uz' ? member.positionUz : member.positionEn}</td>
                                    <td className="py-4 px-6 text-sm text-text-muted">{member.order}</td>
                                    <td className="py-4 px-6">
                                        <span className={`badge ${member.status === 'VISIBLE' ? 'badge-green' : 'badge-yellow'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(member)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-brand-400 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-status-red transition-colors">
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
                title={editingMember?.id ? (lang === 'uz' ? 'Tahrirlash' : 'Edit Member') : (lang === 'uz' ? 'Yangi a\'zo' : 'Add Member')}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'F.I.O' : 'Full Name'}</label>
                        <input
                            type="text"
                            required
                            value={editingMember?.fullName || ''}
                            onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                            className="input w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Lavozim (UZ)' : 'Position (UZ)'}</label>
                            <input
                                type="text"
                                required
                                value={editingMember?.positionUz || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, positionUz: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Lavozim (EN)' : 'Position (EN)'}</label>
                            <input
                                type="text"
                                required
                                value={editingMember?.positionEn || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, positionEn: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Rasm yuklash' : 'Upload Photo'}</label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                {editingMember?.photoUrl && (
                                    <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                        <img
                                            src={editingMember.photoUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        id="photo-upload"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('type', 'image');

                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setEditingMember({ ...editingMember, photoUrl: data.url });
                                                    showToast(lang === 'uz' ? 'Rasm yuklandi' : 'Photo uploaded');
                                                } else {
                                                    showToast(lang === 'uz' ? 'Yuklashda xato' : 'Upload failed', 'error');
                                                }
                                            } catch {
                                                showToast('Upload error', 'error');
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {editingMember?.photoUrl ? (lang === 'uz' ? 'Rasmni almashtirish' : 'Replace Photo') : (lang === 'uz' ? 'Rasm tanlash' : 'Choose Photo')}
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted">
                                {lang === 'uz' ? 'JPG, PNG yoki WebP (max 5MB)' : 'JPG, PNG or WebP (max 5MB)'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Tartib' : 'Order'}</label>
                            <input
                                type="number"
                                value={editingMember?.order || 0}
                                onChange={(e) => setEditingMember({ ...editingMember, order: parseInt(e.target.value) })}
                                className="input w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</label>
                            <select
                                value={editingMember?.status || 'VISIBLE'}
                                onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                                className="input w-full bg-dark-bg"
                            >
                                <option value="VISIBLE">Visible</option>
                                <option value="HIDDEN">Hidden</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{lang === 'uz' ? 'Ijtimoiy tarmoqlar' : 'Social Links'}</p>
                        <div className="space-y-3">
                            <input
                                type="url"
                                placeholder="Telegram URL"
                                value={editingMember?.telegramUrl || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, telegramUrl: e.target.value })}
                                className="input w-full text-xs"
                            />
                            <input
                                type="url"
                                placeholder="LinkedIn URL"
                                value={editingMember?.linkedinUrl || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, linkedinUrl: e.target.value })}
                                className="input w-full text-xs"
                            />
                            <input
                                type="url"
                                placeholder="Instagram URL"
                                value={editingMember?.instagramUrl || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, instagramUrl: e.target.value })}
                                className="input w-full text-xs"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary w-full py-4 text-base shadow-glow"
                        >
                            {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save Member')}
                        </button>
                    </div>
                </form>
            </SlideOver>
        </div>
    );
}
