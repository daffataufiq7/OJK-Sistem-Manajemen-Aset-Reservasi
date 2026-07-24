import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell, 
    Legend
} from 'recharts';
import { 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    Wrench, 
    Users, 
    Hourglass, 
    XCircle, 
    TrendingUp, 
    Calendar,
    ArrowRight,
    PlusCircle,
    Info,
    CalendarCheck,
    MapPin,
    ArrowUpRight,
    History as HistoryIcon,
    Search,
    Filter,
    Heart,
    Car,
    Home as HomeIcon,
    Laptop,
    Box,
    Sparkles,
    ChevronRight,
    SlidersHorizontal,
    HelpCircle,
    Check,
    ChevronLeft,
    Shield,
    Key,
    User as UserIcon,
    Sun,
    Moon,
    FileText,
    CheckSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, toast, Dialog, TextArea, Input, Select } from '../components/UI';
import { useNavigate, Link } from 'react-router-dom';
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
    const { user, logout } = useAuth();
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

    // Filter States for Overview Section
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

    // Rejection Modal State for Validator
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Official Vehicle Catalog Assets (15 Units)
    const vehicleAssets: CatalogAsset[] = [
        { id: 1, name: 'Toyota Fortuner', plate: 'D 1882 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'SUV Premium'] },
        { id: 2, name: 'Toyota Alphard', plate: 'B 1707 NZU', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1 / VIP', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'VIP Luxury'] },
        { id: 3, name: 'Toyota Kijang Innova', plate: 'D 1872 E', category: 'Kendaraan', status: 'Sedang Dipakai', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 4, name: 'Toyota Kijang Innova', plate: 'D 1870 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 5, name: 'Toyota Kijang Innova', plate: 'D 1869 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['7 Kursi', 'MPV Operasional'] },
        { id: 6, name: 'Toyota Hilux', plate: 'D 8069 D', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', specs: ['Double Cab', '4x4 Double Cab'] },
        { id: 7, name: 'Nissan X Trail', plate: 'D 1868 E', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', specs: ['5 Kursi', 'SUV Medium'] },
        { id: 8, name: 'Toyota Camry 2.5 HV', plate: 'D 13', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1 / Pimpinan', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', specs: ['Sedan Hybrid', 'Mobil Dinas Pimpinan'] },
        { id: 9, name: 'Toyota Zenix 2.0 Q HV', plate: 'D 1041 C', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['Hybrid EV', 'Captain Seat'] },
        { id: 10, name: 'Toyota Zenix 2.0 G CVT', plate: 'D 1162 F', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['CVT Automatic', '7 Kursi'] },
        { id: 11, name: 'Toyota Zenix 2.0 G CVT', plate: 'D 1056 F', category: 'Kendaraan', status: 'Tersedia', location: 'Basement Lt. 1', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', specs: ['CVT Automatic', '7 Kursi'] },
        { id: 12, name: 'Isuzu Traga Box', plate: 'B 9455 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 13, name: 'Isuzu Traga Box', plate: 'B 9545 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 14, name: 'Isuzu Traga Box', plate: 'B 9543 PQW', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Logistik', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', specs: ['Angkutan Barang', 'Box Logistik'] },
        { id: 15, name: 'Honda CB 150 R', plate: 'D 3044 F', category: 'Kendaraan', status: 'Tersedia', location: 'Parkiran Motor', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', specs: ['Sepeda Motor', 'Kurir / Operasional'] }
    ];

    // Official Meeting Room Assets (4 Rooms)
    const roomAssets: CatalogAsset[] = [
        { id: 16, name: 'Ruang Rapat Bale Astama', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 2', image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80', capacity: '25 Orang', facilities: ['Smart TV', 'Proyektor', 'AC', 'Sound System', 'Wi-Fi'], specs: ['Kapasitas 25 Orang', 'Lantai 2'] },
        { id: 17, name: 'Ruang Rapat Nakula', category: 'Ruangan', status: 'Reserved', location: 'Lantai 3', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', capacity: '15 Orang', facilities: ['Video Conference', 'Glass Board', 'AC', 'Wi-Fi'], specs: ['Kapasitas 15 Orang', 'Lantai 3'] },
        { id: 18, name: 'Aula Catur Dharma', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 1', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', capacity: '100 Orang', facilities: ['Panggung Utama', 'Wireless Mic', 'Podium', 'AC Sentral', 'Wi-Fi'], specs: ['Kapasitas 100 Orang', 'Lantai 1'] },
        { id: 19, name: 'Ruang Rapat Sadewa', category: 'Ruangan', status: 'Tersedia', location: 'Lantai 2', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', capacity: '12 Orang', facilities: ['LED Display', 'Executive Desk', 'AC', 'Wi-Fi'], specs: ['Kapasitas 12 Orang', 'Lantai 2'] }
    ];

    const allCatalogAssets = [...vehicleAssets, ...roomAssets];

    // Scroll Spy IntersectionObserver setup
    useEffect(() => {
        const sectionIds = ['sec-dashboard', 'sec-kendaraan', 'sec-ruangan', 'sec-kalender', 'sec-riwayat', 'sec-pengaturan'];
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.dispatchEvent(new CustomEvent('ojk-active-section', { detail: entry.target.id }));
                }
            });
        }, { threshold: 0.25 });

        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
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

    const handleApprove = async (id: number) => {
        try {
            setSubmitting(true);
            await axios.post(`/reservations/${id}/approve`);
            toast.success('Peminjaman aset berhasil disetujui.');
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyetujui peminjaman.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim() || rejectionReason.length < 5) {
            toast.warning('Silakan isi alasan penolakan (minimal 5 karakter).');
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(`/reservations/${selectedRequest.id}/reject`, {
                rejection_reason: rejectionReason
            });
            toast.success('Peminjaman aset berhasil ditolak.');
            setRejectionOpen(false);
            setRejectionReason('');
            setSelectedRequest(null);
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menolak peminjaman.');
        } finally {
            setSubmitting(false);
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

    // Filter Assets for Search & Dropdowns
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
        <div className="space-y-16 font-sans pb-24">

            {/* ==========================================
                NON-PEGAWAI VIEWS (ADMIN / VALIDATOR)
                ========================================== */}
            {!isPegawai && (
                <div className="space-y-8">
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

                    {isValidator && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Approval</span>
                                            <h4 className="text-2xl font-extrabold text-amber-600">{dashData?.stats?.pending_request ?? 0}</h4>
                                        </div>
                                        <Hourglass className="w-6 h-6 text-amber-500" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-emerald-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disetujui Hari Ini</span>
                                            <h4 className="text-2xl font-extrabold text-emerald-600">{dashData?.stats?.approved_today ?? 0}</h4>
                                        </div>
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-red-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ditolak Hari Ini</span>
                                            <h4 className="text-2xl font-extrabold text-red-600">{dashData?.stats?.rejected_today ?? 0}</h4>
                                        </div>
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-blue-600">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Dipinjam</span>
                                            <h4 className="text-2xl font-extrabold text-blue-600">{dashData?.stats?.in_use ?? 0}</h4>
                                        </div>
                                        <Clock className="w-6 h-6 text-blue-600" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==========================================
                PEGAWAI ONE PAGE ENTERPRISE DASHBOARD (SPA)
                ========================================== */}
            {isPegawai && (
                <React.Fragment>

                    {/* ==========================================
                        SECTION 1: DASHBOARD OVERVIEW & CARDS
                        ========================================== */}
                    <section id="sec-dashboard" className="scroll-mt-24 space-y-8 animate-fade-in duration-300">
                        
                        {/* Header Greeting */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">
                                    {getGreeting()}, {user?.name || 'Pegawai'}! 👋
                                </h2>
                                <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                    Selamat datang di Sistem Reservasi Aset Kantor Regional 2 Jawa Barat.
                                </p>
                            </div>
                            <Button 
                                onClick={() => handleOpenReservationModal()} 
                                className="rounded-xl font-bold flex items-center gap-2 shadow-md text-xs bg-ojk-red text-white py-3 px-5 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                            >
                                <PlusCircle className="w-4.5 h-4.5" />
                                Ajukan Reservasi Baru
                            </Button>
                        </div>

                        {/* Enterprise Stat Cards Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-red-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Asset</span>
                                        <h4 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">19</h4>
                                        <span className="text-[10px] font-semibold text-slate-400">Kendaraan & Ruangan</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-6 h-6 text-ojk-red" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-emerald-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asset Tersedia</span>
                                        <h4 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.available ?? 17}</h4>
                                        <span className="text-[10px] font-semibold text-emerald-600 font-bold">Siap Dipinjam</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-amber-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Dipakai</span>
                                        <h4 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.in_use ?? 0}</h4>
                                        <span className="text-[10px] font-semibold text-amber-600 font-bold">Aktif Digunakan</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-purple-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                        <h4 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.maintenance ?? 0}</h4>
                                        <span className="text-[10px] font-semibold text-purple-600 font-bold">Perawatan Rutin</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                        <Wrench className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Search & Multi-Filter Control Bar */}
                        <Card className="p-5 rounded-[18px] shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                                
                                {/* Search Input */}
                                <div className="relative lg:col-span-4">
                                    <Input
                                        placeholder="Cari kendaraan, plat nomor, atau ruang rapat..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 text-xs py-3 rounded-xl"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                </div>

                                {/* Category Dropdown */}
                                <div className="lg:col-span-2">
                                    <Select
                                        value={selectedCategoryFilter}
                                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                        className="text-xs py-3 rounded-xl"
                                    >
                                        <option value="all">Semua Kategori</option>
                                        <option value="kendaraan">Kendaraan Dinas</option>
                                        <option value="ruangan">Ruang Rapat & Aula</option>
                                    </Select>
                                </div>

                                {/* Location Dropdown */}
                                <div className="lg:col-span-2">
                                    <Select
                                        value={selectedLocationFilter}
                                        onChange={(e) => setSelectedLocationFilter(e.target.value)}
                                        className="text-xs py-3 rounded-xl"
                                    >
                                        <option value="all">Semua Lokasi</option>
                                        <option value="basement">Basement Lt. 1</option>
                                        <option value="lantai 1">Lantai 1</option>
                                        <option value="lantai 2">Lantai 2</option>
                                        <option value="lantai 3">Lantai 3</option>
                                        <option value="parkiran">Parkiran Logistik</option>
                                    </Select>
                                </div>

                                {/* Status Dropdown */}
                                <div className="lg:col-span-2">
                                    <Select
                                        value={selectedStatusFilter}
                                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                        className="text-xs py-3 rounded-xl"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="available">Tersedia</option>
                                        <option value="in_use">Sedang Dipakai</option>
                                        <option value="reserved">Reserved</option>
                                    </Select>
                                </div>

                                {/* Action Button */}
                                <div className="lg:col-span-2">
                                    <Button 
                                        variant="primary" 
                                        className="w-full text-xs font-bold py-3 rounded-xl bg-ojk-red text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                        onClick={() => handleOpenReservationModal()}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Ajukan Reservasi</span>
                                    </Button>
                                </div>

                            </div>
                        </Card>
                    </section>

                    {/* ==========================================
                        SECTION 2: KENDARAAN DINAS CATALOG
                        ========================================== */}
                    <section id="sec-kendaraan" className="scroll-mt-24 min-h-screen py-12 border-t border-slate-100 dark:border-slate-800/60 space-y-8 animate-fade-in duration-300">
                        
                        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <Car className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Kendaraan Dinas
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Pilih kendaraan dinas yang tersedia untuk reservasi perjalanan dinas & operasional kantor.
                            </p>
                        </div>

                        {/* Marketplace / Netflix-Style Large Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map(vehicle => (
                                    <Card key={vehicle.id} className="rounded-[18px] overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img 
                                                src={vehicle.image} 
                                                alt={vehicle.name} 
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3">
                                                {vehicle.status === 'Tersedia' && (
                                                    <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                                                        Tersedia
                                                    </span>
                                                )}
                                                {vehicle.status === 'Sedang Dipakai' && (
                                                    <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                                                        Sedang Dipakai
                                                    </span>
                                                )}
                                                {vehicle.status === 'Reserved' && (
                                                    <span className="bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                                                        Reserved
                                                    </span>
                                                )}
                                            </div>

                                            {/* Plate Number */}
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-black/75 backdrop-blur-md text-white border border-white/20 text-[10px] font-mono font-black px-2.5 py-1 rounded-lg tracking-wider shadow-md">
                                                    {vehicle.plate}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={() => toggleFavorite(vehicle.id)}
                                                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-red-600 transition-colors shadow-md cursor-pointer"
                                                title="Simpan Favorit"
                                            >
                                                <Heart className={`w-4 h-4 ${favorites.includes(vehicle.id) ? 'fill-red-600 text-red-600' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <h4 className="text-base font-black text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                    {vehicle.name}
                                                </h4>

                                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                    <span>{vehicle.location}</span>
                                                </p>

                                                <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-600 font-semibold pt-1">
                                                    {vehicle.specs.map((spec, i) => (
                                                        <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                                                    onClick={() => { setSelectedAssetDetail(vehicle); setAssetDetailOpen(true); }}
                                                >
                                                    Detail
                                                </Button>
                                                
                                                <Button 
                                                    variant="primary" 
                                                    className="w-full text-xs font-bold py-2.5 rounded-xl bg-ojk-red hover:bg-red-700 text-white cursor-pointer shadow-sm"
                                                    onClick={() => handleOpenReservationModal(vehicle)}
                                                >
                                                    Reservasi
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-slate-400 font-semibold space-y-2">
                                    <Car className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p>Tidak ada kendaraan dinas yang cocok dengan pencarian.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 3: RUANG RAPAT & AULA CATALOG
                        ========================================== */}
                    <section id="sec-ruangan" className="scroll-mt-24 min-h-screen py-12 border-t border-slate-100 dark:border-slate-800/60 space-y-8 animate-fade-in duration-300">
                        
                        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <HomeIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Ruang Rapat & Aula
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Pilih ruangan sesuai kebutuhan rapat, aula kegiatan, atau pertemuan koordinasi.
                            </p>
                        </div>

                        {/* Large Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map(room => (
                                    <Card key={room.id} className="rounded-[18px] overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row justify-between group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="relative h-60 md:h-auto md:w-1/2 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                            <img 
                                                src={room.image} 
                                                alt={room.name} 
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                                                    {room.status}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 left-3">
                                                <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                                    {room.capacity}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 md:w-1/2 flex flex-col justify-between space-y-4">
                                            <div className="space-y-3">
                                                <h4 className="text-lg font-black text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                    {room.name}
                                                </h4>

                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                    <span>Lokasi: {room.location}</span>
                                                </p>

                                                <div className="space-y-1.5">
                                                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Fasilitas Ruangan:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {room.facilities?.map((fac, i) => (
                                                            <span key={i} className="text-[10px] font-semibold bg-red-50 text-ojk-red dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 rounded-md">
                                                                {fac}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                                                    onClick={() => { setSelectedAssetDetail(room); setAssetDetailOpen(true); }}
                                                >
                                                    Detail
                                                </Button>
                                                
                                                <Button 
                                                    variant="primary" 
                                                    className="w-full text-xs font-bold py-2.5 rounded-xl bg-ojk-red hover:bg-red-700 text-white cursor-pointer shadow-sm"
                                                    onClick={() => handleOpenReservationModal(room)}
                                                >
                                                    Reservasi
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-slate-400 font-semibold space-y-2">
                                    <HomeIcon className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p>Tidak ada ruang rapat yang cocok dengan pencarian.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 4: KALENDER
                        ========================================== */}
                    <section id="sec-kalender" className="scroll-mt-24 min-h-screen py-12 border-t border-slate-100 dark:border-slate-800/60 space-y-8 animate-fade-in duration-300">
                        
                        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Kalender Schedule & Agenda
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Pantau seluruh jadwal reservasi dan kegiatan penggunaan aset kantor secara real-time.
                            </p>
                        </div>

                        {/* Interactive Full Calendar Widget */}
                        <Card className="p-6 rounded-[18px] shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                            
                            {/* Calendar Header Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center space-x-3">
                                    <h4 className="text-xl font-extrabold text-slate-850 dark:text-white">
                                        {monthNames[calMonth]} {calYear}
                                    </h4>
                                    <span className="bg-red-50 text-ojk-red dark:bg-red-950/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                                        Realtime Agenda
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={handlePrevMonth} className="rounded-xl">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentMonthDate(new Date())} className="rounded-xl text-xs font-bold">
                                        Bulan Ini
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNextMonth} className="rounded-xl">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Grid Calendar Header Days */}
                            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase tracking-wider py-2 border-b border-slate-100 dark:border-slate-800">
                                <div>Minggu</div>
                                <div>Senin</div>
                                <div>Selasa</div>
                                <div>Rabu</div>
                                <div>Kamis</div>
                                <div>Jumat</div>
                                <div>Sabtu</div>
                            </div>

                            {/* Calendar Days Cells */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty offset cells */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-24 bg-slate-50/40 dark:bg-slate-950/30 rounded-xl"></div>
                                ))}

                                {/* Actual Days */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const dayDateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                    
                                    // Find reservations matching this day
                                    const dayReservations = allReservations.filter(res => {
                                        const resStart = res.start_date ? res.start_date.split('T')[0] : '';
                                        return resStart === dayDateStr;
                                    });

                                    return (
                                        <div key={dayNum} className="h-24 p-2 bg-slate-50/70 dark:bg-slate-850/40 rounded-xl border border-slate-100/80 dark:border-slate-800/60 flex flex-col justify-between hover:border-red-200 transition-colors">
                                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{dayNum}</span>
                                            
                                            <div className="space-y-1 overflow-y-auto max-h-14">
                                                {dayReservations.map((r: any, idx: number) => (
                                                    <div 
                                                        key={idx} 
                                                        onClick={() => toast.info(`Reservasi #${r.id}: ${r.asset?.name || 'Aset'} oleh ${r.user?.name || 'User'}`)}
                                                        className="text-[9px] font-bold p-1 rounded-md bg-ojk-red text-white truncate cursor-pointer hover:bg-red-700"
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
                        SECTION 5: RIWAYAT
                        ========================================== */}
                    <section id="sec-riwayat" className="scroll-mt-24 min-h-screen py-12 border-t border-slate-100 dark:border-slate-800/60 space-y-8 animate-fade-in duration-300">
                        
                        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <HistoryIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Riwayat Reservasi Saya
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Daftar riwayat dan timeline status pengajuan peminjaman aset yang telah Anda ajukan.
                            </p>
                        </div>

                        {/* History Timeline Cards */}
                        <div className="space-y-4">
                            {allReservations.length > 0 ? (
                                allReservations.map((res: any) => (
                                    <Card key={res.id} className="p-5 rounded-[18px] border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400">#RSV-{res.id}</span>
                                                    <Badge status={res.status} />
                                                </div>

                                                <h4 className="text-base font-extrabold text-slate-850 dark:text-white">
                                                    {res.asset?.name || 'Aset Kantor'}
                                                </h4>

                                                <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {res.start_date ? new Date(res.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {res.purpose || 'Keperluan Dinas'}
                                                    </span>
                                                    {res.driver_name && (
                                                        <span className="flex items-center gap-1 text-ojk-red font-bold">
                                                            <UserIcon className="w-3.5 h-3.5" />
                                                            Driver: {res.driver_name}
                                                        </span>
                                                    )}
                                                </div>

                                                {res.rejection_reason && (
                                                    <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                                                        Alasan Ditolak: {res.rejection_reason}
                                                    </p>
                                                )}
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
                                    <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p>Belum ada riwayat reservasi yang diajukan.</p>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* ==========================================
                        SECTION 6: PENGATURAN
                        ========================================== */}
                    <section id="sec-pengaturan" className="scroll-mt-24 min-h-screen py-12 border-t border-slate-100 dark:border-slate-800/60 space-y-8 animate-fade-in duration-300">
                        
                        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                    <SlidersHorizontal className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                                    Pengaturan
                                </h3>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Informasi profil pengguna, ubah kata sandi, dan preferensi akun Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Profile Info Card */}
                            <Card className="p-6 rounded-[18px] border border-slate-100 dark:border-slate-800 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-ojk-red text-white font-black text-xl flex items-center justify-center shadow-md">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'OK'}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-extrabold text-slate-850 dark:text-white">{user?.name || 'User'}</h4>
                                        <span className="text-xs text-slate-400 font-medium">{user?.nip || 'NIP Pegawai'} &bull; {user?.division?.name || 'Kantor Regional 2 Jawa Barat'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                                        <span className="font-semibold text-slate-400">Email Resmi</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                                        <span className="font-semibold text-slate-400">Peran / Role</span>
                                        <span className="font-extrabold text-ojk-red uppercase tracking-wider">{user?.role}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="font-semibold text-slate-400">Kantor Unit</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">Regional 2 Jawa Barat</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Password Form Card */}
                            <Card className="p-6 rounded-[18px] border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                                        <Key className="w-4 h-4 text-ojk-red" />
                                        Ubah Kata Sandi
                                    </h4>
                                    <p className="text-xs text-slate-400">Perbarui kata sandi akun Anda secara berkala.</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-3">
                                    <Input
                                        type="password"
                                        label="Kata Sandi Lama"
                                        placeholder="••••••••"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                        className="text-xs py-2.5 rounded-xl"
                                    />
                                    <Input
                                        type="password"
                                        label="Kata Sandi Baru"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="text-xs py-2.5 rounded-xl"
                                    />
                                    <Input
                                        type="password"
                                        label="Konfirmasi Kata Sandi Baru"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="text-xs py-2.5 rounded-xl"
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={passwordSubmitting}
                                        className="w-full text-xs font-bold py-2.5 rounded-xl bg-ojk-red text-white cursor-pointer"
                                    >
                                        {passwordSubmitting ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
                                    </Button>
                                </form>
                            </Card>

                        </div>
                    </section>

                </React.Fragment>
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
