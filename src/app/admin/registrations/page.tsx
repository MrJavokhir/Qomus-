'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, getLocalizedContent } from '@/i18n';
import { useToast } from '@/components/admin/ToastProvider';

interface Registration {
    id: string;
    teamName: string;
    membersCount: number;
    ratingStatus: 'GREEN' | 'YELLOW' | 'RED';
    notes: string | null;
    decisionStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt: string;
    event: {
        id: string;
        titleUz: string;
        titleEn: string;
        date: string;
    };
    leader: {
        id: string;
        username: string;
    };
}

export default function AdminRegistrations() {
    const { t, lang } = useI18n();
    const { showToast } = useToast();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState<'GREEN' | 'YELLOW' | 'RED'>('YELLOW');
    const [editNotes, setEditNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('decisionStatus', statusFilter);

            const res = await fetch(`/api/registrations?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data.registrations || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [statusFilter]);

    const handleUpdateRating = async (id: string) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/registrations/${id}/rating`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ratingStatus: editRating, notes: editNotes }),
            });

            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                const data = await res.json();
                setRegistrations(registrations.map((r) =>
                    r.id === id ? { ...r, ...data.registration } : r
                ));
                setEditingId(null);
            } else {
                showToast('Error updating rating', 'error');
            }
        } catch (error) {
            showToast('Error', 'error');
            console.error('Error updating rating:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDecision = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
        if (!confirm(status === 'ACCEPTED' ? 'Accept this team?' : 'Decline this team?')) return;

        try {
            const res = await fetch(`/api/registrations/${id}/decision`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decisionStatus: status }),
            });

            if (res.ok) {
                showToast(status === 'ACCEPTED' ? 'Team accepted' : 'Team declined');
                const data = await res.json();
                setRegistrations(registrations.map((r) =>
                    r.id === id ? { ...r, decisionStatus: status } : r
                ));
            } else {
                showToast('Error updating status', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error', 'error');
        }
    };

    const getRatingBadge = (status: string) => {
        switch (status) {
            case 'GREEN': return <span className="badge badge-green">{t.rating.green}</span>;
            case 'YELLOW': return <span className="badge badge-yellow">{t.rating.yellow}</span>;
            case 'RED': return <span className="badge badge-red">{t.rating.red}</span>;
            default: return null;
        }
    };

    if (loading) return null; // Parent layout handles loading state

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="heading-1 text-text-primary mb-1">{t.admin.registrations}</h1>
                    <p className="text-text-secondary text-sm">
                        {lang === 'uz' ? 'Jami kelib tushgan jamoa arizalari ro\'yxati' : 'Total list of team applications received'}
                    </p>
                </div>
                <a
                    href="/api/registrations/export.csv"
                    className="btn btn-secondary text-sm group"
                >
                    <svg className="w-4 h-4 mr-2 text-text-muted group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t.admin.export} CSV
                </a>
            </motion.div>

            {/* Filter */}
            <div className="flex gap-2">
                {['', 'PENDING', 'ACCEPTED', 'DECLINED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-brand-600 text-white'
                                : 'bg-white/5 text-text-muted hover:bg-white/10'
                            }`}
                    >
                        {status || 'All'}
                    </button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-white/10 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-text-muted text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Jamoa' : 'Team'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Tadbir' : 'Event'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Soni' : 'Count'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Sardor' : 'Leader'}</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6">{t.admin.rating}</th>
                                <th className="py-4 px-6 text-right">{t.admin.edit}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {registrations.map((reg) => (
                                    <motion.tr
                                        key={reg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-text-primary text-sm">{reg.teamName}</p>
                                            <p className="text-[10px] text-text-muted mt-0.5">{new Date(reg.createdAt).toLocaleString(lang === 'uz' ? 'uz-UZ' : 'en-US')}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-text-secondary line-clamp-1">{getLocalizedContent(reg.event, 'title', lang)}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-text-secondary">{reg.membersCount}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-[10px] font-bold">
                                                    {reg.leader.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-text-secondary">{reg.leader.username}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${reg.decisionStatus === 'ACCEPTED' ? 'bg-status-green/20 text-status-green' :
                                                    reg.decisionStatus === 'DECLINED' ? 'bg-status-red/20 text-status-red' :
                                                        'bg-status-yellow/20 text-status-yellow'
                                                }`}>
                                                {reg.decisionStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {editingId === reg.id ? (
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    <select
                                                        value={editRating}
                                                        onChange={(e) => setEditRating(e.target.value as any)}
                                                        className="bg-dark-bg border border-white/10 rounded-lg py-1 px-2 text-xs text-text-primary outline-none focus:border-brand-600"
                                                    >
                                                        <option value="GREEN">{t.rating.green}</option>
                                                        <option value="YELLOW">{t.rating.yellow}</option>
                                                        <option value="RED">{t.rating.red}</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Notes..."
                                                        value={editNotes}
                                                        onChange={(e) => setEditNotes(e.target.value)}
                                                        className="bg-dark-bg border border-white/10 rounded-lg py-1 px-2 text-xs text-text-primary outline-none focus:border-brand-600"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    {getRatingBadge(reg.ratingStatus)}
                                                    {reg.notes && <p className="text-[10px] text-text-muted mt-1 italic line-clamp-1">"{reg.notes}"</p>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {editingId === reg.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateRating(reg.id)}
                                                        disabled={submitting}
                                                        className="w-8 h-8 rounded-lg bg-status-green/20 text-status-green flex items-center justify-center hover:bg-status-green/30 transition-all"
                                                    >
                                                        {submitting ? '...' : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="w-8 h-8 rounded-lg bg-white/5 text-text-muted flex items-center justify-center hover:bg-white/10 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                    </button>
                                    </div>
                                ) : (
                                <div className="flex justify-end gap-2">
                                    {reg.decisionStatus === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleDecision(reg.id, 'ACCEPTED')}
                                                className="w-8 h-8 rounded-lg bg-status-green/20 text-status-green flex items-center justify-center hover:bg-status-green/30 transition-all"
                                                title="Accept"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDecision(reg.id, 'DECLINED')}
                                                className="w-8 h-8 rounded-lg bg-status-red/20 text-status-red flex items-center justify-center hover:bg-status-red/30 transition-all"
                                                title="Decline"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setEditingId(reg.id);
                                            setEditRating(reg.ratingStatus);
                                            setEditNotes(reg.notes || '');
                                        }}
                                        className="w-8 h-8 rounded-lg bg-white/5 text-text-muted flex items-center justify-center hover:bg-brand-600/20 hover:text-brand-400 transition-all"
                                        title="Edit Rating"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                            )}
                            </td>
                        </motion.tr>
                                ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
            </motion.div >
        </div >
    );
}
