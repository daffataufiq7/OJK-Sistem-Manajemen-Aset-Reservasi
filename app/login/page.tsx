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
    Play,
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
    const [activeSlide, setActiveSlide] = useState(0);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const slides = [
        {
            title: "Sinergi Layanan Manajemen Strategis",
            subtitle: "Mewujudkan layanan yang transparan, inovatif dan berorientasi pada kepentingan masyarakat."
        },
        {
            title: "Sistem Manajemen Aset & Reservasi",
            subtitle: "Portal layanan digital internal Kantor OJK Regional Jawa Barat."
        },
        {
            title: "Digitalisasi Facility Office",
            subtitle: "Kemudahan pengajuan ruang rapat, kendaraan dinas & fasilitas pendukung."
        }
    ];

    useEffect(() => {
        const stored = localStorage.getItem('ojk_theme') as 'light' | 'dark' | null;
        if (stored) setTheme(stored);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

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
        <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#090D16] transition-colors duration-300 font-sans flex flex-col justify-between items-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden select-none">
            
            {/* Background Red Glow Accent */}
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/15 dark:bg-red-900/15 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute -bottom-16 -right-16 w-[350px] h-[350px] rounded-full bg-red-600/25 pointer-events-none z-0 hidden lg:block"></div>

            {/* Top Bar Header */}
            <div className="w-full max-w-[1240px] flex justify-between items-center z-10 mb-2 sm:mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        Otoritas Jasa Keuangan &bull; Regional Jawa Barat
                    </span>
                </div>

                <button
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-xs backdrop-blur-md flex items-center gap-2 text-xs font-semibold"
                    title="Ubah Tema"
                >
                    {theme === 'light' ? (
                        <>
                            <Moon className="w-4 h-4 text-slate-700" />
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

            {/* Main Login Card Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[36px] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8 max-w-[1480px] w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch relative z-10 my-auto">
                
                {/* ── LEFT COLUMN: FULL CARD VIDEO BACKGROUND ── */}
                <div className="lg:col-span-7 relative rounded-[30px] overflow-hidden min-h-[580px] lg:min-h-[750px] flex flex-col justify-between p-6 sm:p-10 group shadow-xl">
                    
                    {/* Continuous Auto-Playing Loop Video */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    >
                        <source src="/vidio ojk.mp4" type="video/mp4" />
                    </video>

                    {/* Gradient Overlay for Text Readability (Ultra Clear Center) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 z-10 pointer-events-none"></div>

                    {/* TOP-LEFT OVERLAY: OJK White Logo */}
                    <div className="relative z-20 flex items-center gap-3">
                        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-white/30 flex items-center">
                            <img src="/logo ojk.png" alt="Logo OJK" className="h-9 w-auto object-contain" />
                        </div>
                    </div>

                    {/* BOTTOM OVERLAY: Text Carousel & Indicators */}
                    <div className="relative z-20 space-y-4">
                        <div className="space-y-2 max-w-md">
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md transition-all duration-500">
                                {slides[activeSlide].title}
                            </h2>
                            <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed drop-shadow-sm transition-all duration-500">
                                {slides[activeSlide].subtitle}
                            </p>
                        </div>

                        {/* Carousel Indicators */}
                        <div className="flex items-center space-x-2 pt-2">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveSlide(idx)}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        activeSlide === idx
                                            ? 'w-8 h-2.5 bg-red-600 rounded-full'
                                            : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80 rounded-full'
                                    }`}
                                    aria-label={`Slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: AUTHENTICATION FORM ── */}
                <div className="lg:col-span-5 flex flex-col justify-between py-3 sm:py-6 px-2 sm:px-6 relative space-y-6">
                    
                    {/* Top Right Dot Matrix Decorative Grid */}
                    <div className="absolute top-2 right-2 pointer-events-none opacity-25 dark:opacity-15">
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                            <pattern id="dot-matrix-right" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" className="fill-slate-400 dark:fill-slate-600" />
                            </pattern>
                            <rect width="100" height="100" fill="url(#dot-matrix-right)" />
                        </svg>
                    </div>

                    <div className="space-y-6">
                        {/* Header Logo & Title */}
                        <div className="space-y-4">
                            <img src="/logo ojk.png" alt="Logo OJK" className="h-12 sm:h-14 w-auto object-contain" />

                            <div className="space-y-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Otentikasi Sistem
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Masukkan kredensial Anda untuk mengakses portal.
                                </p>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="relative">
                                <Input
                                    label="ID Pengguna / NIP"
                                    placeholder="Masukkan ID Pengguna atau NIP"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-11 text-xs sm:text-sm py-3 rounded-xl"
                                    required
                                />
                                <UserIcon className="absolute bottom-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
                            </div>

                            <div className="relative">
                                <Input
                                    label="Kata Sandi"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan kata sandi"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11 text-xs sm:text-sm py-3 rounded-xl"
                                    required
                                />
                                <Lock className="absolute bottom-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute bottom-3.5 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="mr-2.5 rounded border-slate-300 dark:border-slate-700 text-[#C8102E] focus:ring-[#C8102E] w-4 h-4"
                                    />
                                    Ingat saya
                                </label>
                                <a
                                    href="#forgot"
                                    className="text-[#C8102E] dark:text-red-400 hover:underline font-bold"
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
                                className="w-full py-3.5 font-extrabold rounded-xl text-sm bg-[#A60C25] hover:bg-[#8B091E] text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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
                                        <ArrowRight className="w-4.5 h-4.5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                atau
                            </span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAboutModal(true)}
                            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-750 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                        >
                            <Info className="w-4.5 h-4.5 text-[#C8102E] shrink-0" />
                            <span>Tentang Aplikasi & Tim Pengembang (About Us)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="z-10 text-center py-2">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    &copy; 2026 Otoritas Jasa Keuangan. All rights reserved.
                </p>
            </div>

            {/* About Modal */}
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
                            <Sparkles className="w-4 h-4 text-[#C8102E]" />
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
