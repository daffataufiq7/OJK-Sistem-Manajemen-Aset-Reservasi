'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Dialog, toast } from '@/components/UI';
import {
    Lock,
    User as UserIcon,
    Eye,
    EyeOff,
    Sun,
    Moon,
    Info,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showAboutModal, setShowAboutModal] = useState(false);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const stored = localStorage.getItem('ojk_theme') as 'light' | 'dark' | null;
        if (stored) setTheme(stored);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('ojk_theme', theme);
    }, [theme]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) {
            toast.error('Silakan masukkan NIP/ID Pengguna dan Password.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(identifier, password);
            toast.success(`Selamat datang kembali, ${user.name}!`);
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login gagal. Periksa kembali NIP/Email dan Password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden font-sans select-none">

            {/* ── VIDEO BACKGROUND (full screen) ── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
            >
                <source src="/vidio ojk.mp4" type="video/mp4" />
            </video>

            {/* ── OVERLAY GRADIENT (darkens video for readability) ── */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30 z-10" />

            {/* ── TOP BAR ── */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
                <span className="text-[11px] font-extrabold text-white/70 tracking-wider uppercase">
                    Otoritas Jasa Keuangan &bull; Regional Jawa Barat
                </span>

                <button
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
                    title="Ubah Tema"
                >
                    {theme === 'light' ? (
                        <>
                            <Moon className="w-4 h-4" />
                            <span className="hidden sm:inline">Gelap</span>
                        </>
                    ) : (
                        <>
                            <Sun className="w-4 h-4 text-amber-400" />
                            <span className="hidden sm:inline">Terang</span>
                        </>
                    )}
                </button>
            </div>

            {/* ── LOGIN CARD ── */}
            <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-24">
                <div className="w-full max-w-sm bg-white/10 dark:bg-slate-950/60 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6">

                    {/* Logo & Title */}
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <img src="/logo ojk.png" alt="Logo OJK" className="h-14 w-auto object-contain drop-shadow-lg" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-black text-white tracking-tight leading-tight">
                                Otentikasi Sistem
                            </h1>
                            <p className="text-[11px] font-semibold text-white/60 tracking-wide">
                                SIMA-R · Sistem Manajemen Aset & Reservasi OJK
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                label="ID Pengguna / NIP"
                                placeholder="Masukkan ID Pengguna atau NIP"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="pl-11 text-xs py-3 bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/40"
                                required
                            />
                            <UserIcon className="absolute bottom-3.5 left-4 w-4 h-4 text-white/50" />
                        </div>

                        <div className="relative">
                            <Input
                                label="Kata Sandi"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukkan kata sandi"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-11 pr-11 text-xs py-3 bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/40"
                                required
                            />
                            <Lock className="absolute bottom-3.5 left-4 w-4 h-4 text-white/50" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute bottom-3.5 right-4 text-white/50 hover:text-white cursor-pointer"
                                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center text-white/70 font-semibold cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="mr-2 rounded border-white/30 text-ojk-red focus:ring-ojk-red w-3.5 h-3.5"
                                />
                                Ingat saya
                            </label>
                            <a
                                href="#forgot"
                                className="text-red-400 hover:text-red-300 font-bold"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toast.info('Silakan hubungi Super Admin Divisi Umum OJK Jawa Barat untuk bantuan reset password.');
                                }}
                            >
                                Lupa kata sandi?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3.5 font-extrabold rounded-xl text-sm bg-[#A60C25] hover:bg-[#8B091E] text-white shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Memproses...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Masuk ke Portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* About Button */}
                    <button
                        type="button"
                        onClick={() => setShowAboutModal(true)}
                        className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md"
                    >
                        <Info className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Tentang Aplikasi & Tim Pengembang</span>
                    </button>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
                <p className="text-[10px] font-semibold text-white/40">
                    &copy; 2026 Otoritas Jasa Keuangan. All rights reserved.
                </p>
            </div>

            {/* ── ABOUT DIALOG ── */}
            <Dialog
                isOpen={showAboutModal}
                onClose={() => setShowAboutModal(false)}
                title="Tentang Aplikasi & Tim Pengembang"
                size="md"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center text-center space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <img src="/logo ojk.png" alt="Logo OJK" className="h-14 w-auto object-contain" />
                        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white tracking-tight">
                            Sistem Manajemen Aset & Reservasi
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Kantor Regional Jawa Barat
                        </span>
                    </div>

                    <div className="space-y-2 text-xs font-medium text-slate-650 dark:text-slate-350 leading-relaxed text-justify">
                        <p>
                            <strong>Sistem Manajemen Aset & Reservasi (SIMA-R)</strong> adalah platform manajemen internal berbasis web yang dirancang untuk mengotomatiskan proses pengajuan peminjaman ruang rapat, kendaraan dinas, dan fasilitas operasional kantor secara efisien, transparan, serta realtime.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-ojk-red" />
                            Tim Pengembang Aplikasi (Magang OJK Jawa Barat)
                        </h4>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 justify-between h-full">
                                <div className="flex flex-col items-center space-y-1.5">
                                    <img src="/uny logo.png" alt="UNY Logo" className="w-9 h-9 object-contain" />
                                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">UNY</span>
                                </div>
                                <div className="space-y-1 mt-2 w-full border-t border-slate-200/50 dark:border-slate-750 pt-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                    <p>Daffa Taufiqurahman</p>
                                    <p>Naufal Hanif R.</p>
                                    <p>Angga Baihaki Y.</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 justify-between h-full">
                                <div className="flex flex-col items-center space-y-1.5">
                                    <img src="/itb logo.png" alt="ITB Logo" className="w-9 h-9 object-contain" />
                                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">ITB</span>
                                </div>
                                <div className="space-y-1 mt-2 w-full border-t border-slate-200/50 dark:border-slate-750 pt-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                    <p>Ratu Khansa</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 justify-between h-full">
                                <div className="flex flex-col items-center space-y-1.5">
                                    <img src="/telkom logo.png" alt="Telkom Logo" className="w-9 h-9 object-contain" />
                                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">Telkom Univ</span>
                                </div>
                                <div className="space-y-1 mt-2 w-full border-t border-slate-200/50 dark:border-slate-750 pt-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                    <p>Bunga Nazwa S.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="primary" onClick={() => setShowAboutModal(false)} className="px-5 py-2">
                            Tutup
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
