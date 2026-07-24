import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Dialog, toast } from '../components/UI';
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
    X,
    Building,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    
    // Active slide index for left banner
    const [activeSlide, setActiveSlide] = useState(0);

    const [theme, setTheme] = useState<'light' | 'dark'>(
        (localStorage.getItem('ojk_theme') as 'light' | 'dark') || 'light'
    );

    const slides = [
        {
            title: "Sistem Manajemen Aset & Reservasi",
            subtitle: "Portal layanan digital internal Kantor OJK Regional Jawa Barat."
        },
        {
            title: "Digitalisasi Tata Kelola Facility Office",
            subtitle: "Kemudahan pengajuan ruang rapat dan kendaraan dinas."
        },
        {
            title: "Layanan Efisien, Transparan & Terintegrasi",
            subtitle: "Mendukung kelancaran operasional pengawasan sektor jasa keuangan Jawa Barat."
        }
    ];

    // Slide auto play
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // Manage Dark Mode
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
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login gagal. Periksa kembali NIP/Email dan Password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F4F6F9] dark:bg-[#090D16] transition-colors duration-300 font-sans flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden select-none">
            
            {/* Background Decorative Patterns (Top Right Dots Matrix & Bottom Right Red Curve) */}
            <div className="absolute top-6 right-6 pointer-events-none opacity-20 dark:opacity-10 z-0">
                <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                    <pattern id="dot-matrix" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" className="fill-slate-700 dark:fill-slate-300" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#dot-matrix)" />
                </svg>
            </div>

            <div className="absolute bottom-6 left-6 pointer-events-none opacity-20 dark:opacity-10 z-0 hidden sm:block">
                <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="url(#dot-matrix)" />
                </svg>
            </div>

            {/* Bottom-right red accent wave decorative background */}
            <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-red-600/10 dark:bg-red-900/10 blur-3xl pointer-events-none z-0"></div>
            <div className="absolute -bottom-16 -right-16 w-[280px] h-[280px] rounded-full bg-red-600/20 pointer-events-none z-0 hidden lg:block"></div>

            {/* Top Bar Header Navigation */}
            <div className="w-full max-w-[1140px] flex justify-between items-center z-10 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        Otoritas Jasa Keuangan &bull; Regional Jawa Barat
                    </span>
                </div>

                {/* Theme Toggle Button */}
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

            {/* Main Login Card Container (Landscape Double Panel) */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 my-auto">
                
                {/* LEFT PANEL: Landscape Media Video Showcase (7 Columns) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                    
                    {/* Header Website Name Above Video Frame */}
                    <div className="flex flex-col space-y-0.5 px-1">
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block shrink-0"></span>
                            Sistem Manajemen Aset & Reservasi
                        </h1>
                        <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 tracking-widest uppercase pl-4">
                            Kantor Regional Jawa Barat
                        </span>
                    </div>

                    {/* Enlarged Video Container (100% Clean Video View, NO text overlay) */}
                    <div className="relative rounded-[26px] overflow-hidden aspect-[16/10] sm:aspect-video w-full min-h-[400px] sm:min-h-[460px] lg:min-h-[500px] shadow-xl border border-slate-200/60 dark:border-slate-800 group select-none">
                        
                        {/* Background Backdrop Video (Autoplay & Looping: vidio ojk.mp4) */}
                        <video 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            poster="/Kantor OJK 2.jpeg"
                            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                        >
                            <source src="/vidio ojk.mp4" type="video/mp4" />
                            <source src="/video-bg.mp4" type="video/mp4" />
                            <img 
                                src="/Kantor OJK 2.jpeg" 
                                alt="Kantor Regional OJK Jawa Barat" 
                                className="w-full h-full object-cover object-center" 
                            />
                        </video>

                    </div>

                    {/* Title & Subtitle BELOW Video Frame (Clean & Non-Obstructive) */}
                    <div className="px-1 space-y-2 pt-1">
                        <div className="space-y-1 transition-all duration-500">
                            <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-white tracking-tight leading-snug">
                                {slides[activeSlide].title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                                {slides[activeSlide].subtitle}
                            </p>
                        </div>

                        {/* Carousel Indicators (Dots) */}
                        <div className="flex items-center space-x-2 pt-1">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveSlide(idx)}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        activeSlide === idx 
                                            ? 'w-7 h-2 bg-red-600 rounded-full' 
                                            : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 rounded-full'
                                    }`}
                                    aria-label={`Slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT PANEL: System Authentication Form (5 Columns) */}
                <div className="lg:col-span-5 flex flex-col justify-between py-2 sm:py-4 px-2 sm:px-4 space-y-6">
                    
                    <div className="space-y-6">
                        
                        {/* Red OJK Emblem Logo Header */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <img src="/logo ojk.png" alt="Logo OJK" className="h-12 sm:h-14 w-auto object-contain" />
                            </div>
                            
                            <div className="space-y-1 pt-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Otentikasi Sistem
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Masukkan kredensial Anda untuk mengakses portal.
                                </p>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                            
                            {/* ID Pengguna / NIP */}
                            <div className="relative">
                                <Input
                                    label="ID Pengguna / NIP"
                                    placeholder="Masukkan ID Pengguna atau NIP"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-11 text-xs sm:text-sm py-3"
                                    required
                                />
                                <UserIcon className="absolute bottom-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
                            </div>

                            {/* Kata Sandi */}
                            <div className="relative">
                                <Input
                                    label="Kata Sandi"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan kata sandi"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11 text-xs sm:text-sm py-3"
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

                            {/* Checkbox Ingat Saya & Lupa Kata Sandi */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        className="mr-2.5 rounded border-slate-300 dark:border-slate-700 text-ojk-red focus:ring-ojk-red w-4 h-4" 
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

                            {/* Primary Red Action Button: Masuk ke Portal */}
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

                        {/* Divider Line */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                atau
                            </span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>

                        {/* Replaced SSO button with About Us Button */}
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

            {/* Footer Copyright */}
            <div className="z-10 text-center py-2">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    &copy; 2026 Otoritas Jasa Keuangan. All rights reserved.
                </p>
            </div>

            {/* Video Modal Player Dialog */}
            <Dialog 
                isOpen={showVideoModal} 
                onClose={() => setShowVideoModal(false)}
                title="Profil Gedung Kantor Regional OJK Jawa Barat"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <img 
                            src="/Kantor OJK.jpeg" 
                            alt="Kantor OJK Video Preview" 
                            className="w-full h-full object-cover opacity-80" 
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 backdrop-blur-xs space-y-3">
                            <Building className="w-12 h-12 text-white/90" />
                            <div className="space-y-1">
                                <h4 className="text-base font-bold text-white">Kantor Otoritas Jasa Keuangan Regional Jawa Barat</h4>
                                <p className="text-xs text-slate-300 max-w-md">
                                    Jl. Ir. H. Juanda No. 152, Bandung, Jawa Barat. Portal Sistem Manajemen Aset & Reservasi Terintegrasi.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="secondary" onClick={() => setShowVideoModal(false)}>
                            Tutup Preview
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* About Us & Developer Team Dialog */}
            <Dialog
                isOpen={showAboutModal}
                onClose={() => setShowAboutModal(false)}
                title="Tentang Aplikasi & Tim Pengembang"
                size="md"
            >
                <div className="space-y-6">
                    
                    {/* Header Logo */}
                    <div className="flex flex-col items-center justify-center text-center space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <img src="/logo ojk.png" alt="Logo OJK" className="h-14 w-auto object-contain" />
                        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white tracking-tight">
                            Sistem Manajemen Aset & Reservasi
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Kantor Regional Jawa Barat
                        </span>
                    </div>

                    {/* App Description */}
                    <div className="space-y-2 text-xs font-medium text-slate-650 dark:text-slate-350 leading-relaxed text-justify">
                        <p>
                            <strong>Sistem Manajemen Aset & Reservasi (SIMA-R)</strong> adalah platform manajemen internal berbasis web yang dirancang untuk mengotomatiskan proses pengajuan peminjaman ruang rapat, kendaraan dinas, dan fasilitas operasional kantor secara efisien, transparan, serta realtime.
                        </p>
                    </div>

                    {/* Developer Team */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-ojk-red" />
                            Tim Pengembang Aplikasi (Magang OJK Jawa Barat)
                        </h4>

                        <div className="grid grid-cols-3 gap-3">
                            
                            {/* UNY */}
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

                            {/* ITB */}
                            <div className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 justify-between h-full">
                                <div className="flex flex-col items-center space-y-1.5">
                                    <img src="/itb logo.png" alt="ITB Logo" className="w-9 h-9 object-contain" />
                                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">ITB</span>
                                </div>
                                <div className="space-y-1 mt-2 w-full border-t border-slate-200/50 dark:border-slate-750 pt-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                    <p>Ratu Khansa</p>
                                </div>
                            </div>

                            {/* Telkom University */}
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

                    {/* Modal Footer Close Button */}
                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="primary" onClick={() => setShowAboutModal(false)} className="px-5 py-2">
                            Tutup
                        </Button>
                    </div>

                </div>
            </Dialog>

        </div>
    );
};
