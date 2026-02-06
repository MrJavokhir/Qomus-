'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/admin/ToastProvider';

interface UserProfile {
    id: string;
    username: string;
    email: string | null;
    photoUrl: string | null;
    role: string;
}

export default function AdminSettings() {
    const { lang } = useI18n();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setUsername(data.user.username || '');
                setEmail(data.user.email || '');
                setPhotoUrl(data.user.photoUrl || '');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setPhotoUrl(data.url);
                showToast(lang === 'uz' ? 'Rasm yuklandi' : 'Photo uploaded');
            } else {
                showToast(lang === 'uz' ? 'Yuklashda xato' : 'Upload failed', 'error');
            }
        } catch {
            showToast('Upload error', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            showToast(lang === 'uz' ? 'Parollar mos kelmadi' : 'Passwords do not match', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email: email || null,
                    photoUrl: photoUrl || null,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined,
                }),
            });

            if (res.ok) {
                showToast(lang === 'uz' ? 'Muvaffaqiyatli saqlandi' : 'Saved successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                fetchProfile();
            } else {
                const data = await res.json();
                showToast(data.error || 'Error saving', 'error');
            }
        } catch {
            showToast('Error', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="heading-1 text-text-primary mb-1">
                    {lang === 'uz' ? 'Sozlamalar' : 'Settings'}
                </h1>
                <p className="text-text-secondary text-sm">
                    {lang === 'uz' ? 'Profil ma\'lumotlaringizni boshqaring' : 'Manage your profile settings'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo Section */}
                <div className="card p-6">
                    <h2 className="font-semibold text-text-primary mb-4">
                        {lang === 'uz' ? 'Profil rasmi' : 'Profile Photo'}
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden flex-shrink-0 border-2 border-white dark:border-white/10 shadow-lg">
                            {photoUrl ? (
                                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-400">
                                    {username[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                id="photo-upload"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                            <label
                                htmlFor="photo-upload"
                                className="btn btn-secondary text-sm cursor-pointer"
                            >
                                {lang === 'uz' ? 'Rasm yuklash' : 'Upload Photo'}
                            </label>
                            <p className="text-xs text-text-muted mt-2">
                                JPG, PNG or WebP (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Info Section */}
                <div className="card p-6">
                    <h2 className="font-semibold text-text-primary mb-4">
                        {lang === 'uz' ? 'Hisob ma\'lumotlari' : 'Account Information'}
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                {lang === 'uz' ? 'Foydalanuvchi nomi' : 'Username'}
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                {lang === 'uz' ? 'Email' : 'Email'}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="card p-6">
                    <h2 className="font-semibold text-text-primary mb-4">
                        {lang === 'uz' ? 'Parolni o\'zgartirish' : 'Change Password'}
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                {lang === 'uz' ? 'Joriy parol' : 'Current Password'}
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                    {lang === 'uz' ? 'Yangi parol' : 'New Password'}
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                    {lang === 'uz' ? 'Tasdiqlash' : 'Confirm Password'}
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">
                            {lang === 'uz'
                                ? 'Parolni o\'zgartirish uchun joriy parolni kiriting'
                                : 'Enter current password to change your password'}
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary px-8 py-3"
                    >
                        {submitting ? '...' : (lang === 'uz' ? 'Saqlash' : 'Save Changes')}
                    </button>
                </div>
            </form>
        </div>
    );
}
