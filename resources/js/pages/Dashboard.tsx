import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    Wrench, 
    Hourglass, 
    XCircle, 
    Calendar,
    PlusCircle,
    MapPin,
    History as HistoryIcon,
    Search,
    Heart,
    Car,
    Home as HomeIcon,
    ChevronRight,
    SlidersHorizontal,
    Check,
    ChevronLeft,
    Key,
    User as UserIcon,
    Play,
    Eye,
    Building2,
    Shield
} from 'lucide-react';
import { Card, CardContent, Button, Badge, toast, Dialog, TextArea, Input, Select } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { DRIVER_LIST } from '../constants/drivers';

interface CatalogAsset {
    id: number;
    name: string;
    category: 'Kendaraan' | 'Ruangan';
    status: 'Tersedia' | 'Sedang Dipakai' | 'Reserved' | 'Maintenance';
    location: string;
    image: string;
    specs: string[];
    plate?: string;
    capacity?: string;
    facilities?: string[];
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };
    
    const [loading, setLoading] = useState(true);
    const [dashData, setDashData] = useState<any>(null);
    const [allReservations, setAllReservations] = useState<any[]>([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [favorites, setFavorites] = useState<number[]>([]);

    // Calendar state
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    // Settings Form State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Modal states
    const [selectedAssetDetail, setSelectedAssetDetail] = useState<CatalogAsset | null>(null);
    const [assetDetailOpen, setAssetDetailOpen] = useState(false);
    
    // Instant Reservation Modal State
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [selectedAssetForRes, setSelectedAssetForRes] = useState<CatalogAsset | null>(null);
    const [resStartDate, setResStartDate] = useState('');
    const [resEndDate, setResEndDate] = useState('');
    const [resPurpose, setResPurpose] = useState('');
    const [resDestination, setResDestination] = useState('');
    const [resDriverRequired, setResDriverRequired] = useState(false);
    const [resDriverName, setResDriverName] = useState('');
    const [resNotes, setResNotes] = useState('');
    const [resSubmitting, setResSubmitting] = useState(false);

    // Official Vehicle Catalog Assets (15 Units with distinct HD photos)
    const vehicleAssets: CatalogAsset[] = [
        { id: 1, name: 'Toyota Fortuner', plate: 'D 1882 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'SUV Premium'] },
        { id: 2, name: 'Toyota Alphard', plate: 'B 1707 NZU', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1 / VIP', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'VIP Luxury'] },
        { id: 3, name: 'Toyota Kijang Innova', plate: 'D 1872 E', category: 'Kendaraan', status: 'Sedang Dipakai', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 4, name: 'Toyota Kijang Innova', plate: 'D 1870 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 5, name: 'Toyota Kijang Innova', plate: 'D 1869 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 6, name: 'Toyota Hilux', plate: 'D 8069 D', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80', specs: ['Double Cab', '4x4 Double Cab'] },
        { id: 7, name: 'Nissan X Trail', plate: 'D 1868 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80', specs: ['5 Kursi', 'SUV Medium'] },
        { id: 8, name: 'Toyota Camry 2.5 HV', plate: 'D 13', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1 / Pimpinan', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', specs: ['Sedan Hybrid', 'Mobil Dinas Pimpinan'] },
        { id: 9, name: 'Toyota Zenix 2.0 Q HV', plate: 'D 1041 C', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80', specs: ['Hybrid EV', 'Captain Seat'] },
        { id: 10, name: 'Toyota Zenix 2.0 G CVT', plate: 'D 1162 F', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', specs: ['CVT Automatic', '7 Kursi'] },
        { id: 11, name: 'Toyota Zenix 2.0 G CVT', plate: 'D 1056 F', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', specs: ['CVT Automatic', '7 Kursi'] },
        { id: 12, name: 'Isuzu Traga Box', plate: 'B 9455 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 13, name: 'Isuzu Traga Box', plate: 'B 9545 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1586191582056-a36c64639d6b?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 14, name: 'Isuzu Traga Box', plate: 'B 9543 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 15, name: 'Honda CB 150 R', plate: 'D 3044 F', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Motor', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', specs: ['Sepeda Motor', 'Kurir / Operasional'] }
    ];

    // Official Meeting Room Assets (4 Rooms)
    const roomAssets: CatalogAsset[] = [
        { id: 16, name: 'Ruang Rapat Bale Astama', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 2', image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80', capacity: '25 Orang', facilities: ['Smart TV', 'Proyektor', 'AC', 'Sound System', 'Wi-Fi'], specs: ['Kapasitas 25 Orang', 'Lantai 2'] },
        { id: 17, name: 'Ruang Rapat Nakula', category: 'Ruangan', status: 'Reserved', location: 'Lantai 3', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', capacity: '15 Orang', facilities: ['Video Conference', 'Glass Board', 'AC', 'Wi-Fi'], specs: ['Kapasitas 15 Orang', 'Lantai 3'] },
        { id: 18, name: 'Aula Catur Dharma', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 1', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', capacity: '100 Orang', facilities: ['Panggung Utama', 'Wireless Mic', 'Podium', 'AC Sentral', 'Wi-Fi'], specs: ['Kapasitas 100 Orang', 'Lantai 1'] },
        { id: 19, name: 'Ruang Rapat Sadewa', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 2', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', capacity: '12 Orang', facilities: ['LED Display', 'Executive Desk', 'AC', 'Wi-Fi'], specs: ['Kapasitas 12 Orang', 'Lantai 2'] }
    ];

    // Scroll Spy: Real-time Listener on scroll container & window for instant sidebar active highlight
    useEffect(() => {
        const sectionIds = ['sec-dashboard', 'sec-kendaraan', 'sec-ruangan', 'sec-kalender', 'sec-riwayat', 'sec-pengaturan'];
        
        const updateActiveSection = () => {
            const container = document.getElementById('snap-scroll-container');
            const scrollPos = container ? container.scrollTop + 180 : window.scrollY + 180;

            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const el = document.getElementById(sectionIds[i]);
                if (el) {
                    const top = el.offsetTop;
                    if (scrollPos >= top) {
                        window.dispatchEvent(new CustomEvent('ojk-active-section', { detail: sectionIds[i] }));
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
        
        updateActiveSection();
        const timer = setTimeout(updateActiveSection, 300);

        return () => {
            if (container) container.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('scroll', updateActiveSection);
            clearTimeout(timer);
        };
    }, []);

    const toggleFavorite = (id: number) => {
        setFavorites(prev => 
            prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
        );
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, resList] = await Promise.all([
                axios.get('/dashboard'),
                axios.get('/reservations')
            ]);
            if (dashRes.data) {
                setDashData(dashRes.data);
            }
            if (resList.data) {
                setAllReservations(resList.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const scrollToSection = (secId: string) => {
        const el = document.getElementById(secId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOpenReservationModal = (asset?: CatalogAsset) => {
        if (asset) {
            setSelectedAssetForRes(asset);
        } else {
            setSelectedAssetForRes(vehicleAssets[0]);
        }
        setResStartDate('');
        setResEndDate('');
        setResPurpose('');
        setResDestination('');
        setResDriverRequired(false);
        setResDriverName('');
        setResNotes('');
        setReservationModalOpen(true);
    };

    const handleCreateReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetForRes) return;
        if (!resStartDate || !resEndDate || !resPurpose) {
            toast.warning('Silakan lengkapi tanggal mulai, tanggal selesai, dan tujuan peminjaman.');
            return;
        }

        try {
            setResSubmitting(true);
            await axios.post('/reservations', {
                asset_id: selectedAssetForRes.id,
                start_date: resStartDate,
                end_date: resEndDate,
                purpose: resPurpose,
                destination: resDestination,
                driver_required: resDriverRequired,
                driver_name: resDriverRequired ? resDriverName : null,
                notes: resNotes
            });
            toast.success('Pengajuan reservasi berhasil dikirim dan menunggu persetujuan!');
            setReservationModalOpen(false);
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengajukan reservasi.');
        } finally {
            setResSubmitting(false);
        }
    };

    const handleCancelReservation = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan reservasi ini?')) return;
        try {
            await axios.post(`/reservations/${id}/cancel`);
            toast.success('Reservasi berhasil dibatalkan.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal membatalkan reservasi.');
        }
    };

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
            setPasswordSubmitting(true);
            await axios.post('/settings/password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            toast.success('Kata sandi berhasil diperbarui.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui kata sandi.');
        } finally {
            setPasswordSubmitting(false);
        }
    };

    // Filter Assets
    const filteredVehicles = vehicleAssets.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (item.plate && item.plate.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             item.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocFilter = selectedLocationFilter === 'all' || item.location.toLowerCase().includes(selectedLocationFilter.toLowerCase());
        const matchesStatusFilter = selectedStatusFilter === 'all' || 
            (selectedStatusFilter === 'available' && item.status === 'Tersedia') ||
            (selectedStatusFilter === 'in_use' && item.status === 'Sedang Dipakai') ||
            (selectedStatusFilter === 'reserved' && item.status === 'Reserved') ||
            (selectedStatusFilter === 'maintenance' && item.status === 'Maintenance');
        return matchesQuery && matchesLocFilter && matchesStatusFilter;
    });

    const filteredRooms = roomAssets.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocFilter = selectedLocationFilter === 'all' || item.location.toLowerCase().includes(selectedLocationFilter.toLowerCase());
        const matchesStatusFilter = selectedStatusFilter === 'all' || 
            (selectedStatusFilter === 'available' && item.status === 'Tersedia') ||
            (selectedStatusFilter === 'in_use' && item.status === 'Sedang Dipakai') ||
            (selectedStatusFilter === 'reserved' && item.status === 'Reserved') ||
            (selectedStatusFilter === 'maintenance' && item.status === 'Maintenance');
        return matchesQuery && matchesLocFilter && matchesStatusFilter;
    });

    // Calendar Helper Calculation
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calYear = currentMonthDate.getFullYear();
    const calMonth = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const handlePrevMonth = () => setCurrentMonthDate(new Date(calYear, calMonth - 1, 1));
    const handleNextMonth = () => setCurrentMonthDate(new Date(calYear, calMonth + 1, 1));

    const isSuperAdmin = user?.role === 'super_admin';
    const isValidator = user?.role === 'validator';
    const isPegawai = user?.role === 'pegawai' || (!isSuperAdmin && !isValidator);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3 font-sans">
                <svg className="animate-spin h-9 w-9 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold tracking-wide">Memuat Sistem Manajemen Aset OJK...</span>
            </div>
        );
    }

    return (
        <div className="font-sans">

            {/* ==========================================
                NON-PEGAWAI VIEWS (ADMIN / VALIDATOR)
                ========================================== */}
            {!isPegawai && (
                <div className="p-8 space-y-8">
                    {/* Header Greeting */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                {getGreeting()}, {user?.name || 'User'}! 👋
                            </h2>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                {isSuperAdmin && 'Overview sistem dan statistik penggunaan aset Kantor Regional 2 Jawa Barat.'}
                                {isValidator && 'Panel persetujuan reservasi dan jadwal peminjaman aset kantor.'}
                            </p>
                        </div>
                    </div>

                    {isSuperAdmin && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                <Card className="border-l-4 border-l-red-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aset</span>
                                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData?.stats?.total_assets ?? 19}</h4>
                                        </div>
                                        <Briefcase className="w-5 h-5 text-ojk-red" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-emerald-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Tersedia</span>
                                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData?.stats?.available ?? 17}</h4>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-amber-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Dipakai</span>
                                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData?.stats?.in_use ?? 0}</h4>
                                        </div>
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-purple-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData?.stats?.maintenance ?? 0}</h4>
                                        </div>
                                        <Wrench className="w-5 h-5 text-purple-600" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==========================================
                PEGAWAI FULL SCREEN ONE PAGE ENTERPRISE DASHBOARD (SPA)
                ========================================== */}
            {isPegawai && (
                <div className="w-full">

                    {/* ==========================================
                        SECTION 1: DASHBOARD HERO + STATS (100VH SNAP)
                        ========================================== */}
                    <section 
                        id="sec-dashboard" 
                        className="snap-start snap-always h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] flex flex-col justify-between p-6 md:p-8 space-y-4 shrink-0 transition-all duration-500 ease-in-out"
                    >
                        {/* Hero Video Banner Container (~65% height) */}
                        <div className="relative rounded-[24px] overflow-hidden flex-1 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between p-8 group">
                            
                            {/* Fullscreen Video Background */}
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                            >
                                <source src="/vidio ojk.mp4" type="video/mp4" />
                            </video>

                            {/* Dark Gradient Overlay for Maximum Legibility */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 backdrop-blur-[1px]"></div>

                            {/* Left Side: Brand Text & CTAs */}
                            <div className="relative z-10 space-y-4 max-w-xl text-white">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-widest text-red-300">
                                    <Building2 className="w-3.5 h-3.5 text-ojk-red" />
                                    <span>Otoritas Jasa Keuangan &bull; KR 2 Jawa Barat</span>
                                </div>

                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
                                    Layanan Reservasi Aset Kantor
                                </h2>

                                <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-md opacity-90">
                                    Kemudahan pengajuan fasilitas kendaraan dinas operasional dan ruang rapat terintegrasi untuk mendukung kegiatan kedinasan OJK Jawa Barat.
                                </p>

                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Button 
                                        onClick={() => handleOpenReservationModal()} 
                                        className="rounded-xl font-black flex items-center gap-2 shadow-lg text-xs bg-ojk-red text-white py-3 px-6 hover:bg-red-700 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Ajukan Reservasi Sekarang
                                    </Button>

                                    <Button 
                                        onClick={() => scrollToSection('sec-kendaraan')} 
                                        className="rounded-xl font-bold flex items-center gap-2 text-xs bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25 py-3 px-5 hover:scale-102 transition-all cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat Katalog Asset
                                    </Button>
                                </div>
                            </div>

                            {/* Right Side: Glassmorphism Modern Quick Calendar */}
                            <div className="relative z-10 hidden lg:block w-80 shrink-0">
                                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl text-white space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-red-400" />
                                            <span className="text-xs font-black">Agenda Hari Ini</span>
                                        </div>
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                                            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
                                            <span className="text-[9.5px] font-extrabold text-red-300 block uppercase">Ruang Rapat Bale Astama</span>
                                            <p className="text-[11px] font-bold truncate">Rapat Koordinasi Pengawasan Lembaga Jasa Keuangan</p>
                                            <span className="text-[9px] text-slate-300 block">09:00 - 12:00 WIB</span>
                                        </div>
                                        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
                                            <span className="text-[9.5px] font-extrabold text-emerald-300 block uppercase">Toyota Fortuner (D 1882 E)</span>
                                            <p className="text-[11px] font-bold truncate">Perjalanan Dinas Kunjungan Kerja Bandung</p>
                                            <span className="text-[9px] text-slate-300 block">13:30 - 17:00 WIB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom 4 Enterprise Stat Cards ONLY (~35% height) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-red-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Asset</span>
                                        <h4 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">19</h4>
                                        <span className="text-[9.5px] font-semibold text-slate-400">Kendaraan & Ruangan</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-5 h-5 text-ojk-red" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-emerald-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Asset Tersedia</span>
                                        <h4 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.available ?? 17}</h4>
                                        <span className="text-[9.5px] font-semibold text-emerald-600 font-bold">Siap Dipinjam</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-amber-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Dipakai</span>
                                        <h4 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.in_use ?? 0}</h4>
                                        <span className="text-[9.5px] font-semibold text-amber-600 font-bold">Aktif Digunakan</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-purple-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                        <h4 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.maintenance ?? 0}</h4>
                                        <span className="text-[9.5px] font-semibold text-purple-600 font-bold">Perawatan Rutin</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                        <Wrench className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 2: KENDARAAN DINAS (SINGLE PAGE SPA SECTION)
                        ========================================== */}
                    <section 
                        id="sec-kendaraan" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        {/* Section Header Banner & Search Controls */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                            <Car className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                            Kendaraan Dinas (15 Unit)
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Pilih kendaraan dinas operasional yang tersedia untuk perjalanan dinas.
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => handleOpenReservationModal()} 
                                    className="rounded-xl font-bold flex items-center gap-1.5 text-xs bg-ojk-red text-white py-2.5 px-5 shadow-sm self-start sm:self-auto cursor-pointer"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Ajukan Reservasi
                                </Button>
                            </div>

                            {/* Filter Bar */}
                            <Card className="p-3 rounded-[16px] border border-slate-100 dark:border-slate-800 shadow-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <Input
                                            placeholder="Cari kendaraan atau plat nomor..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 text-xs py-2 rounded-xl"
                                        />
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                                    </div>

                                    <Select
                                        value={selectedLocationFilter}
                                        onChange={(e) => setSelectedLocationFilter(e.target.value)}
                                        className="text-xs py-2 rounded-xl"
                                    >
                                        <option value="all">Semua Lokasi Parkir</option>
                                        <option value="basement">Basement Lt. 1</option>
                                        <option value="parkiran">Parkiran Logistik / Motor</option>
                                    </Select>

                                    <Select
                                        value={selectedStatusFilter}
                                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                        className="text-xs py-2 rounded-xl"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="available">Tersedia</option>
                                        <option value="in_use">Sedang Dipakai</option>
                                        <option value="reserved">Reserved</option>
                                    </Select>
                                </div>
                            </Card>
                        </div>

                        {/* Marketplace Card Grid (Spacious natural layout within SPA scroll) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVehicles.map(vehicle => (
                                <Card key={vehicle.id} className="rounded-[20px] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900 rounded-t-[20px]">
                                        <img 
                                            src={vehicle.image} 
                                            alt={vehicle.name} 
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                        <div className="absolute top-2.5 left-2.5">
                                            {vehicle.status === 'Tersedia' && (
                                                <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                    Tersedia
                                                </span>
                                            )}
                                            {vehicle.status === 'Sedang Dipakai' && (
                                                <span className="bg-amber-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                    Sedang Dipakai
                                                </span>
                                            )}
                                            {vehicle.status === 'Reserved' && (
                                                <span className="bg-blue-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                    Reserved
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="bg-black/80 backdrop-blur-md text-white border border-white/20 text-[9.5px] font-mono font-black px-2 py-0.5 rounded-md">
                                                {vehicle.plate}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1.5">
                                            <h4 className="text-sm font-extrabold text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                {vehicle.name}
                                            </h4>

                                            <p className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                                <span>{vehicle.location}</span>
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 text-[9.5px] text-slate-600 dark:text-slate-400 font-semibold pt-0.5">
                                                {vehicle.specs.map((spec, i) => (
                                                    <span key={i} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-[11px] font-bold py-2 rounded-xl cursor-pointer"
                                                onClick={() => { setSelectedAssetDetail(vehicle); setAssetDetailOpen(true); }}
                                            >
                                                Detail
                                            </Button>
                                            
                                            <Button 
                                                variant="primary" 
                                                className="w-full text-[11px] font-bold py-2 rounded-xl bg-ojk-red hover:bg-red-700 text-white cursor-pointer shadow-sm"
                                                onClick={() => handleOpenReservationModal(vehicle)}
                                            >
                                                Reservasi
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 3: RUANG RAPAT & AULA (SINGLE PAGE SPA SECTION)
                        ========================================== */}
                    <section 
                        id="sec-ruangan" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                            <HomeIcon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                            Ruang Rapat & Aula (4 Ruang)
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Pilih ruangan sesuai kapasitas dan kebutuhan agenda rapat Anda.
                                    </p>
                                </div>

                                <Button 
                                    onClick={() => handleOpenReservationModal(roomAssets[0])} 
                                    className="rounded-xl font-bold flex items-center gap-1.5 text-xs bg-ojk-red text-white py-2.5 px-5 shadow-sm self-start sm:self-auto cursor-pointer"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Ajukan Ruangan
                                </Button>
                            </div>
                        </div>

                        {/* Large Cards Grid (Spacious natural layout within SPA scroll) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredRooms.map(room => (
                                <Card key={room.id} className="rounded-[18px] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <div className="relative h-48 md:h-auto md:w-1/2 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                        <img 
                                            src={room.image} 
                                            alt={room.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                        <div className="absolute top-2.5 left-2.5">
                                            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                {room.status}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2.5 left-2.5">
                                            <span className="bg-black/70 backdrop-blur-md text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                                                {room.capacity}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 md:w-1/2 flex flex-col justify-between space-y-3">
                                        <div className="space-y-2">
                                            <h4 className="text-base font-extrabold text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                {room.name}
                                            </h4>

                                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                <span>Lokasi: {room.location}</span>
                                            </p>

                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Fasilitas Ruangan:</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {room.facilities?.map((fac, i) => (
                                                        <span key={i} className="text-[9.5px] font-semibold bg-red-50 text-ojk-red dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded-md">
                                                            {fac}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-[11px] font-bold py-2 rounded-xl cursor-pointer"
                                                onClick={() => { setSelectedAssetDetail(room); setAssetDetailOpen(true); }}
                                            >
                                                Detail
                                            </Button>
                                            
                                            <Button 
                                                variant="primary" 
                                                className="w-full text-[11px] font-bold py-2 rounded-xl bg-ojk-red hover:bg-red-700 text-white cursor-pointer shadow-sm"
                                                onClick={() => handleOpenReservationModal(room)}
                                            >
                                                Reservasi
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 4: KALENDER RESERVASI (100VH SNAP)
                        ========================================== */}
                    <section 
                        id="sec-kalender" 
                        className="snap-start snap-always h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] flex flex-col justify-between p-6 md:p-8 space-y-4 shrink-0 transition-all duration-500 ease-in-out"
                    >
                        <div className="space-y-1 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Kalender Schedule & Agenda
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                                Pantau jadwal penggunaan aset dan kegiatan kantor secara real-time.
                            </p>
                        </div>

                        {/* Calendar Widget Container */}
                        <Card className="p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between overflow-hidden">
                            
                            {/* Controls */}
                            <div className="flex justify-between items-center shrink-0 mb-3">
                                <div className="flex items-center space-x-2">
                                    <h4 className="text-lg font-extrabold text-slate-850 dark:text-white">
                                        {monthNames[calMonth]} {calYear}
                                    </h4>
                                    <span className="bg-red-50 text-ojk-red dark:bg-red-950/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        Realtime Agenda
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Button variant="outline" size="sm" onClick={handlePrevMonth} className="rounded-xl">
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentMonthDate(new Date())} className="rounded-xl text-[11px] font-bold">
                                        Bulan Ini
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNextMonth} className="rounded-xl">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Header Days */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
                            </div>

                            {/* Days Cells (Fits inside remaining height) */}
                            <div className="grid grid-cols-7 gap-1.5 flex-1 py-2 overflow-y-auto custom-scrollbar">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-slate-50/40 dark:bg-slate-950/30 rounded-xl min-h-[50px]"></div>
                                ))}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const dayDateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                    const dayReservations = allReservations.filter(res => (res.start_date ? res.start_date.split('T')[0] : '') === dayDateStr);

                                    return (
                                        <div key={dayNum} className="p-1.5 bg-slate-50/80 dark:bg-slate-850/40 rounded-xl border border-slate-100/80 dark:border-slate-800/60 flex flex-col justify-between hover:border-red-200 transition-colors min-h-[50px]">
                                            <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">{dayNum}</span>
                                            
                                            <div className="space-y-0.5 overflow-y-auto max-h-10">
                                                {dayReservations.map((r: any, idx: number) => (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => toast.info(`Reservasi #${r.id}: ${r.asset?.name || 'Aset'}`)}
                                                        className="text-[8.5px] font-bold p-0.5 rounded bg-ojk-red text-white truncate cursor-pointer"
                                                    >
                                                        {r.asset?.name || 'Aset'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </Card>
                    </section>

                    {/* ==========================================
                        SECTION 5: RIWAYAT RESERVASI (100VH SNAP)
                        ========================================== */}
                    <section 
                        id="sec-riwayat" 
                        className="snap-start snap-always h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] flex flex-col justify-between p-6 md:p-8 space-y-4 shrink-0 transition-all duration-500 ease-in-out"
                    >
                        <div className="space-y-1 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <HistoryIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Riwayat Reservasi Saya
                                </h3>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                                Daftar riwayat dan timeline status pengajuan reservasi yang Anda ajukan.
                            </p>
                        </div>

                        {/* History Cards Container */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                            {allReservations.length > 0 ? (
                                allReservations.map((res: any) => (
                                    <Card key={res.id} className="p-4 rounded-[16px] border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-slate-400">#RSV-{res.id}</span>
                                                    <Badge status={res.status} />
                                                </div>

                                                <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">
                                                    {res.asset?.name || 'Aset Kantor'}
                                                </h4>

                                                <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {res.start_date ? new Date(res.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        {res.purpose || 'Keperluan Dinas'}
                                                    </span>
                                                    {res.driver_name && (
                                                        <span className="flex items-center gap-1 text-ojk-red font-bold">
                                                            <UserIcon className="w-3 h-3" />
                                                            Driver: {res.driver_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {res.status === 'pending' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="rounded-xl border-red-200 text-red-650 hover:bg-red-50 cursor-pointer text-xs font-bold"
                                                    onClick={() => handleCancelReservation(res.id)}
                                                >
                                                    Batalkan Pengajuan
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="p-12 text-center text-slate-400 font-semibold space-y-2 rounded-[18px]">
                                    <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                    <p className="text-xs">Belum ada riwayat reservasi yang diajukan.</p>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 6: PENGATURAN (100VH SNAP)
                        ========================================== */}
                    <section 
                        id="sec-pengaturan" 
                        className="snap-start snap-always h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] flex flex-col justify-between p-6 md:p-8 space-y-4 shrink-0 transition-all duration-500 ease-in-out"
                    >
                        <div className="space-y-1 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <SlidersHorizontal className="w-4 h-4" />
                                </div>
                                <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Pengaturan Akun & Profil
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Kelola informasi profil dan ubah kata sandi akun Anda.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-5 custom-scrollbar">
                            <Card className="p-5 rounded-[18px] border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-ojk-red text-white font-black text-lg flex items-center justify-center shadow-md">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'OK'}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-base font-extrabold text-slate-850 dark:text-white">{user?.name || 'User'}</h4>
                                        <span className="text-xs text-slate-400 font-medium">{user?.nip || 'NIP Pegawai'} &bull; {user?.division?.name || 'Regional 2 Jawa Barat'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                                        <span className="font-semibold text-slate-400">Email Resmi</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-850">
                                        <span className="font-semibold text-slate-400">Peran / Role</span>
                                        <span className="font-extrabold text-ojk-red uppercase tracking-wider">{user?.role}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="font-semibold text-slate-400">Kantor Unit</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">Regional 2 Jawa Barat</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5 rounded-[18px] border border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-ojk-red" />
                                        Ubah Kata Sandi
                                    </h4>
                                    <p className="text-[10px] text-slate-400">Perbarui kata sandi akun Anda secara berkala.</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-2.5">
                                    <Input
                                        type="password"
                                        label="Kata Sandi Lama"
                                        placeholder="••••••••"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        className="text-xs py-2 rounded-xl"
                                    />
                                    <Input
                                        type="password"
                                        label="Kata Sandi Baru"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="text-xs py-2 rounded-xl"
                                    />
                                    <Input
                                        type="password"
                                        label="Konfirmasi Kata Sandi Baru"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="text-xs py-2 rounded-xl"
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={passwordSubmitting}
                                        className="w-full text-xs font-bold py-2 rounded-xl bg-ojk-red text-white cursor-pointer"
                                    >
                                        {passwordSubmitting ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </section>

                </div>
            )}

            {/* ==========================================
                INSTANT RESERVATION FORM MODAL DIALOG
                ========================================== */}
            <Dialog
                isOpen={reservationModalOpen}
                onClose={() => setReservationModalOpen(false)}
                title={`Form Reservasi - ${selectedAssetForRes?.name || 'Aset Kantor'}`}
                size="md"
            >
                <form onSubmit={handleCreateReservationSubmit} className="space-y-4 text-xs font-sans">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Aset Dipilih:</span>
                            <span className="font-extrabold text-slate-800 dark:text-white text-sm">{selectedAssetForRes?.name}</span>
                        </div>
                        <span className="bg-ojk-red text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {selectedAssetForRes?.category}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="datetime-local"
                            label="Waktu Mulai Pinjam *"
                            value={resStartDate}
                            onChange={(e) => setResStartDate(e.target.value)}
                            required
                            className="text-xs py-2 rounded-xl"
                        />
                        <Input
                            type="datetime-local"
                            label="Waktu Selesai Pinjam *"
                            value={resEndDate}
                            onChange={(e) => setResEndDate(e.target.value)}
                            required
                            className="text-xs py-2 rounded-xl"
                        />
                    </div>

                    <TextArea
                        label="Tujuan & Keperluan Peminjaman *"
                        placeholder="Contoh: Perjalanan dinas rapat koordinasi ke Kantor Cabang Bandung..."
                        value={resPurpose}
                        onChange={(e) => setResPurpose(e.target.value)}
                        required
                        className="text-xs py-2 rounded-xl min-h-[70px]"
                    />

                    {selectedAssetForRes?.category === 'Kendaraan' && (
                        <React.Fragment>
                            <Input
                                label="Tujuan Perjalanan (Lokasi / Kota)"
                                placeholder="Contoh: Bandung / Jakarta / Cirebon"
                                value={resDestination}
                                onChange={(e) => setResDestination(e.target.value)}
                                className="text-xs py-2 rounded-xl"
                            />

                            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2">
                                <label className="flex items-center space-x-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={resDriverRequired} 
                                        onChange={(e) => setResDriverRequired(e.target.checked)}
                                        className="rounded border-slate-300 text-ojk-red focus:ring-ojk-red cursor-pointer" 
                                    />
                                    <span>Membutuhkan Pengemudi (Driver)</span>
                                </label>

                                {resDriverRequired && (
                                    <div className="pt-1">
                                        <Select
                                            label="Pilih Pengemudi (Driver)"
                                            value={resDriverName}
                                            onChange={(e) => setResDriverName(e.target.value)}
                                            className="text-xs py-2 rounded-xl"
                                        >
                                            <option value="">-- Pilih Driver Resmi --</option>
                                            {DRIVER_LIST.map(drv => (
                                                <option key={drv.id} value={drv.name}>{drv.name} ({drv.nip})</option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    )}

                    <TextArea
                        label="Catatan Tambahan (Opsional)"
                        placeholder="Tambahkan catatan khusus jika ada..."
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                        className="text-xs py-2 rounded-xl min-h-[60px]"
                    />

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" type="button" onClick={() => setReservationModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={resSubmitting} className="bg-ojk-red text-white">
                            {resSubmitting ? 'Mengirim...' : 'Kirim Reservasi Sekarang'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Asset Detail Dialog */}
            <Dialog
                isOpen={assetDetailOpen}
                onClose={() => { setAssetDetailOpen(false); setSelectedAssetDetail(null); }}
                title={selectedAssetDetail?.name || 'Detail Aset Office'}
                size="md"
            >
                {selectedAssetDetail && (
                    <div className="space-y-5 text-xs font-sans">
                        <div className="relative h-48 rounded-2xl overflow-hidden">
                            <img src={selectedAssetDetail.image} alt={selectedAssetDetail.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3">
                                <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs">
                                    {selectedAssetDetail.category}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{selectedAssetDetail.name}</h4>
                            <p className="text-slate-450 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                Lokasi: {selectedAssetDetail.location} &bull; Status: <strong className="text-slate-700 dark:text-slate-200">{selectedAssetDetail.status}</strong>
                            </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Spesifikasi & Fasilitas:</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedAssetDetail.specs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-850 rounded-xl font-semibold">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{spec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setAssetDetailOpen(false)}>
                                Tutup
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => { setAssetDetailOpen(false); handleOpenReservationModal(selectedAssetDetail); }}
                            >
                                Ajukan Reservasi Aset Ini
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

        </div>
    );
};
