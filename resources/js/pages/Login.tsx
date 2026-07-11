import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, toast } from '../components/UI';
import { Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Sun, Moon, Info, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        (localStorage.getItem('ojk_theme') as 'light' | 'dark') || 'light'
    );

    // Toggle Theme
    React.useEffect(() => {
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
            toast.error('Silakan isi NIP/Email dan Password.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(identifier, password);
            toast.success(`Selamat datang kembali, ${user.name}!`);
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login gagal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#090D16] transition-colors duration-300 font-sans relative overflow-hidden">
            
            {/* Custom Interactive Styles for floating orbs */}
            <style dangerouslySetInnerHTML={{__html: `
                .animate-float-1 {
                    animation: float-1 16s infinite ease-in-out;
                }
                .animate-float-2 {
                    animation: float-2 20s infinite ease-in-out;
                }
                .animate-float-3 {
                    animation: float-3 14s infinite ease-in-out;
                }
                .animate-bg-gradient {
                    background-size: 200% 200%;
                    animation: gradient-shift 12s infinite ease-in-out;
                }
                @keyframes float-1 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(35px, -50px) scale(1.12); }
                    66% { transform: translate(-25px, 25px) scale(0.92); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float-2 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(-45px, 35px) scale(0.88); }
                    66% { transform: translate(25px, -25px) scale(1.08); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes float-3 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(25px, 45px) scale(1.04); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}} />

            {/* Theme Switcher (Absolute Top Left of page to keep it clean) */}
            <div className="absolute top-6 left-6 z-20">
                <button 
                    onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-855 text-slate-600 hover:text-slate-800 dark:text-slate-350 dark:hover:text-white border border-slate-200/60 dark:border-slate-800/60 rounded-xl transition-all cursor-pointer shadow-sm backdrop-blur-md"
                >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                </button>
            </div>

            {/* Left Column: Card Form Panel (50% Width, Full Height, Animated Gradient background) */}
            <div className="w-full lg:w-1/2 min-h-screen lg:h-screen flex items-center justify-center p-4 sm:p-12 border-r border-slate-200/60 dark:border-slate-800/60 relative overflow-y-auto lg:overflow-hidden animate-bg-gradient bg-gradient-to-tr from-slate-50 via-red-500/5 to-slate-100 dark:from-[#090D16] dark:via-red-950/10 dark:to-slate-900">
                
                {/* Floating Interactive Glowing Orbs in the background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                    {/* Orb 1: OJK Red */}
                    <div className="absolute top-[15%] left-[10%] w-[320px] h-[320px] rounded-full bg-red-600/10 dark:bg-red-700/10 blur-3xl animate-float-1"></div>
                    {/* Orb 2: OJK Gold/Amber */}
                    <div className="absolute bottom-[15%] right-[10%] w-[340px] h-[340px] rounded-full bg-amber-500/5 dark:bg-amber-600/5 blur-3xl animate-float-2"></div>
                    {/* Orb 3: Soft Gray / Slate */}
                    <div className="absolute top-[40%] right-[20%] w-[250px] h-[250px] rounded-full bg-slate-400/10 dark:bg-red-950/10 blur-3xl animate-float-3"></div>
                </div>

                {/* Staggered Card Wrapper */}
                <div className="relative w-full max-w-[540px] min-h-[520px] sm:min-h-[580px] flex items-stretch z-10">
                    
                    {/* Login Card */}
                    <div 
                        className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl w-full flex flex-col justify-between transition-all duration-500 ease-in-out ${showAbout ? 'opacity-0 -translate-x-12 pointer-events-none absolute' : 'opacity-100 translate-x-0'}`}
                    >
                        {/* Brand Header */}
                        <div className="flex flex-col items-center justify-center space-y-3 mb-6">
                            <img src="/logo ojk.png" alt="Logo OJK" className="h-16 w-auto object-contain" />
                            <div className="text-center space-y-1">
                                <h2 className="text-sm font-extrabold text-slate-850 dark:text-white tracking-tight leading-snug">
                                    Sistem Manajemen Aset & Reservasi
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                    Kantor Regional Jawa Barat
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Input
                                    label="NIP atau Email"
                                    placeholder="Masukkan NIP atau Email OJK Anda"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="pl-11 text-xs"
                                    required
                                />
                                <UserIcon className="absolute bottom-3.5 left-4 w-4 h-4 text-slate-400" />
                            </div>

                            <div className="relative">
                                <Input
                                    label="Kata Sandi"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11 text-xs"
                                    required
                                />
                                <Lock className="absolute bottom-3.5 left-4 w-4 h-4 text-slate-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute bottom-3.5 right-4 text-slate-400 hover:text-slate-655 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center text-slate-600 dark:text-slate-400 font-semibold cursor-pointer select-none">
                                    <input type="checkbox" className="mr-2 rounded border-slate-300 dark:border-slate-700 text-ojk-red focus:ring-ojk-red" />
                                    Ingat saya
                                </label>
                                <a 
                                    href="#forgot" 
                                    className="text-ojk-red dark:text-red-400 hover:underline font-bold" 
                                    onClick={(e) => { e.preventDefault(); toast.info('Silakan hubungi Super Admin Divisi Umum untuk reset password.'); }}
                                >
                                    Lupa sandi?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3.5 font-bold rounded-xl text-xs mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Memproses...</span>
                                    </div>
                                ) : 'Masuk Portal'}
                            </Button>
                        </form>

                        {/* About Us trigger */}
                        <div className="flex justify-center pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                            <button
                                type="button"
                                onClick={() => setShowAbout(true)}
                                className="text-xs text-slate-500 hover:text-ojk-red dark:text-slate-400 dark:hover:text-red-400 font-bold hover:underline cursor-pointer flex items-center gap-1.5 focus:outline-none"
                            >
                                <Info className="w-4 h-4 shrink-0" /> Tentang Aplikasi & Kantor (About Us)
                            </button>
                        </div>
                    </div>

                    {/* About Us Card */}
                    <div 
                        className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl w-full flex flex-col justify-between transition-all duration-500 ease-in-out ${!showAbout ? 'opacity-0 translate-x-12 pointer-events-none absolute' : 'opacity-100 translate-x-0'}`}
                    >
                        <div className="space-y-5">
                            {/* Logo */}
                            <div className="flex flex-col items-center justify-center space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800/85">
                                <img src="/logo ojk.png" alt="Logo OJK" className="h-16 w-auto object-contain" />
                                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                    Kantor Regional Jawa Barat
                                </span>
                            </div>

                            {/* About Content */}
                            <div className="space-y-3 text-xs font-semibold text-slate-655 dark:text-slate-350 leading-relaxed text-justify">
                                <p>
                                    <strong>Sistem Reservasi Aset</strong> adalah portal digital internal Kantor OJK Regional Jawa Barat untuk mempermudah peminjaman ruang rapat, kendaraan dinas, laptop, dan proyektor dinas.
                                </p>
                            </div>

                            {/* Developer Team Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/85">
                                <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-center">
                                    Tim Pengembang Aplikasi
                                </h4>
                                
                                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                    {/* UNY */}
                                    <div className="flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between">
                                        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                                            <img src="/uny logo.png" alt="UNY Logo" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                            <p className="text-[8.5px] sm:text-[10px] font-extrabold text-slate-800 dark:text-white leading-tight">UNY</p>
                                        </div>
                                        <div className="space-y-1 mt-2.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-2 flex flex-col items-center">
                                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Daffa Taufiqurahman</p>
                                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Naufal Hanif R.</p>
                                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Angga Baihaki Y.</p>
                                        </div>
                                    </div>

                                    {/* ITB */}
                                    <div className="flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between">
                                        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                                            <img src="/itb logo.png" alt="ITB Logo" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                            <p className="text-[8.5px] sm:text-[10px] font-extrabold text-slate-800 dark:text-white leading-tight">ITB</p>
                                        </div>
                                        <div className="space-y-1 mt-2.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-2 flex flex-col items-center justify-start min-h-[44px] sm:min-h-[60px]">
                                            <p className="text-[8.5px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Ratu Khansa</p>
                                        </div>
                                    </div>

                                    {/* Telkom University */}
                                    <div className="flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-900/40 p-2 sm:p-3 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between">
                                        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                                            <img src="/telkom logo.png" alt="Telkom Logo" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                            <p className="text-[8.5px] sm:text-[10px] font-extrabold text-slate-800 dark:text-white leading-tight">Telkom Univ</p>
                                        </div>
                                        <div className="space-y-1 mt-2.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-2 flex flex-col items-center justify-start min-h-[44px] sm:min-h-[60px]">
                                            <p className="text-[8.5px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Bunga Nazwa S.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action: Slide Back */}
                            <Button
                                type="button"
                                onClick={() => setShowAbout(false)}
                                className="w-full py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4 shrink-0" /> Kembali ke Login
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Full-Height Clean Image Panel (50% Width, Full Height) */}
            <div className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden bg-slate-900">
                <img 
                    src="/Kantor OJK 2.jpeg" 
                    alt="Kantor Otoritas Jasa Keuangan Regional Jawa Barat" 
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-[10s] ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Elegant floating watermark badge */}
                <div className="absolute bottom-8 left-8 text-white flex items-center gap-3 drop-shadow-md bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-xs font-bold tracking-wide">Kantor OJK Regional Jawa Barat</span>
                </div>
            </div>

        </div>
    );
};
