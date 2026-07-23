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
    Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, toast, Dialog, TextArea, Input, Select } from '../components/UI';
import { useNavigate, Link } from 'react-router-dom';

interface CatalogAsset {
    id: number;
    name: string;
    category: string;
    status: 'Tersedia' | 'Sedang Dipakai' | 'Reserved' | 'Maintenance';
    location: string;
    image: string;
    specs: string[];
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

    // Fallback default stats if API is slow or offline
    const defaultSuperAdminData = {
        stats: {
            total_assets: 50,
            available: 28,
            in_use: 16,
            maintenance: 6,
            total_users: 24,
            pending_approval: 3,
            approved_today: 8,
            in_use_today: 16
        },
        charts: {
            monthly_bookings: [
                { name: 'Jan', peminjaman: 102 },
                { name: 'Feb', peminjaman: 120 },
                { name: 'Mar', peminjaman: 105 },
                { name: 'Apr', peminjaman: 142 },
                { name: 'Mei', peminjaman: 131 },
                { name: 'Jun', peminjaman: 138 },
                { name: 'Jul', peminjaman: 185 }
            ],
            category_usage: [
                { name: 'Kendaraan Dinas', value: 38 },
                { name: 'Ruang Rapat', value: 28 },
                { name: 'Elektronik', value: 17 },
                { name: 'Inventaris', value: 9 }
            ]
        }
    };

    const [dashData, setDashData] = useState<any>(defaultSuperAdminData);

    // Catalog Filter States for Employee
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('Semua');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('terbaru');
    const [favorites, setFavorites] = useState<number[]>([]);
    
    // Modal states
    const [selectedAssetDetail, setSelectedAssetDetail] = useState<CatalogAsset | null>(null);
    const [assetDetailOpen, setAssetDetailOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Mock Catalog Assets for Pegawai
    const catalogAssets: CatalogAsset[] = [
        {
            id: 1,
            name: 'Toyota Innova Reborn',
            category: 'Kendaraan',
            status: 'Tersedia',
            location: 'Basement',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
            specs: ['7 Kursi', 'Basement']
        },
        {
            id: 2,
            name: 'Toyota Fortuner',
            category: 'Kendaraan',
            status: 'Sedang Dipakai',
            location: 'Basement',
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            specs: ['7 Kursi', 'Basement']
        },
        {
            id: 3,
            name: 'Toyota Avanza',
            category: 'Kendaraan',
            status: 'Maintenance',
            location: 'Parkiran',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
            specs: ['7 Kursi', 'Parkiran']
        },
        {
            id: 4,
            name: 'Ruang Rapat Bale Astama',
            category: 'Ruangan',
            status: 'Tersedia',
            location: 'Lantai 2',
            image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
            specs: ['25 Orang', 'Lantai 2']
        },
        {
            id: 5,
            name: 'Ruang Rapat Nakula',
            category: 'Ruangan',
            status: 'Reserved',
            location: 'Lantai 3',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            specs: ['15 Orang', 'Lantai 3']
        },
        {
            id: 6,
            name: 'Aula Catur Dharma',
            category: 'Ruangan',
            status: 'Tersedia',
            location: 'Lantai 1',
            image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
            specs: ['100 Orang', 'Lantai 1']
        },
        {
            id: 7,
            name: 'Laptop Dell Latitude 5420',
            category: 'Elektronik',
            status: 'Tersedia',
            location: 'Lantai 2',
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
            specs: ['Intel i7', '16GB RAM']
        },
        {
            id: 8,
            name: 'Epson Projector EB-X06',
            category: 'Elektronik',
            status: 'Reserved',
            location: 'Lantai 2',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
            specs: ['3600 Lumens', 'HDMI']
        },
        {
            id: 9,
            name: 'Printer HP LaserJet Pro',
            category: 'Inventaris',
            status: 'Tersedia',
            location: 'Lantai 1',
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
            specs: ['Hitam Putih', 'Wi-Fi']
        }
    ];

    const toggleFavorite = (id: number) => {
        setFavorites(prev => 
            prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
        );
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/dashboard');
            if (response.data) {
                setDashData(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

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

    const filteredCatalog = catalogAssets.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTab = selectedCategoryTab === 'Semua' || item.category === selectedCategoryTab;
        const matchesCatFilter = selectedCategoryFilter === 'all' || item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
        const matchesLocFilter = selectedLocationFilter === 'all' || item.location.toLowerCase().includes(selectedLocationFilter.toLowerCase());
        const matchesStatusFilter = selectedStatusFilter === 'all' || 
            (selectedStatusFilter === 'available' && item.status === 'Tersedia') ||
            (selectedStatusFilter === 'in_use' && item.status === 'Sedang Dipakai') ||
            (selectedStatusFilter === 'reserved' && item.status === 'Reserved') ||
            (selectedStatusFilter === 'maintenance' && item.status === 'Maintenance');

        return matchesQuery && matchesTab && matchesCatFilter && matchesLocFilter && matchesStatusFilter;
    });

    const CHART_COLORS = ['#C8102E', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#64748B'];

    // Determine current user role cleanly
    const isSuperAdmin = user?.role === 'super_admin';
    const isValidator = user?.role === 'validator';
    const isPegawai = user?.role === 'pegawai' || (!isSuperAdmin && !isValidator);

    return (
        <div className="space-y-8 font-sans">
            
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                        {getGreeting()}, {user?.name || 'User'}! 👋
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                        {isSuperAdmin && 'Overview sistem dan statistik penggunaan aset Kantor Regional Jawa Barat.'}
                        {isValidator && 'Panel persetujuan reservasi dan jadwal peminjaman aset kantor.'}
                        {isPegawai && 'Cari dan reservasi aset kantor dengan mudah.'}
                    </p>
                </div>
                {isPegawai && (
                    <Button 
                        onClick={() => navigate('/reservations')} 
                        className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs bg-ojk-red text-white cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Ajukan Reservasi Baru
                    </Button>
                )}
            </div>

            {/* ==========================================
                1. SUPER ADMIN DASHBOARD
                ========================================== */}
            {isSuperAdmin && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-red-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aset</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData?.stats?.total_assets || 50}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +12% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-ojk-red" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-emerald-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Tersedia</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData?.stats?.available || 28}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +18% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-amber-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Dipakai</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData?.stats?.in_use || 16}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +5% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-purple-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData?.stats?.maintenance || 6}</h4>
                                    <p className="text-[9px] text-red-500 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +3% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Wrench className="w-5 h-5 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Tren Reservasi Aset (6 Bulan Terakhir)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dashData?.charts?.monthly_bookings || defaultSuperAdminData.charts.monthly_bookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C8102E" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="peminjaman" stroke="#C8102E" strokeWidth={3} fillOpacity={1} fill="url(#colorReservations)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Penggunaan Berdasarkan Kategori</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashData?.charts?.category_usage || defaultSuperAdminData.charts.category_usage}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {(dashData?.charts?.category_usage || defaultSuperAdminData.charts.category_usage).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* ==========================================
                2. VALIDATOR DASHBOARD
                ========================================== */}
            {isValidator && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-amber-500">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Approval</span>
                                    <h4 className="text-2xl font-extrabold text-amber-600">{dashData?.stats?.pending_request || 3}</h4>
                                </div>
                                <Hourglass className="w-6 h-6 text-amber-500" />
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-emerald-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disetujui Hari Ini</span>
                                    <h4 className="text-2xl font-extrabold text-emerald-600">{dashData?.stats?.approved_today || 8}</h4>
                                </div>
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-red-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ditolak Hari Ini</span>
                                    <h4 className="text-2xl font-extrabold text-red-600">{dashData?.stats?.rejected_today || 1}</h4>
                                </div>
                                <XCircle className="w-6 h-6 text-red-600" />
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-blue-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Dipinjam Hari Ini</span>
                                    <h4 className="text-2xl font-extrabold text-blue-600">{dashData?.stats?.in_use || 16}</h4>
                                </div>
                                <Clock className="w-6 h-6 text-blue-600" />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2">
                            <CardTitle className="text-sm">Pengajuan Peminjaman Menunggu Persetujuan</CardTitle>
                            <Link to="/approvals" className="text-xs text-ojk-red hover:underline font-bold">
                                Lihat Semua
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Pemohon</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Aset</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Tanggal & Waktu</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Status</th>
                                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase text-right">Tindakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                        {(dashData?.recent_requests || []).length > 0 ? (
                                            dashData.recent_requests.map((req: any, idx: number) => (
                                                <tr key={idx} className="text-slate-700 dark:text-slate-350 text-xs">
                                                    <td className="px-6 py-4 font-bold">{req.employee_name}</td>
                                                    <td className="px-6 py-4 font-bold">{req.asset_name}</td>
                                                    <td className="px-6 py-4">{req.date} &bull; {req.time}</td>
                                                    <td className="px-6 py-4"><Badge status={req.status} /></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)}>Setujui</Button>
                                                            <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(req); setRejectionOpen(true); }}>Tolak</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                                    Tidak ada pengajuan peminjaman saat ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ==========================================
                3. PEGAWAI / KARYAWAN DASHBOARD (CATALOG & SHOWCASE)
                ========================================== */}
            {isPegawai && (
                <div className="space-y-6">
                    {/* Top 4 Summary Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-red-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aset</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">50</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +12% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-ojk-red" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-emerald-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Tersedia</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">28</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +18% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-amber-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Dipakai</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">16</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +5% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-purple-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">6</h4>
                                    <p className="text-[9px] text-red-500 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +3% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Wrench className="w-5 h-5 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Controls Bar */}
                    <Card className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                            
                            {/* Search Input */}
                            <div className="relative lg:col-span-4">
                                <Input
                                    placeholder="Cari aset (mobil, ruangan, laptop, dll)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 text-xs py-2.5"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            </div>

                            {/* Category Dropdown */}
                            <div className="lg:col-span-2">
                                <Select
                                    value={selectedCategoryFilter}
                                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                    className="text-xs py-2.5"
                                >
                                    <option value="all">Semua Kategori</option>
                                    <option value="kendaraan">Kendaraan Dinas</option>
                                    <option value="ruangan">Ruangan</option>
                                    <option value="elektronik">Elektronik</option>
                                    <option value="inventaris">Inventaris</option>
                                </Select>
                            </div>

                            {/* Location Dropdown */}
                            <div className="lg:col-span-2">
                                <Select
                                    value={selectedLocationFilter}
                                    onChange={(e) => setSelectedLocationFilter(e.target.value)}
                                    className="text-xs py-2.5"
                                >
                                    <option value="all">Semua Lokasi</option>
                                    <option value="basement">Basement</option>
                                    <option value="lantai 1">Lantai 1</option>
                                    <option value="lantai 2">Lantai 2</option>
                                    <option value="lantai 3">Lantai 3</option>
                                    <option value="parkiran">Parkiran</option>
                                </Select>
                            </div>

                            {/* Status Dropdown */}
                            <div className="lg:col-span-2">
                                <Select
                                    value={selectedStatusFilter}
                                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                    className="text-xs py-2.5"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="available">Tersedia</option>
                                    <option value="in_use">Sedang Dipakai</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="maintenance">Maintenance</option>
                                </Select>
                            </div>

                            {/* Filter Button */}
                            <div className="lg:col-span-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full text-xs font-bold py-2.5 rounded-xl border-red-200 text-ojk-red hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center gap-1.5 cursor-pointer"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategoryFilter('all');
                                        setSelectedLocationFilter('all');
                                        setSelectedStatusFilter('all');
                                        setSelectedCategoryTab('Semua');
                                        toast.info('Filter pencarian telah direset.');
                                    }}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Filter Lainnya</span>
                                </Button>
                            </div>

                        </div>
                    </Card>

                    {/* Quick Category Banner Cards (4 Grid Cards) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div 
                            onClick={() => { setSelectedCategoryTab('Kendaraan'); navigate('/reservations?category=Kendaraan'); }}
                            className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" 
                                alt="Kendaraan Dinas" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-between">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <Car className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white">Kendaraan Dinas</h4>
                                    <span className="text-[10px] text-slate-300 font-medium">12 Aset</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => { setSelectedCategoryTab('Ruangan'); navigate('/reservations?category=Ruangan'); }}
                            className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=600&q=80" 
                                alt="Ruangan" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-between">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <HomeIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white">Ruangan</h4>
                                    <span className="text-[10px] text-slate-300 font-medium">10 Aset</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => { setSelectedCategoryTab('Elektronik'); navigate('/reservations?category=Elektronik'); }}
                            className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80" 
                                alt="Elektronik" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-between">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <Laptop className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white">Elektronik</h4>
                                    <span className="text-[10px] text-slate-300 font-medium">20 Aset</span>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => { setSelectedCategoryTab('Inventaris'); navigate('/reservations?category=Elektronik'); }}
                            className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80" 
                                alt="Inventaris" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-between">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <Box className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white">Inventaris</h4>
                                    <span className="text-[10px] text-slate-300 font-medium">8 Aset</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Catalog Section */}
                    <div className="space-y-4 pt-2">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-lg font-black text-slate-850 dark:text-white tracking-tight">
                                Katalog Aset
                            </h3>

                            <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-4">
                                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl">
                                    {['Semua', 'Kendaraan', 'Ruangan', 'Elektronik', 'Inventaris'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedCategoryTab(tab)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                                selectedCategoryTab === tab
                                                    ? 'bg-white dark:bg-slate-800 text-ojk-red shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <span>Urutkan:</span>
                                    <select 
                                        value={sortBy} 
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="terbaru">Terbaru</option>
                                        <option value="nama">Nama A-Z</option>
                                        <option value="popularitas">Terpopuler</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3-Column Asset Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map(asset => (
                                    <Card key={asset.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img 
                                                src={asset.image} 
                                                alt={asset.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />

                                            <div className="absolute top-3 left-3">
                                                {asset.status === 'Tersedia' && (
                                                    <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                                                        Tersedia
                                                    </span>
                                                )}
                                                {asset.status === 'Sedang Dipakai' && (
                                                    <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                                                        Sedang Dipakai
                                                    </span>
                                                )}
                                                {asset.status === 'Reserved' && (
                                                    <span className="bg-yellow-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                                                        Reserved
                                                    </span>
                                                )}
                                                {asset.status === 'Maintenance' && (
                                                    <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                                                        Maintenance
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute bottom-3 left-3">
                                                <span className="bg-red-600 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                                                    {asset.category}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={() => toggleFavorite(asset.id)}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-red-600 transition-colors shadow-md cursor-pointer"
                                                title="Simpan Aset Favorit"
                                            >
                                                <Heart className={`w-4 h-4 ${favorites.includes(asset.id) ? 'fill-red-600 text-red-600' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <h4 className="text-base font-black text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                                    {asset.name}
                                                </h4>

                                                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-semibold">
                                                    {asset.specs.map((spec, i) => (
                                                        <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg">
                                                            {i === 0 ? <Users className="w-3 h-3 text-slate-400" /> : <MapPin className="w-3 h-3 text-slate-400" />}
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full text-xs font-bold py-2 rounded-xl cursor-pointer"
                                                    onClick={() => { setSelectedAssetDetail(asset); setAssetDetailOpen(true); }}
                                                >
                                                    Detail
                                                </Button>
                                                
                                                {asset.status === 'Tersedia' ? (
                                                    <Button 
                                                        variant="primary" 
                                                        className="w-full text-xs font-bold py-2 rounded-xl bg-ojk-red hover:bg-red-700 text-white cursor-pointer"
                                                        onClick={() => navigate(`/reservations?category=${encodeURIComponent(asset.category)}`)}
                                                    >
                                                        Reservasi
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="outline" 
                                                        className="w-full text-xs font-bold py-2 rounded-xl border-red-200 text-red-650 hover:bg-red-50 cursor-pointer"
                                                        onClick={() => navigate('/calendar')}
                                                    >
                                                        Lihat Jadwal
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400 font-semibold space-y-2">
                                    <Box className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p>Tidak ada aset yang ditemukan dengan kriteria pencarian ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="p-6 bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                                <CalendarCheck className="w-6 h-6 text-ojk-red" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">
                                    Tidak menemukan aset yang Anda cari?
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Ajukan permintaan aset khusus kepada admin.
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="primary"
                            className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                            onClick={() => navigate('/reservations')}
                        >
                            Ajukan Permintaan Aset
                        </Button>
                    </div>
                </div>
            )}

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
                            <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Spesifikasi & Kapasitas:</h5>
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
                                onClick={() => { setAssetDetailOpen(false); navigate(`/reservations?category=${encodeURIComponent(selectedAssetDetail.category)}`); }}
                            >
                                Ajukan Reservasi Aset Ini
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Rejection Modal */}
            <Dialog 
                isOpen={rejectionOpen} 
                onClose={() => { setRejectionOpen(false); setRejectionReason(''); }} 
                title="Tolak Pengajuan Peminjaman Aset"
            >
                <div className="space-y-4">
                    <div className="text-xs text-slate-500 font-semibold">
                        Menolak pengajuan peminjaman <strong className="text-slate-800 dark:text-slate-200">{selectedRequest?.asset_name}</strong> oleh <strong className="text-slate-800 dark:text-slate-200">{selectedRequest?.employee_name}</strong>.
                    </div>
                    <TextArea 
                        label="Alasan Penolakan (Wajib)" 
                        placeholder="Tulis alasan penolakan..." 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setRejectionOpen(false)}>Batal</Button>
                        <Button variant="danger" onClick={handleRejectSubmit} disabled={submitting}>
                            {submitting ? 'Memproses...' : 'Tolak Pengajuan'}
                        </Button>
                    </div>
                </div>
            </Dialog>

        </div>
    );
};
