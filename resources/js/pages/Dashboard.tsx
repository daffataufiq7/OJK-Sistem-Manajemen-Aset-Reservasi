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
    History as HistoryIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, toast, Dialog, TextArea } from '../components/UI';
import { useNavigate, Link } from 'react-router-dom';

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
    
    // Modal states for approvals
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/dashboard');
            setDashData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard', error);
            toast.error('Gagal mengambil data dashboard.');
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat data dashboard...</span>
            </div>
        );
    }

    if (!dashData) {
        return (
            <div className="text-center py-12 text-slate-500 font-medium">
                Gagal memuat informasi. Silakan coba beberapa saat lagi.
            </div>
        );
    }

    const COLORS = ['#C8102E', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#64748B'];

    return (
        <div className="space-y-8 font-sans">
            
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {getGreeting()}, {user?.name}! 👋
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-medium leading-relaxed">
                        Berikut overview penggunaan aset kantor OJK Jawa Barat hari ini.
                    </p>
                </div>
                {user?.role === 'pegawai' && (
                    <Button 
                        onClick={() => navigate('/reservations')} 
                        className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Ajukan Reservasi Baru
                    </Button>
                )}
            </div>

            {/* ==========================================
                1. SUPER ADMIN DASHBOARD
                ========================================== */}
            {user?.role === 'super_admin' && (
                <React.Fragment>
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {/* Card 1 */}
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-red-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Aset</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData.stats.total_assets}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +12% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-ojk-red" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2 */}
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-emerald-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aset Tersedia</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData.stats.available}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +8% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3 */}
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-amber-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Dipakai</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData.stats.in_use}</h4>
                                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <TrendingUp className="w-3 h-3" /> +5% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 4 */}
                        <Card className="hover:scale-[1.01] transition-transform duration-250 border-l-4 border-l-purple-600">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance</span>
                                    <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{dashData.stats.maintenance}</h4>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {/* Super Admin Quick Stats Row 2 */}
                        <Card className="p-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pengguna</span>
                                <span className="text-xl font-bold">{dashData.stats.total_users}</span>
                            </div>
                            <Users className="w-5 h-5 text-slate-400" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between border-l-2 border-l-yellow-500">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Menunggu Approval</span>
                                <span className="text-xl font-bold">{dashData.stats.pending_approval}</span>
                            </div>
                            <Hourglass className="w-5 h-5 text-yellow-500" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between border-l-2 border-l-emerald-500">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Disetujui Hari Ini</span>
                                <span className="text-xl font-bold">{dashData.stats.approved_today}</span>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </Card>
                        <Card className="p-4 flex items-center justify-between border-l-2 border-l-red-500">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Ditolak Hari Ini</span>
                                <span className="text-xl font-bold">{dashData.stats.rejected_today}</span>
                            </div>
                            <XCircle className="w-5 h-5 text-red-500" />
                        </Card>
                    </div>

                    {/* Charts Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Line Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-sm">Peminjaman Aset per Bulan</CardTitle>
                                <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-lg">Tahun 2026</span>
                            </CardHeader>
                            <CardContent className="h-64 pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashData.charts.monthly_bookings} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPeminjaman" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C8102E" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#C8102E" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '11px' }} />
                                        <Area type="monotone" dataKey="peminjaman" stroke="#C8102E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPeminjaman)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Pie Donut Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Penggunaan Kategori</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex flex-col justify-between pt-0 pb-4">
                                <div className="h-[70%] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashData.charts.category_usage}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {dashData.charts.category_usage.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} kali`} contentStyle={{ fontSize: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-500">
                                    {dashData.charts.category_usage.map((entry: any, index: number) => (
                                        <div key={index} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span>{entry.name} ({entry.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Grid: Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Top Assets */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Aset Paling Banyak Digunakan</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                    {dashData.widgets.top_assets.map((asset: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={asset.photo} 
                                                    alt={asset.name} 
                                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100/50" 
                                                />
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{asset.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{asset.category}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{asset.usage_count}</span>
                                                <span className="text-[9px] font-medium text-slate-400 block">Kali dipinjam</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Logs */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Aktivitas Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                    {dashData.widgets.recent_activity.map((log: any, i: number) => (
                                        <div key={i} className="p-4 flex flex-col space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{log.user_name}</span>
                                                <span className="text-[9px] font-medium text-slate-400">{log.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-normal">{log.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Maintenance & Insights */}
                        <div className="space-y-6">
                            {/* Upcoming Maintenance */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Jadwal Perawatan Aset</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                        {dashData.widgets.upcoming_maintenance.length > 0 ? (
                                            dashData.widgets.upcoming_maintenance.map((m: any, i: number) => (
                                                <div key={i} className="p-4 flex items-center justify-between">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{m.name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{m.code}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-slate-655 dark:text-slate-350 block">{m.date}</span>
                                                        <span className="text-[9px] font-bold text-purple-650 uppercase tracking-wider">Maintenance</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-[10px] text-slate-450">
                                                Tidak ada jadwal perawatan minggu ini.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dynamic Premium Insights */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 bg-red-500/2 border border-red-500/10 rounded-2xl flex flex-col space-y-1">
                                    <Info className="w-4 h-4 text-ojk-red" />
                                    <span className="text-[9px] font-medium text-slate-400">Peminjaman</span>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">Meningkat 18% dari bulan lalu.</p>
                                </div>

                                <div className="p-3.5 bg-emerald-500/2 border border-emerald-500/10 rounded-2xl flex flex-col space-y-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[9px] font-medium text-slate-400">Aset Favorit</span>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">Ruang Rapat A sering digunakan.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </React.Fragment>
            )}

            {/* ==========================================
                2. VALIDATOR DASHBOARD
                ========================================== */}
            {user?.role === 'validator' && (
                <React.Fragment>
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
                        <Card className="border-l-4 border-l-yellow-500 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
                                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData.stats.pending_request}</span>
                            </div>
                            <Hourglass className="w-6 h-6 text-yellow-500 opacity-80" />
                        </Card>
                        <Card className="border-l-4 border-l-emerald-500 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Today</span>
                                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData.stats.approved_today}</span>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
                        </Card>
                        <Card className="border-l-4 border-l-red-500 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rejected Today</span>
                                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData.stats.rejected_today}</span>
                            </div>
                            <XCircle className="w-6 h-6 text-red-500 opacity-80" />
                        </Card>
                        <Card className="border-l-4 border-l-amber-500 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aset Dipakai</span>
                                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData.stats.in_use}</span>
                            </div>
                            <Clock className="w-6 h-6 text-amber-500 opacity-80" />
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance</span>
                                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{dashData.stats.maintenance}</span>
                            </div>
                            <Wrench className="w-6 h-6 text-purple-500 opacity-80" />
                        </Card>
                    </div>

                    {/* Pending Request Queue Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-sm">Pengajuan Peminjaman Terbaru</CardTitle>
                                <Link to="/approvals" className="text-xs text-ojk-red hover:underline font-bold flex items-center gap-0.5">
                                    Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Pegawai / Divisi</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Aset</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Jadwal</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Status</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase text-right">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                            {dashData.recent_requests.length > 0 ? (
                                                dashData.recent_requests.map((req: any, index: number) => (
                                                    <tr key={index} className="text-slate-700 dark:text-slate-350 text-xs">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-750 dark:text-slate-200">{req.employee_name}</span>
                                                                <span className="text-[9px] font-medium text-slate-400">{req.division}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold">{req.asset_name}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col leading-tight">
                                                                <span>{req.date}</span>
                                                                <span className="text-[9px] text-slate-400 font-bold">{req.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge status={req.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {req.status === 'pending' ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Button 
                                                                        variant="primary" 
                                                                        size="sm" 
                                                                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                                                                        onClick={() => handleApprove(req.id)}
                                                                        disabled={submitting}
                                                                    >
                                                                        Setujui
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold border-red-200 text-red-650 hover:bg-red-50"
                                                                        onClick={() => { setSelectedRequest(req); setRejectionOpen(true); }}
                                                                        disabled={submitting}
                                                                    >
                                                                        Tolak
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-semibold text-slate-400">Tindakan Selesai</span>
                                                            )}
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

                        {/* Today's Timeline list */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Jadwal Penggunaan Hari Ini</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 space-y-4">
                                    {dashData.today_timeline.length > 0 ? (
                                        dashData.today_timeline.map((item: any, i: number) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="text-xs font-bold text-slate-500 py-1 shrink-0">
                                                    {item.time} WIB
                                                </div>
                                                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 pb-1 w-full">
                                                    {/* marker dot */}
                                                    <span className="absolute top-2.5 -left-1.5 w-3 h-3 rounded-full bg-ojk-red shrink-0"></span>
                                                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">{item.asset_name}</h5>
                                                    <div className="flex justify-between items-center text-[10px] text-slate-450">
                                                        <span>{item.division}</span>
                                                        <Badge status={item.status} className="scale-85 origin-right" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-[11px] text-slate-400 font-semibold">
                                            Tidak ada jadwal penggunaan hari ini.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </React.Fragment>
            )}

            {/* ==========================================
                3. PEGAWAI DASHBOARD
                ========================================== */}
            {user?.role === 'pegawai' && (
                <React.Fragment>
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <Card className="p-5 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 border-l-4 border-l-ojk-red">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengajuan Aktif</span>
                                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{dashData.stats.active_reservations}</span>
                            </div>
                            <CalendarCheck className="w-6 h-6 text-ojk-red" />
                        </Card>

                        <Card className="p-5 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 border-l-4 border-l-yellow-500">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Persetujuan</span>
                                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{dashData.stats.waiting_approval}</span>
                            </div>
                            <Hourglass className="w-6 h-6 text-yellow-500" />
                        </Card>

                        <Card className="p-5 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 border-l-4 border-l-blue-500">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disetujui</span>
                                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{dashData.stats.approved_reservations}</span>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        </Card>

                        <Card className="p-5 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 border-l-4 border-l-slate-400">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Peminjaman</span>
                                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{dashData.stats.total_history}</span>
                            </div>
                            <HistoryIcon className="w-6 h-6 text-slate-400" />
                        </Card>
                    </div>

                    {/* Schedule and Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Right: Personal Bookings List */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-sm">Pengajuan Reservasi Saya</CardTitle>
                                <Link to="/history" className="text-xs text-ojk-red hover:underline font-bold">
                                    Lihat Riwayat
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Nama Aset</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Kategori</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Tanggal & Waktu</th>
                                                <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                            {dashData.my_reservations.length > 0 ? (
                                                dashData.my_reservations.map((item: any, idx: number) => (
                                                    <tr key={idx} className="text-slate-700 dark:text-slate-350 text-xs">
                                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.asset_name}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-400">{item.category}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span>{item.start_date}</span>
                                                                <span className="text-[9px] text-slate-400 font-bold">{item.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge status={item.status} />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-semibold">
                                                        Anda belum melakukan pengajuan peminjaman aset.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Left: Upcoming Schedule & Available Assets */}
                        <div className="space-y-6">
                            {/* Jadwal Saya */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Jadwal Saya Mendatang</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-4 space-y-3">
                                        {dashData.my_schedule.length > 0 ? (
                                            dashData.my_schedule.map((item: any, i: number) => (
                                                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center gap-3">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.asset_name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 mt-1">{item.date} &bull; {item.time}</span>
                                                    </div>
                                                    <Badge status={item.status} className="scale-90" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-[10px] text-slate-450">
                                                Tidak ada jadwal peminjaman mendatang.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aset Tersedia Hari Ini */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Aset Tersedia Hari Ini</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                        {dashData.available_today.length > 0 ? (
                                            dashData.available_today.map((asset: any, i: number) => (
                                                <div key={i} className="p-4 flex items-center justify-between gap-4">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-xs font-bold text-slate-750 dark:text-slate-250">{asset.name}</span>
                                                        <span className="text-[9px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                                            {asset.location}
                                                        </span>
                                                    </div>
                                                    <Link to="/reservations" className="text-xs font-extrabold text-ojk-red flex items-center gap-0.5 hover:underline shrink-0">
                                                        Pinjam <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-[10px] text-slate-450">
                                                Semua aset sedang digunakan hari ini.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </React.Fragment>
            )}

            {/* Rejection Modal for Validator */}
            <Dialog 
                isOpen={rejectionOpen} 
                onClose={() => { setRejectionOpen(false); setRejectionReason(''); }} 
                title="Tolak Pengajuan Peminjaman Aset"
            >
                <div className="space-y-4">
                    <div className="text-xs text-slate-500 font-semibold">
                        Anda akan menolak pengajuan peminjaman <strong className="text-slate-800 dark:text-slate-200">{selectedRequest?.asset_name}</strong> oleh <strong className="text-slate-800 dark:text-slate-200">{selectedRequest?.employee_name}</strong>.
                    </div>
                    
                    <TextArea 
                        label="Alasan Penolakan (Wajib)" 
                        placeholder="Tulis alasan penolakan secara jelas..." 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button 
                            variant="secondary" 
                            onClick={() => { setRejectionOpen(false); setRejectionReason(''); }}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleRejectSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Memproses...' : 'Tolak Pengajuan'}
                        </Button>
                    </div>
                </div>
            </Dialog>

        </div>
    );
};
