'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
    Car,
    Home as HomeIcon,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    Eye,
    Building2,
    Lock,
    CheckSquare,
    Layers,
    RefreshCw,
    UserCheck,
    Users,
    Phone,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, Button, Badge, toast, Dialog, TextArea, Input, Select } from '@/components/UI';
import { useRouter } from 'next/navigation';
import { DRIVER_LIST } from '@/constants/drivers';

interface CatalogAsset {
    id: number;
    name: string;
    category: 'Kendaraan' | 'Ruangan' | 'Partnership';
    status: 'Tersedia' | 'Sedang Dipakai' | 'Reserved' | 'Maintenance';
    location: string;
    code: string;
    image: string;
    capacity?: string;
    description: string;
    facilities?: string[];
    plate?: string;
    specs?: string[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

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
    const [vehicleAssets, setVehicleAssets] = useState<CatalogAsset[]>([]);
    const [roomAssets, setRoomAssets] = useState<CatalogAsset[]>([]);
    const [partnershipAssets, setPartnershipAssets] = useState<CatalogAsset[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
    const [selectedResDetail, setSelectedResDetail] = useState<any | null>(null);
    const [resDetailOpen, setResDetailOpen] = useState(false);

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    const [selectedAssetDetail, setSelectedAssetDetail] = useState<CatalogAsset | null>(null);
    const [assetDetailOpen, setAssetDetailOpen] = useState(false);
    
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [selectedAssetForRes, setSelectedAssetForRes] = useState<CatalogAsset | null>(null);
    const [resStartDate, setResStartDate] = useState('');
    const [resEndDate, setResEndDate] = useState('');
    const [resPurpose, setResPurpose] = useState('');
    const [resDestination, setResDestination] = useState('');
    const [resPassengers, setResPassengers] = useState('');
    const [resDriverRequired, setResDriverRequired] = useState(true);
    const [resDriverName, setResDriverName] = useState('');
    const [resNotes, setResNotes] = useState('');
    const [resSubmitting, setResSubmitting] = useState(false);

    // Validator Approval Assignment Modal State
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedResForApproval, setSelectedResForApproval] = useState<any | null>(null);
    const [assignAssetId, setAssignAssetId] = useState<number | string>('');
    const [assignDriverName, setAssignDriverName] = useState(DRIVER_LIST[0]?.name || 'RISKI');
    const [approvalSubmitting, setApprovalSubmitting] = useState(false);

    // vehicleAssets & roomAssets are now loaded from API (see fetchDashboardData below)

    const mapStatus = (s: string): CatalogAsset['status'] => {
        if (s === 'available')   return 'Tersedia';
        if (s === 'in_use')      return 'Sedang Dipakai';
        if (s === 'reserved')    return 'Reserved';
        if (s === 'maintenance') return 'Maintenance';
        return 'Tersedia';
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, resList, assetRes] = await Promise.all([
                fetch('/api/dashboard'),
                fetch('/api/reservations'),
                fetch('/api/assets'),
            ]);
            if (dashRes.ok)   setDashData(await dashRes.json());
            if (resList.ok)   setAllReservations(await resList.json());
            if (assetRes.ok) {
                const raw: any[] = await assetRes.json();
                const toAsset = (a: any): CatalogAsset => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const n    = (a.category?.name || '').toLowerCase();
                    let cat: 'Kendaraan' | 'Ruangan' | 'Partnership' = 'Kendaraan';
                    if (slug.includes('partner') || n.includes('partner') || slug.includes('kerjasama') || n.includes('kerjasama')) {
                        cat = 'Partnership';
                    } else if (slug.includes('ruang') || n.includes('ruang') || slug.includes('aula') || n.includes('aula')) {
                        cat = 'Ruangan';
                    }
                    return {
                        id:          a.id,
                        name:        a.name,
                        code:        a.code || 'AST',
                        plate:       a.code,
                        category:    cat,
                        status:      mapStatus(a.status),
                        location:    a.location,
                        image:       a.photo || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
                        specs:       [a.category?.name || 'Aset', a.location],
                        capacity:    a.capacity || undefined,
                        description: a.description || 'Fasilitas operasional OJK KR 2 Jawa Barat.',
                        facilities:  [],
                    };
                };
                const vehicles = raw.filter(a => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const n    = (a.category?.name || '').toLowerCase();
                    return slug.includes('kendaraan') || n.includes('kendaraan');
                }).map(toAsset);
                const rooms = raw.filter(a => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const n    = (a.category?.name || '').toLowerCase();
                    return slug.includes('ruang') || n.includes('ruang') || n.includes('aula');
                }).map(toAsset);
                const partners = raw.filter(a => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const n    = (a.category?.name || '').toLowerCase();
                    return slug.includes('partner') || n.includes('partner') || slug.includes('kerjasama') || n.includes('kerjasama');
                }).map(toAsset);
                setVehicleAssets(vehicles);
                setRoomAssets(rooms);
                setPartnershipAssets(partners);
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

    const [resStartDateOnly, setResStartDateOnly] = useState('');
    const [resStartTime24, setResStartTime24] = useState('08:00');
    const [resEndDateOnly, setResEndDateOnly] = useState('');
    const [resEndTime24, setResEndTime24] = useState('17:00');

    const handleOpenReservationModal = (asset?: CatalogAsset) => {
        if (asset) {
            setSelectedAssetForRes(asset);
        } else {
            setSelectedAssetForRes(vehicleAssets[0]);
        }
        const todayStr = new Date().toISOString().split('T')[0];
        setResStartDateOnly(todayStr);
        setResStartTime24('08:00');
        setResEndDateOnly(todayStr);
        setResEndTime24('17:00');
        setResPurpose('');
        setResDestination('');
        setResPassengers('');
        setResDriverRequired(true);
        setResDriverName('');
        setResNotes('');
        setReservationModalOpen(true);
    };

    const handleCreateReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetForRes) return;
        if (!resStartDateOnly || !resEndDateOnly || !resPurpose) {
            toast.warning('Silakan lengkapi tanggal mulai, tanggal selesai, dan tujuan peminjaman.');
            return;
        }

        const start_date = `${resStartDateOnly}T${resStartTime24}`;
        const end_date = `${resEndDateOnly}T${resEndTime24}`;

        const destinationWithPassengers = resPassengers 
            ? `${resDestination || 'Lokasi Tujuan Dinas'} (Rombongan: ${resPassengers})`
            : (resDestination || 'Lokasi Tujuan Dinas');

        try {
            setResSubmitting(true);
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: selectedAssetForRes.id,
                    start_date,
                    end_date,
                    purpose: resPurpose,
                    destination: destinationWithPassengers,
                    driver_required: true,
                    driver_name: null,
                    notes: resNotes
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal mengajukan permohonan dinas');
            }

            toast.success('Pengajuan permohonan dinas berhasil masuk antrian verifikasi!');
            setReservationModalOpen(false);
            fetchDashboardData();
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengajukan permohonan dinas.');
        } finally {
            setResSubmitting(false);
        }
    };

    const handleOpenApprovalModal = (resItem: any) => {
        setSelectedResForApproval(resItem);
        setAssignAssetId(resItem.assetId || resItem.asset_id || (vehicleAssets[0]?.id ?? ''));
        setAssignDriverName(resItem.driverName || resItem.driver_name || DRIVER_LIST[0].name);
        setApprovalModalOpen(true);
    };

    const handleConfirmApprovalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResForApproval) return;
        try {
            setApprovalSubmitting(true);
            const res = await fetch(`/api/reservations/${selectedResForApproval.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: assignAssetId,
                    driver_name: assignDriverName
                })
            });
            if (res.ok) {
                toast.success(`Permohonan #RSV-${selectedResForApproval.id} berhasil disetujui & dialokasikan!`);
                setApprovalModalOpen(false);
                setSelectedResForApproval(null);
                fetchDashboardData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal menyetujui permohonan.');
            }
        } catch {
            toast.error('Gagal menyetujui permohonan.');
        } finally {
            setApprovalSubmitting(false);
        }
    };

    const handleCancelReservation = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan reservasi ini?')) return;
        try {
            const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'POST' });
            if (res.ok) {
                toast.success('Reservasi berhasil dibatalkan.');
                fetchDashboardData();
            } else {
                toast.error('Gagal membatalkan reservasi.');
            }
        } catch (error: any) {
            toast.error('Gagal membatalkan reservasi.');
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
            toast.success('Kata sandi berhasil diperbarui.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error('Gagal memperbarui kata sandi.');
        } finally {
            setPasswordSubmitting(false);
        }
    };

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

    const filteredPartnerships = partnershipAssets.filter(item => {
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

    const handleQuickApprove = async (id: number) => {
        try {
            const res = await fetch(`/api/reservations/${id}/approve`, { method: 'POST' });
            if (res.ok) {
                toast.success(`Reservasi #RSV-${id} berhasil disetujui!`);
                fetchDashboardData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal menyetujui reservasi.');
            }
        } catch {
            toast.error('Gagal menyetujui reservasi.');
        }
    };

    const handleQuickReject = async (id: number) => {
        const reason = window.prompt('Masukkan alasan penolakan (opsional):', 'Aset tidak tersedia atau jadwal bentrok');
        if (reason === null) return;
        try {
            const res = await fetch(`/api/reservations/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: reason })
            });
            if (res.ok) {
                toast.success(`Reservasi #RSV-${id} berhasil ditolak.`);
                fetchDashboardData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal menolak reservasi.');
            }
        } catch {
            toast.error('Gagal menolak reservasi.');
        }
    };

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
            {!isPegawai && (
                <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-xs gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-ojk-red text-[10px] font-black uppercase tracking-wider">
                                    {isSuperAdmin ? 'SUPER ADMIN PANEL' : 'VALIDATOR RESERVASI'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">&bull; OJK KR 2 Jawa Barat</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-850 dark:text-white tracking-tight">
                                {getGreeting()}, {user?.name || 'Administrator'}! 👋
                            </h2>
                            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                                Ringkasan statistik operasional, permohonan reservasi terbaru, dan pemantauan aset kantor secara real-time.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={fetchDashboardData}
                                className="rounded-xl text-xs font-bold flex items-center gap-1.5 py-2"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </Button>

                            <Button 
                                onClick={() => router.push('/reservations')}
                                className="rounded-xl text-xs font-extrabold bg-ojk-red text-white hover:bg-red-700 py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                                <CheckSquare className="w-4 h-4" />
                                Kelola Persetujuan ({allReservations.filter(r => r.status === 'pending').length})
                            </Button>

                            {isSuperAdmin && (
                                <Button 
                                    onClick={() => router.push('/assets')}
                                    className="rounded-xl text-xs font-extrabold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Kelola Master Aset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Top 6 KPI Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL ASET</span>
                                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-slate-800 text-ojk-red">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2">
                                {dashData?.stats?.total_assets ?? (vehicleAssets.length + roomAssets.length + partnershipAssets.length)}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Kendaraan & Ruang</span>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">SEDANG DIPAKAI</span>
                                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                                    <Car className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">
                                {allReservations.filter(r => r.status === 'in_use').length}
                            </h3>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">Aktif Digunakan</span>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/30 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">MENUNGGU</span>
                                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 animate-pulse">
                                    <Hourglass className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-2">
                                {allReservations.filter(r => r.status === 'pending').length}
                            </h3>
                            <span className="text-[10px] text-red-500 font-bold block mt-0.5">Perlu Tindakan</span>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">TERSEDIA</span>
                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                {dashData?.stats?.available ?? 17}
                            </h3>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Siap Dipinjam</span>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">SELESAI</span>
                                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                    <CheckSquare className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">
                                {allReservations.filter(r => r.status === 'completed').length}
                            </h3>
                            <span className="text-[10px] text-blue-600 font-medium block mt-0.5">Transaksi Selesai</span>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">MAINTENANCE</span>
                                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                                    <Wrench className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 mt-2">
                                {dashData?.stats?.maintenance ?? 0}
                            </h3>
                            <span className="text-[10px] text-purple-600 font-medium block mt-0.5">Perawatan Aset</span>
                        </Card>
                    </div>

                    {/* Main Content 2-Column Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column (8 cols): Pending Approvals & Live Asset Overview */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Card 1: Permohonan Reservasi Menunggu Persetujuan */}
                            <Card className="rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                                            <Hourglass className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-850 dark:text-white">
                                                Permohonan Menunggu Persetujuan
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                Pengajuan reservasi aset dari pegawai yang memerlukan verifikasi validator.
                                            </p>
                                        </div>
                                    </div>

                                    {allReservations.filter(r => r.status === 'pending').length > 0 && (
                                        <span className="px-2.5 py-1 rounded-full bg-red-500 text-white font-black text-[10px]">
                                            {allReservations.filter(r => r.status === 'pending').length} Baru
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[9.5px] font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-5 py-3.5">KODE & PEMOHON</th>
                                                <th className="px-5 py-3.5">ASET DIPINJAM</th>
                                                <th className="px-5 py-3.5">WAKTU PERJALANAN</th>
                                                <th className="px-5 py-3.5">KEPERLUAN</th>
                                                <th className="px-5 py-3.5 text-right">AKSI CEPAT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {allReservations.filter(r => r.status === 'pending').length > 0 ? (
                                                allReservations.filter(r => r.status === 'pending').map((res: any) => {
                                                    const sDate = res.startDate || res.start_date;
                                                    const eDate = res.endDate || res.end_date;
                                                    return (
                                                        <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-slate-800 border border-red-100 dark:border-slate-700 flex items-center justify-center text-ojk-red dark:text-slate-200 font-bold shrink-0 text-xs">
                                                                        {res.user?.name ? res.user.name.charAt(0).toUpperCase() : 'U'}
                                                                    </div>
                                                                    <div className="flex flex-col leading-tight">
                                                                        <span className="font-extrabold text-slate-850 dark:text-white text-xs">
                                                                            #RSV-{res.id}
                                                                        </span>
                                                                        <span className="text-[10.5px] text-slate-400 font-medium">
                                                                            {res.user?.name || 'Pegawai OJK'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex flex-col space-y-0.5">
                                                                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                                                        {res.asset?.name || 'Aset OJK'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                                        {res.asset?.code || 'AST'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex flex-col text-[11px]">
                                                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                                                        {sDate ? new Date(sDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                                    </span>
                                                                    <span className="text-slate-400 text-[10px]">
                                                                        {sDate ? `${String(new Date(sDate).getHours()).padStart(2, '0')}.${String(new Date(sDate).getMinutes()).padStart(2, '0')}` : ''} - {eDate ? `${String(new Date(eDate).getHours()).padStart(2, '0')}.${String(new Date(eDate).getMinutes()).padStart(2, '0')}` : ''} WIB
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[150px]">
                                                                    {res.purpose}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => handleOpenApprovalModal(res)}
                                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-extrabold transition-all cursor-pointer shadow-2xs"
                                                                    >
                                                                        Setujui & Alokasikan
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleQuickReject(res.id)}
                                                                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-extrabold transition-all cursor-pointer shadow-2xs"
                                                                    >
                                                                        Tolak
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                                                        Tidak ada pengajuan reservasi yang menunggu persetujuan saat ini. 🎉
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Card 2: Status Aset & Kendaraan Operasional */}
                            <Card className="p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                                            <Car className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-850 dark:text-white">
                                                Status Ketersediaan Aset Utama
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                Pemantauan langsung aset kendaraan dinas & ruang rapat utama.
                                            </p>
                                        </div>
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => router.push('/assets')}
                                        className="rounded-xl text-xs font-bold"
                                    >
                                        Kelola Aset
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[...vehicleAssets, ...roomAssets].slice(0, 6).map(asset => (
                                        <div key={asset.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                    {asset.code || 'ASET'}
                                                </span>
                                                <Badge status={asset.status === 'Tersedia' ? 'available' : asset.status === 'Sedang Dipakai' ? 'in_use' : 'maintenance'} />
                                            </div>

                                            <div>
                                                <h4 className="font-extrabold text-xs text-slate-850 dark:text-white line-clamp-1">{asset.name}</h4>
                                                <p className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                    {asset.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Right Column (4 cols): Quick Management Links & Today's Schedule */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Card 1: Pintasan Kontrol Operasional */}
                            <Card className="p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                                <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-ojk-red" />
                                    Pintasan Menu Manajemen
                                </h3>

                                <div className="space-y-2">
                                    <button 
                                        onClick={() => router.push('/reservations')}
                                        className="w-full p-3 rounded-xl bg-slate-50 hover:bg-red-50/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between group transition-all text-left cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-red-500/10 text-ojk-red group-hover:bg-ojk-red group-hover:text-white transition-colors">
                                                <CheckSquare className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Persetujuan Reservasi</span>
                                                <span className="text-[10px] text-slate-400">Verifikasi & Pengesahan Pemohon</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button 
                                        onClick={() => router.push('/assets')}
                                        className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between group transition-all text-left cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Katalog & Master Aset</span>
                                                <span className="text-[10px] text-slate-400">Kelola Spesifikasi & Status</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button 
                                        onClick={() => router.push('/calendar')}
                                        className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between group transition-all text-left cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Jadwal Kalender Aset</span>
                                                <span className="text-[10px] text-slate-400">Pantau Agenda Harian Aset</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {isSuperAdmin && (
                                        <button 
                                            onClick={() => router.push('/users')}
                                            className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between group transition-all text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Manajemen Pengguna</span>
                                                    <span className="text-[10px] text-slate-400">Kelola Akun, NIP, & Role</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </Card>

                            {/* Card 2: Agenda Hari Ini */}
                            <Card className="p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                    <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        Agenda Operasional Hari Ini
                                    </h3>
                                    <span className="text-[9.5px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {allReservations.filter(r => ['in_use', 'approved', 'reserved'].includes(r.status)).length > 0 ? (
                                        allReservations.filter(r => ['in_use', 'approved', 'reserved'].includes(r.status)).slice(0, 4).map((res: any) => {
                                            const sDate = res.startDate || res.start_date;
                                            const eDate = res.endDate || res.end_date;
                                            return (
                                                <div key={res.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9.5px] font-extrabold text-ojk-red uppercase">
                                                            {res.asset?.name || 'Aset OJK'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400">
                                                            {sDate ? `${String(new Date(sDate).getHours()).padStart(2, '0')}.${String(new Date(sDate).getMinutes()).padStart(2, '0')}` : ''} WIB
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                        {res.purpose}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 block font-medium">
                                                        Pemohon: {res.user?.name || 'Pegawai OJK'}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium text-center py-6">
                                            Belum ada agenda reservasi hari ini.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {isPegawai && (
                <div className="w-full">
                    {/* SECTION 1: HERO */}
                    <section 
                        id="sec-dashboard" 
                        className="snap-start snap-always h-[calc(100vh-73px)] min-h-[calc(100vh-73px)] max-h-[calc(100vh-73px)] flex flex-col justify-between p-6 md:p-8 space-y-4 shrink-0 transition-all duration-500 ease-in-out"
                    >
                        <div className="relative rounded-[24px] overflow-hidden flex-1 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between p-8 group">
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                            >
                                <source src="/vidio ojk.mp4" type="video/mp4" />
                            </video>

                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40 backdrop-blur-[1px]"></div>

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

                            <div className="relative z-10 hidden lg:block w-80 shrink-0">
                                <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl text-white space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-red-400" />
                                            <span className="text-xs font-black">Status Penugasan Dinas</span>
                                        </div>
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                                            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                                        {allReservations.filter(r => ['approved', 'in_use', 'pending', 'reserved'].includes(r.status)).length > 0 ? (
                                            allReservations.filter(r => ['approved', 'in_use', 'pending', 'reserved'].includes(r.status)).slice(0, 1).map((res: any) => {
                                                const sDate = res.startDate || res.start_date;
                                                const isApproved = ['approved', 'in_use', 'reserved'].includes(res.status);
                                                return (
                                                    <div key={res.id} className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9.5px] font-extrabold text-red-300 uppercase">
                                                                #RSV-{res.id} &bull; {res.asset?.name || 'Aset OJK'}
                                                            </span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${isApproved ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                                                                {isApproved ? 'DISETUJUI' : 'ANTRIAN'}
                                                            </span>
                                                        </div>

                                                        <p className="text-[11px] font-bold truncate">
                                                            {res.purpose}
                                                        </p>

                                                        {isApproved ? (
                                                            <div className="pt-1.5 border-t border-white/10 space-y-1 text-[10.5px]">
                                                                <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold">
                                                                    <UserCheck className="w-3.5 h-3.5" />
                                                                    <span>Driver: {res.driverName || res.driver_name || 'Driver OJK'}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-200 truncate">
                                                                    📍 {res.destination || 'Tujuan Dinas'}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-300 italic pt-1 border-t border-white/10">
                                                                ⏳ Validator sedang mengalokasikan mobil & supir...
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 text-center text-slate-300 space-y-1">
                                                <p className="text-[11px] font-semibold">Belum Ada Perjalanan Dinas Aktif</p>
                                                <p className="text-[9.5px] opacity-75">Klik "Ajukan Reservasi" untuk memulai pengajuan.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                            <Card className="hover:scale-[1.015] transition-all duration-300 border-l-4 border-l-red-600 rounded-[18px] soft-shadow bg-white dark:bg-slate-900 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Asset</span>
                                        <h4 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{dashData?.stats?.total_assets ?? (vehicleAssets.length + roomAssets.length)}</h4>
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

                    {/* SECTION 2: KENDARAAN DINAS */}
                    <section 
                        id="sec-kendaraan" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                            <Car className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                            Kendaraan Dinas ({vehicleAssets.length} Unit)
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

                    {/* SECTION 3: RUANG RAPAT & AULA */}
                    <section 
                        id="sec-ruangan" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                        <HomeIcon className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                        Ruang Rapat & Aula ({roomAssets.length} Ruangan)
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Fasilitas ruang rapat modern lengkap dengan peralatan audio visual.
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredRooms.map(room => (
                                <Card key={room.id} className="rounded-[24px] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="relative md:w-5/12 h-52 md:h-auto overflow-hidden bg-slate-900 shrink-0">
                                        <img 
                                            src={room.image} 
                                            alt={room.name} 
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r"></div>

                                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                                            {room.capacity && (
                                                <span className="bg-blue-600/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                                    👥 Kapasitas: {room.capacity}
                                                </span>
                                            )}
                                            {room.status === 'Tersedia' && (
                                                <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                    Tersedia
                                                </span>
                                            )}
                                            {room.status === 'Reserved' && (
                                                <span className="bg-blue-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                    Reserved
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-black text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                    {room.name}
                                                </h4>
                                                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                                        {room.location}
                                                    </span>
                                                    {room.capacity && (
                                                        <>
                                                            <span>&bull;</span>
                                                            <span className="text-blue-600 dark:text-blue-400 font-bold">Kapasitas: {room.capacity}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Fasilitas Ruangan:</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {room.facilities?.map((f, i) => (
                                                        <span key={i} className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                                                            ✓ {f}
                                                        </span>
                                                    ))}
                                                    {(!room.facilities || room.facilities.length === 0) && (
                                                        <span className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 px-2 py-0.5 rounded-md font-semibold">
                                                            AC, Sound System, Proyektor
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4: PARTNERSHIP & HOTEL MITRA */}
                    <section 
                        id="sec-partnership" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                        Partnership Hotel & Fasilitas Mitra ({partnershipAssets.length} Lokasi)
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Fasilitas kerjasama hotel bintang lima dan lokasi akomodasi resmi OJK Jawa Barat.
                                </p>
                            </div>

                            <Button 
                                onClick={() => router.push('/partnership')} 
                                className="rounded-xl font-bold flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-5 shadow-sm self-start sm:self-auto cursor-pointer"
                            >
                                <Building2 className="w-4 h-4" />
                                Buka Portal Partnership
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredPartnerships.map(partner => (
                                <Card key={partner.id} className="rounded-[24px] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="relative md:w-5/12 h-52 md:h-auto overflow-hidden bg-slate-900 shrink-0">
                                        <img 
                                            src={partner.image} 
                                            alt={partner.name} 
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r"></div>

                                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                                            {partner.capacity && (
                                                <span className="bg-amber-600/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                                    🤝 {partner.capacity}
                                                </span>
                                            )}
                                            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                                Mitra Resmi OJK
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-black text-slate-850 dark:text-white leading-snug group-hover:text-amber-500 transition-colors">
                                                    {partner.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                                                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    <span>{partner.location}</span>
                                                </div>
                                            </div>

                                            <div className="pt-1">
                                                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 px-2.5 py-1 rounded-lg inline-block">
                                                    ★ Kerjasama Hotel & Akomodasi OJK Jabar
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <Button 
                                                variant="secondary" 
                                                className="w-full text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                                                onClick={() => { setSelectedAssetDetail(partner); setAssetDetailOpen(true); }}
                                            >
                                                Detail
                                            </Button>
                                            <Button 
                                                variant="primary" 
                                                className="w-full text-xs font-bold py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm"
                                                onClick={() => handleOpenReservationModal(partner)}
                                            >
                                                Reservasi
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4: KALENDER */}
                    <section 
                        id="sec-kalender" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                        Kalender Jadwal Reservasi Aset
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Pantau jadwal ketersediaan ruang rapat dan kendaraan dinas secara aktual.
                                </p>
                            </div>
                        </div>

                        <Card className="p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h4 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <span>{monthNames[calMonth]} {calYear}</span>
                                </h4>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" onClick={handlePrevMonth} className="rounded-xl p-2 cursor-pointer">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentMonthDate(new Date())} className="rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer">
                                        Hari Ini
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNextMonth} className="rounded-xl p-2 cursor-pointer">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center">
                                {['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                                    <span key={i} className="text-xs font-black text-slate-400 uppercase py-2">
                                        {day}
                                    </span>
                                ))}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800/50 opacity-30"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const isToday = dayNum === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear();
                                    // Get reservations for this day from real API data
                                    const dayReservations = allReservations.filter((res: any) => {
                                        const d = new Date(res.startDate || res.start_date);
                                        return d.getDate() === dayNum && d.getMonth() === calMonth && d.getFullYear() === calYear;
                                    });
                                    return (
                                        <div 
                                            key={dayNum} 
                                            className={`h-24 p-2 rounded-2xl border transition-all flex flex-col justify-between text-left ${isToday ? 'bg-red-500/5 border-ojk-red dark:border-ojk-red' : 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                                        >
                                            <span className={`text-xs font-black ${isToday ? 'text-ojk-red' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {dayNum}
                                            </span>
                                            {dayReservations.slice(0, 2).map((res: any) => (
                                                <div key={res.id} className="p-1 rounded-lg bg-ojk-red/10 border border-ojk-red/20 text-[9px] font-bold text-ojk-red truncate">
                                                    {res.asset?.name || 'Reservasi'}
                                                </div>
                                            ))}
                                            {dayReservations.length > 2 && (
                                                <div className="text-[8px] text-slate-400 font-semibold pl-0.5">+{dayReservations.length - 2} lainnya</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </section>

                    {/* SECTION 5: RIWAYAT */}
                    <section 
                        id="sec-riwayat" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        {/* Header Title & Refresh Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                                        <HistoryIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                        Riwayat Peminjaman Aset
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium pl-0.5">
                                    Daftar seluruh transaksi peminjaman aset kantor yang pernah Anda ajukan.
                                </p>
                            </div>

                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={fetchDashboardData}
                                className="rounded-xl flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </Button>
                        </div>

                        {/* Top 4 Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL RIWAYAT</span>
                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2">{allReservations.length}</h3>
                            </Card>

                            <Card className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">DISETUJUI</span>
                                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                        <CheckSquare className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">
                                    {allReservations.filter(r => ['approved', 'reserved'].includes(r.status)).length}
                                </h3>
                            </Card>

                            <Card className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">SEDANG DIPAKAI</span>
                                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                                        <Car className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">
                                    {allReservations.filter(r => r.status === 'in_use').length}
                                </h3>
                            </Card>

                            <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SELESAI</span>
                                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                    {allReservations.filter(r => r.status === 'completed').length}
                                </h3>
                            </Card>
                        </div>

                        {/* Search & Filter Bar */}
                        <Card className="p-3 rounded-[16px] border border-slate-100 dark:border-slate-800 shadow-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <Input
                                        placeholder="Cari berdasarkan nama aset, pemohon, keperluan..."
                                        value={historySearchQuery}
                                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                                        className="pl-9 text-xs py-2 rounded-xl"
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                                </div>

                                <Select
                                    value={historyStatusFilter}
                                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu (Pending)</option>
                                    <option value="approved">Disetujui</option>
                                    <option value="in_use">Sedang Dipakai</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak</option>
                                    <option value="cancelled">Batal</option>
                                </Select>
                            </div>
                        </Card>

                        {/* Rich Data Table */}
                        <Card className="rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">KODE RSV</th>
                                            <th className="px-6 py-4">PEGAWAI PEMOHON</th>
                                            <th className="px-6 py-4">ASET PEMINJAMAN</th>
                                            <th className="px-6 py-4">WAKTU PEMINJAMAN</th>
                                            <th className="px-6 py-4">AGENDA & DRIVER</th>
                                            <th className="px-6 py-4">STATUS</th>
                                            <th className="px-6 py-4 text-right">OPSI CRUD</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {allReservations.filter((res: any) => {
                                            const query = historySearchQuery.toLowerCase();
                                            const matchesSearch = 
                                                !query ||
                                                (res.asset?.name || '').toLowerCase().includes(query) ||
                                                (res.user?.name || '').toLowerCase().includes(query) ||
                                                (res.purpose || '').toLowerCase().includes(query) ||
                                                `#rsv-${res.id}`.includes(query);
                                            
                                            const matchesStatus = 
                                                historyStatusFilter === 'all' || 
                                                res.status === historyStatusFilter;

                                            return matchesSearch && matchesStatus;
                                        }).length > 0 ? (
                                            allReservations.filter((res: any) => {
                                                const query = historySearchQuery.toLowerCase();
                                                const matchesSearch = 
                                                    !query ||
                                                    (res.asset?.name || '').toLowerCase().includes(query) ||
                                                    (res.user?.name || '').toLowerCase().includes(query) ||
                                                    (res.purpose || '').toLowerCase().includes(query) ||
                                                    `#rsv-${res.id}`.includes(query);
                                                
                                                const matchesStatus = 
                                                    historyStatusFilter === 'all' || 
                                                    res.status === historyStatusFilter;

                                                return matchesSearch && matchesStatus;
                                            }).map((res: any) => {
                                                const sDate = res.startDate || res.start_date;
                                                const eDate = res.endDate || res.end_date;
                                                const driverName = res.driverName || res.driver_name;
                                                return (
                                                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-0.5">
                                                                <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                                                                    #RSV-{res.id}
                                                                </span>
                                                                <span className="text-[10.5px] text-slate-400 font-medium">
                                                                    {sDate ? new Date(sDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-slate-800 border border-red-100 dark:border-slate-700 flex items-center justify-center text-ojk-red dark:text-slate-200 font-bold shrink-0 text-xs">
                                                                    {res.user?.name ? res.user.name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || 'U')}
                                                                </div>
                                                                <div className="flex flex-col leading-tight overflow-hidden">
                                                                    <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[180px]">
                                                                        {res.user?.name || user?.name || '-'}
                                                                    </span>
                                                                    <span className="text-[10.5px] text-slate-400 font-medium truncate max-w-[180px]">
                                                                        NIP: {res.user?.nip || user?.nip || '-'} &bull; {res.user?.division?.name || 'OJK Jabar'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-1">
                                                                <span className="font-extrabold text-slate-850 dark:text-white text-xs">
                                                                    {res.asset?.name || 'Aset OJK'}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-extrabold rounded uppercase tracking-wider border border-slate-200/60 dark:border-slate-700">
                                                                        {res.asset?.code || 'AST'}
                                                                    </span>
                                                                    {res.asset?.location && (
                                                                        <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                                            {res.asset.location}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-0.5 text-xs">
                                                                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                                                                    <Calendar className="w-3.5 h-3.5 text-ojk-red shrink-0" />
                                                                    <span>{sDate ? new Date(sDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium pl-5">
                                                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    <span>
                                                                        {sDate ? `${String(new Date(sDate).getHours()).padStart(2, '0')}.${String(new Date(sDate).getMinutes()).padStart(2, '0')}` : ''} - {eDate ? `${String(new Date(eDate).getHours()).padStart(2, '0')}.${String(new Date(eDate).getMinutes()).padStart(2, '0')}` : ''} WIB
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col space-y-1 max-w-[200px]">
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                                                                    {res.purpose}
                                                                </span>
                                                                {driverName && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40 w-fit">
                                                                        <UserIcon className="w-3 h-3 text-emerald-600" /> Driver: {driverName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge status={res.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedResDetail(res);
                                                                        setResDetailOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                                    <span>Detail</span>
                                                                </button>
                                                                {['pending', 'approved', 'reserved'].includes(res.status) && (
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm" 
                                                                        onClick={() => handleCancelReservation(res.id)}
                                                                        className="rounded-xl text-xs font-extrabold px-3 py-1.5 cursor-pointer shadow-2xs"
                                                                    >
                                                                        Batalkan
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                                    Belum ada riwayat reservasi yang sesuai.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Modal Detail Reservasi */}
                        <Dialog
                            isOpen={resDetailOpen}
                            onClose={() => {
                                setResDetailOpen(false);
                                setSelectedResDetail(null);
                            }}
                            title="Detail Permohonan Reservasi"
                            size="md"
                        >
                            {selectedResDetail && (
                                <div className="space-y-4 text-xs">
                                    <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-extrabold text-slate-500">#RSV-{selectedResDetail.id}</span>
                                            <Badge status={selectedResDetail.status} />
                                        </div>

                                        <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Aset Dipinjam</span>
                                                <p className="font-extrabold text-sm text-slate-800 dark:text-white">
                                                    {selectedResDetail.asset?.name || 'Aset OJK'}
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Waktu Reservasi</span>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(selectedResDetail.startDate || selectedResDetail.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ({String(new Date(selectedResDetail.startDate || selectedResDetail.start_date).getHours()).padStart(2, '0')}.${String(new Date(selectedResDetail.startDate || selectedResDetail.start_date).getMinutes()).padStart(2, '0')} WIB) &bull; {new Date(selectedResDetail.endDate || selectedResDetail.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ({String(new Date(selectedResDetail.endDate || selectedResDetail.end_date).getHours()).padStart(2, '0')}.${String(new Date(selectedResDetail.endDate || selectedResDetail.end_date).getMinutes()).padStart(2, '0')} WIB)
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Agenda / Keperluan</span>
                                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                                    {selectedResDetail.purpose}
                                                </p>
                                            </div>

                                            {(selectedResDetail.driverName || selectedResDetail.driver_name) && (
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Driver</span>
                                                    <p className="font-bold text-emerald-600">
                                                        {selectedResDetail.driverName || selectedResDetail.driver_name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button variant="secondary" onClick={() => setResDetailOpen(false)}>
                                            Tutup
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Dialog>
                    </section>

                    {/* SECTION 6: PENGATURAN */}
                    <section 
                        id="sec-pengaturan" 
                        className="snap-start min-h-[calc(100vh-73px)] p-6 md:p-8 space-y-6 transition-all duration-500 ease-in-out"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-ojk-red">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                                        Pengaturan Akun & Keamanan
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Perbarui kata sandi akun dan informasi profil pengguna Anda.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-ojk-red" />
                                    Profil Pengguna
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
                                        disabled={passwordSubmitting}
                                        className="w-full font-bold bg-ojk-red hover:bg-red-700 text-white rounded-xl py-2.5 text-xs cursor-pointer"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </section>

                </div>
            )}

            {/* INSTANT RESERVATION DIALOG */}
            <Dialog
                isOpen={reservationModalOpen}
                onClose={() => setReservationModalOpen(false)}
                title={`Formulir Reservasi: ${selectedAssetForRes?.name || 'Aset'}`}
                size="md"
            >
                <form onSubmit={handleCreateReservationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Waktu Mulai Pinjam</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Input
                                    type="date"
                                    value={resStartDateOnly}
                                    onChange={(e) => setResStartDateOnly(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
                                <Select
                                    value={resStartTime24}
                                    onChange={(e) => setResStartTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                >
                                    {[
                                        "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
                                        "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                                        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                                        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
                                    ].map(t => (
                                        <option key={t} value={t}>{t} WIB</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Waktu Selesai Pinjam</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Input
                                    type="date"
                                    value={resEndDateOnly}
                                    onChange={(e) => setResEndDateOnly(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
                                <Select
                                    value={resEndTime24}
                                    onChange={(e) => setResEndTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                >
                                    {[
                                        "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
                                        "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                                        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                                        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
                                    ].map(t => (
                                        <option key={t} value={t}>{t} WIB</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    <TextArea
                        label="Keperluan Perjalanan Dinas"
                        placeholder="Contoh: Perjalanan dinas pengawasan LJK ke Cirebon"
                        value={resPurpose}
                        onChange={(e) => setResPurpose(e.target.value)}
                        required
                    />

                    <Input
                        label="Daftar Anggota / Pendamping Dinas (Dinas Sama Siapa Aja)"
                        placeholder="Contoh: Budi Santoso (Kabag), Rina Wijaya (Staf LJK)"
                        value={resPassengers}
                        onChange={(e) => setResPassengers(e.target.value)}
                    />

                    {selectedAssetForRes?.category === 'Kendaraan' && (
                        <Input
                            label="Lokasi Tujuan Dinas"
                            placeholder="Contoh: Kantor OJK Cirebon / Pemkot Bandung"
                            value={resDestination}
                            onChange={(e) => setResDestination(e.target.value)}
                        />
                    )}

                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40 text-[11px] text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-ojk-red" />
                        <span>Seluruh perjalanan dinas kendaraan wajib menggunakan supir. Armada & Supir akan dialokasikan resmi oleh Validator.</span>
                    </div>

                    <TextArea
                        label="Catatan Tambahan (Opsional)"
                        placeholder="Catatan khusus untuk validator atau pengelola fasilitas"
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                    />

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" onClick={() => setReservationModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={resSubmitting} className="bg-ojk-red text-white font-extrabold">
                            {resSubmitting ? 'Mengirim...' : 'Kirim Ke Antrian Dinas'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* VALIDATOR APPROVAL & ASSIGNMENT DIALOG */}
            <Dialog
                isOpen={approvalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                title="Persetujuan & Alokasi Armada Dinas"
                size="md"
            >
                {selectedResForApproval && (
                    <form onSubmit={handleConfirmApprovalSubmit} className="space-y-4 text-xs">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-mono font-extrabold text-slate-500">#RSV-{selectedResForApproval.id}</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-extrabold text-[10px]">
                                    Menunggu Alokasi
                                </span>
                            </div>

                            <div className="text-slate-800 dark:text-white font-extrabold text-sm">
                                Pemohon: {selectedResForApproval.user?.name || 'Pegawai OJK'}
                            </div>

                            <div className="text-slate-600 dark:text-slate-300">
                                <span className="font-semibold text-slate-400">Keperluan:</span> {selectedResForApproval.purpose}
                            </div>

                            {selectedResForApproval.destination && (
                                <div className="text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold text-slate-400">Tujuan & Rombongan:</span> {selectedResForApproval.destination}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-1">
                            <Select
                                label="Alokasikan Unit Kendaraan Dinas"
                                value={assignAssetId}
                                onChange={(e) => setAssignAssetId(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Kendaraan Kosong --</option>
                                {[...vehicleAssets, ...roomAssets].map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.code || 'ASET'}) - Status: {a.status}
                                    </option>
                                ))}
                            </Select>

                            <Select
                                label="Penugasan Supir / Driver Operasional"
                                value={assignDriverName}
                                onChange={(e) => setAssignDriverName(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Supir Bertugas --</option>
                                {DRIVER_LIST.map(d => (
                                    <option key={d.id} value={d.name}>
                                        {d.name} ({d.nip} &bull; {d.phone})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="secondary" type="button" onClick={() => setApprovalModalOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="primary" type="submit" disabled={approvalSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold">
                                {approvalSubmitting ? 'Memproses...' : 'Setujui & Alokasikan Armada'}
                            </Button>
                        </div>
                    </form>
                )}
            </Dialog>

            {/* ASSET DETAIL DIALOG */}
            <Dialog
                isOpen={assetDetailOpen}
                onClose={() => setAssetDetailOpen(false)}
                title={`Spesifikasi & Informasi: ${selectedAssetDetail?.name || ''}`}
                size="md"
            >
                {selectedAssetDetail && (
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                            <img
                                src={selectedAssetDetail.image}
                                alt={selectedAssetDetail.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-base font-black text-slate-800 dark:text-white">{selectedAssetDetail.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">Lokasi: {selectedAssetDetail.location}</p>
                            {selectedAssetDetail.plate && <p className="text-xs text-slate-500 font-mono font-bold">Plat: {selectedAssetDetail.plate}</p>}
                            {selectedAssetDetail.capacity && <p className="text-xs text-slate-500 font-bold">Kapasitas: {selectedAssetDetail.capacity}</p>}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="secondary" onClick={() => setAssetDetailOpen(false)}>
                                Tutup
                            </Button>
                            <Button 
                                variant="primary" 
                                className="bg-ojk-red text-white"
                                onClick={() => { setAssetDetailOpen(false); handleOpenReservationModal(selectedAssetDetail); }}
                            >
                                Reservasi
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
