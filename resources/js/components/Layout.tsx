import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    LayoutDashboard, 
    Layers, 
    Calendar, 
    CheckSquare, 
    History, 
    FileBarChart2, 
    Bell, 
    Settings, 
    Users, 
    Activity,
    LogOut,
    Menu,
    X,
    Sun,
    Moon,
    Clock,
    PlusCircle,
    ChevronDown,
    User as UserIcon,
    Car,
    Home as HomeIcon,
    Laptop,
    Briefcase,
    Building2,
    Armchair,
    Sparkles
} from 'lucide-react';
import { toast, ToastContainer, Button } from './UI';

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reservationsSubOpen, setReservationsSubOpen] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        (localStorage.getItem('ojk_theme') as 'light' | 'dark') || 'light'
    );
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Notifications & Pending Approvals State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const loadedNotifIdsRef = useRef<Set<number>>(new Set());

    const [activeSection, setActiveSection] = useState<string>('sec-dashboard');

    // Direct scroll position listener in Layout.tsx for instant sidebar scroll spy highlight
    useEffect(() => {
        const sectionIds = ['sec-dashboard', 'sec-kendaraan', 'sec-ruangan', 'sec-kalender', 'sec-riwayat', 'sec-pengaturan'];

        const updateActiveSection = () => {
            const container = document.getElementById('snap-scroll-container');
            const scrollPos = container ? container.scrollTop + 200 : window.scrollY + 200;

            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const el = document.getElementById(sectionIds[i]);
                if (el) {
                    const top = el.offsetTop;
                    if (scrollPos >= top) {
                        setActiveSection(sectionIds[i]);
                        if (['sec-kendaraan', 'sec-ruangan'].includes(sectionIds[i])) {
                            setReservationsSubOpen(true);
                        }
                        break;
                    }
                }
            }
        };

        const container = document.getElementById('snap-scroll-container');
        if (container) {
            container.addEventListener('scroll', updateActiveSection, { passive: true });
        }
        window.addEventListener('scroll', updateActiveSection, { passive: true });

        const timer = setInterval(updateActiveSection, 250);

        return () => {
            if (container) container.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('scroll', updateActiveSection);
            clearInterval(timer);
        };
    }, []);

    const scrollToSection = (secId: string) => {
        setSidebarOpen(false);
        setActiveSection(secId);
        if (['sec-kendaraan', 'sec-ruangan'].includes(secId)) {
            setReservationsSubOpen(true);
        }
        const container = document.getElementById('snap-scroll-container');
        const el = document.getElementById(secId);
        if (container && el) {
            container.scrollTo({
                top: el.offsetTop,
                behavior: 'smooth'
            });
        } else if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Dynamic Clock ticking
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Manage Dark Mode CSS class
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('ojk_theme', theme);
    }, [theme]);

    // Fetch Notifications & Pending Approvals
    const fetchData = async () => {
        try {
            // 1. Fetch Notifications
            const notifResponse = await axios.get('/notifications');
            
            // Check for new unread notifications to trigger real-time toast
            if (loadedNotifIdsRef.current.size === 0) {
                // Initial load: populate the ref
                notifResponse.data.forEach((n: any) => loadedNotifIdsRef.current.add(n.id));
            } else {
                // Subsequent loads: toast new unread notifications
                notifResponse.data.forEach((n: any) => {
                    if (!loadedNotifIdsRef.current.has(n.id)) {
                        loadedNotifIdsRef.current.add(n.id);
                        if (!n.is_read) {
                            toast.info(`${n.title}: ${n.message}`);
                        }
                    }
                });
            }
            setNotifications(notifResponse.data);

            // 2. Fetch Pending Approvals Count for Admin / Validator
            if (user && ['super_admin', 'validator'].includes(user.role)) {
                const approvalResponse = await axios.get('/reservations?status=pending');
                setPendingApprovalCount(approvalResponse.data.length);
            }
        } catch (error) {
            console.error('Error fetching layout data', error);
        }
    };

    useEffect(() => {
        let poll: any;
        if (user) {
            fetchData();
            // Poll notifications and approvals every 10 seconds for real-time responsiveness
            poll = setInterval(fetchData, 10000);
        }
        return () => {
            if (poll) clearInterval(poll);
        };
    }, [user]);

    // Click outside handler
    useEffect(() => {
        const clickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifDropdownOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Berhasil logout dari sistem.');
            navigate('/login');
        } catch (error) {
            toast.error('Gagal logout.');
        }
    };

    const markNotificationRead = async (id: number) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('Semua notifikasi ditandai telah dibaca.');
            setNotifDropdownOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // RBAC Menu Definition
    const menuItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            roles: ['super_admin', 'validator', 'pegawai']
        },
        {
            label: 'Master Aset',
            path: '/assets',
            icon: <Layers className="w-5 h-5" />,
            roles: ['super_admin']
        },
        {
            label: 'Reservasi Aset',
            path: '/reservations',
            icon: <PlusCircle className="w-5 h-5" />,
            roles: ['super_admin', 'validator', 'pegawai'],
            hasSub: true,
            subItems: [
                { label: 'Semua Reservasi', path: '/reservations', icon: <PlusCircle className="w-3.5 h-3.5" /> },
                { label: 'Mobil Dinas', path: '/reservations?category=Kendaraan', icon: <Car className="w-3.5 h-3.5" /> },
                { label: 'Ruang Rapat & Aula', path: '/reservations?category=Ruangan', icon: <HomeIcon className="w-3.5 h-3.5" /> }
            ]
        },
        {
            label: 'Partnership',
            path: '/partnership',
            icon: <Building2 className="w-5 h-5 text-amber-500" />,
            roles: ['super_admin', 'validator', 'pegawai']
        },
        {
            label: 'Kalender',
            path: '/calendar',
            icon: <Calendar className="w-5 h-5" />,
            roles: ['super_admin', 'validator', 'pegawai']
        },
        {
            label: 'Approval',
            path: '/approvals',
            icon: <CheckSquare className="w-5 h-5" />,
            roles: ['super_admin', 'validator'],
            badge: user?.role !== 'pegawai' ? pendingApprovalCount : 0 // Show count badge on approvals tab
        },
        {
            label: 'Riwayat',
            path: '/history',
            icon: <History className="w-5 h-5" />,
            roles: ['super_admin', 'validator', 'pegawai']
        },
        {
            label: 'Laporan',
            path: '/reports',
            icon: <FileBarChart2 className="w-5 h-5" />,
            roles: ['super_admin', 'validator']
        },
        {
            label: 'Audit Log',
            path: '/audit-logs',
            icon: <Activity className="w-5 h-5" />,
            roles: ['super_admin']
        },
        {
            label: 'User Management',
            path: '/users',
            icon: <Users className="w-5 h-5" />,
            roles: ['super_admin']
        },
        {
            label: 'Pengaturan',
            path: '/settings',
            icon: <Settings className="w-5 h-5" />,
            roles: ['super_admin', 'validator', 'pegawai']
        }
    ];

    const currentRole = user?.role || 'pegawai';
    const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

    // Dynamic Role Labels
    const roleLabels = {
        super_admin: 'Super Admin',
        validator: 'Admin / Validator',
        pegawai: 'Pegawai'
    };

    // Format Clock Date: "Kamis, 03 Juli 2026"
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format Clock Time: "03 Juli 2026, 09:00:00 WIB"
    const formatTime = (date: Date) => {
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const secs = String(date.getSeconds()).padStart(2, '0');
        const dateStr = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        return `${dateStr}, ${hrs}:${mins}:${secs} WIB`;
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors duration-250">
            
            {/* ==========================================
                SIDEBAR (Desktop & Mobile)
                ========================================== */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transform transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Sidebar Header Brand Logo */}
                <div className="p-6 pb-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0">
                    <Link to="/" className="flex flex-col items-start gap-1.5">
                        <img src="/logo ojk.png" alt="Logo OJK" className="h-16 w-auto max-w-[200px] object-contain" />
                        <span className="text-[9.5px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none pl-1">
                            Kantor Regional 2 Jawa Barat
                        </span>
                    </Link>
                    
                    {/* Mobile Close */}
                    <button className="xl:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items - Fully Scrollable with Scroll Spy */}
                <nav className="p-4 space-y-1.5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                    {user?.role === 'pegawai' ? (
                        <React.Fragment>
                            {/* Dashboard */}
                            <button
                                onClick={() => scrollToSection('sec-dashboard')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${activeSection === 'sec-dashboard' ? 'bg-ojk-red text-white shadow-sm shadow-red-500/10 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </div>
                            </button>

                            {/* Reservasi Aset (Collapsible Parent) */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => setReservationsSubOpen(!reservationsSubOpen)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${['sec-kendaraan', 'sec-ruangan'].includes(activeSection) ? 'bg-red-50 dark:bg-red-950/40 text-ojk-red dark:text-red-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <PlusCircle className="w-5 h-5" />
                                        <span>Reservasi Aset</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${reservationsSubOpen ? 'transform rotate-180' : ''}`} />
                                </button>

                                {reservationsSubOpen && (
                                    <div className="pl-8 pr-1 space-y-1 py-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                                        <button
                                            onClick={() => scrollToSection('sec-kendaraan')}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${activeSection === 'sec-kendaraan' ? 'bg-ojk-red text-white font-extrabold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            <Car className="w-3.5 h-3.5" />
                                            <span>Kendaraan Dinas</span>
                                        </button>

                                        <button
                                            onClick={() => scrollToSection('sec-ruangan')}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${activeSection === 'sec-ruangan' ? 'bg-ojk-red text-white font-extrabold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            <HomeIcon className="w-3.5 h-3.5" />
                                            <span>Ruang Rapat & Aula</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Kalender */}
                            <button
                                onClick={() => scrollToSection('sec-kalender')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${activeSection === 'sec-kalender' ? 'bg-ojk-red text-white shadow-sm shadow-red-500/10 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Calendar className="w-5 h-5" />
                                    <span>Kalender</span>
                                </div>
                            </button>

                            {/* Riwayat */}
                            <button
                                onClick={() => scrollToSection('sec-riwayat')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${activeSection === 'sec-riwayat' ? 'bg-ojk-red text-white shadow-sm shadow-red-500/10 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <History className="w-5 h-5" />
                                    <span>Riwayat</span>
                                </div>
                            </button>

                            {/* Pengaturan */}
                            <button
                                onClick={() => scrollToSection('sec-pengaturan')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${activeSection === 'sec-pengaturan' ? 'bg-ojk-red text-white shadow-sm shadow-red-500/10 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Settings className="w-5 h-5" />
                                    <span>Pengaturan</span>
                                </div>
                            </button>
                        </React.Fragment>
                    ) : (
                        filteredMenu.map((item, index) => {
                            const isActive = location.pathname === item.path && !location.search;
                            if (item.hasSub) {
                                const isSubActive = location.pathname.startsWith('/reservations');
                                return (
                                    <div key={index} className="space-y-1">
                                        <button 
                                            onClick={() => setReservationsSubOpen(!reservationsSubOpen)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${isSubActive ? 'bg-red-50 dark:bg-red-950/40 text-ojk-red dark:text-red-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${reservationsSubOpen ? 'transform rotate-180' : ''}`} />
                                        </button>

                                        {reservationsSubOpen && (
                                            <div className="pl-8 pr-1 space-y-1 py-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                                                {item.subItems?.map((sub, sIdx) => {
                                                    const isSubMatch = (location.pathname + location.search) === sub.path || (sub.path === '/reservations' && location.pathname === '/reservations' && !location.search);
                                                    return (
                                                        <Link
                                                            key={sIdx}
                                                            to={sub.path}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`flex items-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all ${isSubMatch ? 'bg-ojk-red text-white font-extrabold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                        >
                                                            {sub.icon}
                                                            <span>{sub.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link 
                                    key={index} 
                                    to={item.path} 
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 ${isActive ? 'bg-ojk-red text-white shadow-sm shadow-red-500/10' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && item.badge > 0 ? (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-ojk-red' : 'bg-ojk-red text-white'}`}>
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })
                    )}
                </nav>

                {/* Sidebar Bottom Banner Card */}
                <div className="p-4 shrink-0 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ajukan Reservasi</span>
                            <span className="text-[10px] font-medium text-slate-400">Pinjam aset kendaraan atau ruang rapat kantor.</span>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-xl flex items-center justify-center gap-1.5 w-full text-xs font-bold py-2"
                            onClick={() => { navigate('/reservations'); setSidebarOpen(false); }}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Reservasi Aset
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Backdrop for Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs z-30 xl:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ==========================================
                MAIN WRAPPER
                ========================================== */}
            <div className="flex-1 flex flex-col xl:pl-72 pb-24 xl:pb-6">
                
                {/* ==========================================
                    HEADER
                    ========================================== */}
                <header className="sticky top-0 z-20 bg-slate-50/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/40 px-8 py-5 flex items-center justify-between">
                    
                    {/* Sidebar trigger for Mobile & Breadcrumbs Info */}
                    <div className="flex items-center gap-4">
                        <button className="xl:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-col">
                            <h1 className="text-sm xl:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                                Sistem Manajemen Aset & Reservasi
                            </h1>
                            <p className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                                OJK Jawa Barat
                            </p>
                        </div>
                    </div>

                    {/* Header Utilities Buttons with Vertical Dividers */}
                    <div className="flex items-center gap-3">
                        
                        {/* Dynamic Live Calendar Date-Clock */}
                        <div className="hidden lg:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-2.5 soft-shadow">
                            <Clock className="w-4.5 h-4.5 text-ojk-red animate-pulse" />
                            <div className="flex flex-col leading-tight">
                                <span className="text-[12.5px] font-extrabold text-slate-700 dark:text-slate-200">{formatTime(currentTime)}</span>
                                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-550 tracking-wide uppercase">{formatDate(currentTime).split(',')[0]}</span>
                            </div>
                        </div>

                        {/* Clock-to-Theme Divider */}
                        <div className="hidden lg:block h-6 w-[1px] bg-slate-200 dark:bg-slate-800/80 mx-1.5"></div>

                        {/* Dark Mode toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors soft-shadow cursor-pointer"
                            title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                        </button>

                        {/* Theme-to-Notif Divider */}
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800/80 mx-1.5"></div>

                        {/* Notifications Dropdown Bell */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-850 dark:hover:text-slate-300 transition-colors relative soft-shadow cursor-pointer"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-ojk-red text-white text-[9.5px] font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Content */}
                            {notifDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2 divide-y divide-slate-50 dark:divide-slate-800/60 transform origin-top-right transition-all">
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifikasi</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllNotificationsRead} className="text-[10px] text-ojk-red hover:underline font-semibold cursor-pointer">
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                                        {notifications.length > 0 ? (
                                            notifications.map((n, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={() => !n.is_read && markNotificationRead(n.id)}
                                                    className={`p-3.5 flex flex-col space-y-1 hover:bg-slate-50/70 dark:hover:bg-slate-850/30 transition-colors cursor-pointer ${!n.is_read ? 'bg-red-500/2 dark:bg-red-500/1 border-l-2 border-ojk-red' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{n.title}</span>
                                                        <span className="text-[9px] font-medium text-slate-400">{new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">{n.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-[11px] text-slate-400 font-semibold">
                                                Tidak ada notifikasi baru
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notif-to-Profile Divider */}
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800/80 mx-1.5"></div>

                        {/* Profile Dropdown Profile details */}
                        <div className="relative flex" ref={profileRef}>
                            <button 
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 soft-shadow hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                            >
                                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                    <UserIcon className="w-5 h-5 text-ojk-red" />
                                </div>
                                <div className="hidden sm:flex flex-col text-left leading-tight">
                                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">{user?.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{user?.division?.name || 'Kantor Regional 2 Jabar'}</span>
                                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">{roleLabels[currentRole]}</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-12 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-30 py-1.5 divide-y divide-slate-50 dark:divide-slate-800/60 transform origin-top-right transition-all">
                                    <div className="px-4 py-2 sm:hidden flex flex-col leading-tight">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user?.name}</span>
                                        <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{user?.division?.name || 'Kantor Regional 2 Jabar'}</span>
                                        <span className="text-[8.5px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">{roleLabels[currentRole]}</span>
                                    </div>
                                    <div className="py-1">
                                        <Link 
                                            to="/settings" 
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-850"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Pengaturan
                                        </Link>
                                    </div>
                                    <div className="py-1">
                                        <button 
                                            onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                                            className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 hover:text-red-750 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Keluar Sistem
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* ==========================================
                    PAGE CONTENT BODY (Full Screen Snap Container)
                    ========================================== */}
                <main id="snap-scroll-container" className="flex-1 w-full mx-auto animate-fade-in duration-200 overflow-y-auto snap-y snap-mandatory scroll-smooth custom-scrollbar h-[calc(100vh-73px)]">
                    <Outlet />
                </main>

            </div>

            {/* ==========================================
                BOTTOM NAVIGATION (Mobile Native View)
                ========================================== */}
            <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md flex items-center justify-around py-3.5 z-40 xl:hidden">
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 text-[9px] font-bold ${location.pathname === '/dashboard' ? 'text-ojk-red' : 'text-slate-400'}`}>
                    <HomeIcon className="w-4.5 h-4.5" />
                    <span>Home</span>
                </Link>
                <Link to="/reservations" className={`flex flex-col items-center gap-1 text-[9px] font-bold ${location.pathname === '/reservations' ? 'text-ojk-red' : 'text-slate-400'}`}>
                    <PlusCircle className="w-4.5 h-4.5" />
                    <span>Reservasi</span>
                </Link>
                <Link to="/calendar" className={`flex flex-col items-center gap-1 text-[9px] font-bold ${location.pathname === '/calendar' ? 'text-ojk-red' : 'text-slate-400'}`}>
                    <Calendar className="w-4.5 h-4.5" />
                    <span>Kalender</span>
                </Link>
                <Link to="/history" className={`flex flex-col items-center gap-1 text-[9px] font-bold ${location.pathname === '/history' ? 'text-ojk-red' : 'text-slate-400'}`}>
                    <History className="w-4.5 h-4.5" />
                    <span>Riwayat</span>
                </Link>
                <Link to="/settings" className={`flex flex-col items-center gap-1 text-[9px] font-bold ${location.pathname === '/settings' ? 'text-ojk-red' : 'text-slate-400'}`}>
                    <Settings className="w-4.5 h-4.5" />
                    <span>Pengaturan</span>
                </Link>
            </nav>

            <ToastContainer />
        </div>
    );
};
