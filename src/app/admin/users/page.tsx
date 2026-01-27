'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/admin/ToastProvider';

interface User {
    id: string;
    username: string;
    role: 'MEMBER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED';
    createdAt: string;
}

export default function AdminUsers() {
    const { lang, t } = useI18n();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, data: Partial<User>) => {
        setSubmitting(id);
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                fetchUsers();
            } else {
                const errData = await res.json();
                showToast(errData.error || 'Update failed', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        } finally {
            setSubmitting(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'uz' ? 'O\'chirishni tasdiqlaysizmi?' : 'Confirm delete?')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli o\'chirildi' : 'Deleted successfully');
                fetchUsers();
            } else {
                const errData = await res.json();
                showToast(errData.error || 'Delete failed', 'error');
            }
        } catch (err) {
            showToast('Error', 'error');
            console.error(err);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="heading-1 text-text-primary mb-1">{lang === 'uz' ? 'Foydalanuvchilar' : 'Users / Members'}</h1>
                <p className="text-text-secondary text-sm">
                    {lang === 'uz' ? 'Platforma foydalanuvchilarini boshqarish' : 'Manage platform users and roles'}
                </p>
            </div>

            <div className="card border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-text-muted text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                <th className="py-4 px-6">{lang === 'uz' ? 'Foydalanuvchi' : 'Username'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Rol' : 'Role'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Status' : 'Status'}</th>
                                <th className="py-4 px-6">{lang === 'uz' ? 'Sana' : 'Joined At'}</th>
                                <th className="py-4 px-6 text-right">{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
                                                {user.username[0]}
                                            </div>
                                            <span className="font-semibold text-text-primary text-sm">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <select
                                            value={user.role}
                                            disabled={submitting === user.id}
                                            onChange={(e) => handleUpdate(user.id, { role: e.target.value as any })}
                                            className="bg-dark-bg border border-white/10 rounded-lg py-1 px-2 text-xs text-text-primary outline-none focus:border-brand-600 appearance-none pr-6 font-medium cursor-pointer"
                                        >
                                            <option value="MEMBER">MEMBER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => handleUpdate(user.id, { status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}
                                            disabled={submitting === user.id}
                                            className={`badge ${user.status === 'ACTIVE' ? 'badge-green' : 'badge-red'} transition-opacity hover:opacity-80 active:scale-95`}
                                        >
                                            {user.status}
                                        </button>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-text-muted">
                                        {new Date(user.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US')}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={submitting === user.id}
                                            className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-status-red transition-colors"
                                            title="Delete User"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
