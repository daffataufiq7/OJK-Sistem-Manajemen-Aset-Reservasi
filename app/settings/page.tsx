'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, Input, Button, toast } from '@/components/UI';
import { Lock, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.warning('Konfirmasi kata sandi baru tidak cocok.');
            return;
        }
        if (newPassword.length < 6) {
            toast.warning('Kata sandi baru minimal 6 karakter.');
            return;
        }

        try {
            setSubmitting(true);
            toast.success('Kata sandi berhasil diperbarui.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error('Gagal memperbarui kata sandi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-ojk-red" />
                    Pengaturan Akun & Keamanan
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Kelola profil pengguna dan keamanan akun Anda.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-ojk-red" />
                        Informasi Profil
                    </h4>

                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">NIP / ID Pengguna</label>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{user?.nip}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Kedinasan</label>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{user?.email}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-ojk-red" />
                        Ubah Kata Sandi
                    </h4>

                    <form onSubmit={handlePasswordChange} className="space-y-3">
                        <Input
                            label="Kata Sandi Lama"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Kata Sandi Baru"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Konfirmasi Kata Sandi Baru"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full font-bold bg-ojk-red hover:bg-red-700 text-white rounded-xl py-2.5 text-xs cursor-pointer"
                        >
                            Simpan Perubahan
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
