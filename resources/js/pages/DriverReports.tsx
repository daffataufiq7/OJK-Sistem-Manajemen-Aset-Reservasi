import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Card, CardContent, Badge, Button, toast } from '../components/UI';
import { DRIVER_LIST, DriverInfo } from '../constants/drivers';
import { 
    Car, 
    UserCheck, 
    UserX, 
    CalendarCheck, 
    FileText, 
    User, 
    MapPin, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Asset {
    id: number;
    code: string;
    name: string;
    location: string;
}

interface UserProfile {
    id: number;
    name: string;
    nip: string;
    division?: {
        name: string;
    };
}

interface Reservation {
    id: number;
    user_id: number;
    asset_id: number;
    start_date: string;
    end_date: string;
    purpose: string;
    destination: string | null;
    driver_required: boolean;
    driver_name: string | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'reserved' | 'in_use' | 'completed' | 'cancelled';
    user?: UserProfile;
    asset?: Asset;
    created_at: string;
}

export const DriverReports: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Guard: Only super_admin & validator
    useEffect(() => {
        if (user && !['super_admin', 'validator'].includes(user.role)) {
            toast.error('Akses ditolak. Halaman ini khusus untuk Validator dan Admin.');
            navigate('/dashboard');
        }
    }, [user]);

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/reservations');
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching driver reports', error);
            toast.error('Gagal memuat data laporan driver.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter reservations that have assigned drivers
    const driverAssignments = reservations.filter(r => r.driver_name && r.driver_name.trim() !== '');

    // Active assignments right now (status approved, reserved, or in_use)
    const activeAssignments = driverAssignments.filter(r => ['approved', 'reserved', 'in_use'].includes(r.status));

    // Map realtime status for each driver in master DRIVER_LIST
    const driverStatusList = DRIVER_LIST.map(driver => {
        const activeTrip = activeAssignments.find(r => r.driver_name?.toLowerCase().trim() === driver.name.toLowerCase().trim());
        const totalTrips = driverAssignments.filter(r => r.driver_name?.toLowerCase().trim() === driver.name.toLowerCase().trim()).length;

        return {
            ...driver,
            isBusy: !!activeTrip,
            activeTrip,
            totalTrips
        };
    });

    const busyCount = driverStatusList.filter(d => d.isBusy).length;
    const freeCount = driverStatusList.filter(d => !d.isBusy).length;
    const totalTripsThisMonth = driverAssignments.length;

    // Columns for Historical Driver Assignments Table
    const columns = [
        {
            key: 'driver_name',
            header: 'Nama Driver Kantor',
            render: (res: Reservation) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {res.driver_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{res.driver_name}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">Driver Kantor OJK</span>
                    </div>
                </div>
            )
        },
        {
            key: 'asset.name',
            header: 'Kendaraan / Mobil',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.asset?.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{res.asset?.code}</span>
                </div>
            )
        },
        {
            key: 'user.name',
            header: 'Pegawai Peminjam',
            render: (res: Reservation) => (
                <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.user?.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400">{res.user?.division?.name || '-'}</span>
                </div>
            )
        },
        {
            key: 'destination',
            header: 'Tujuan Perjalanan',
            render: (res: Reservation) => (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{res.destination || '-'}</span>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Jadwal Penugasan',
            render: (res: Reservation) => (
                <div className="flex flex-col text-[11px] leading-snug">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(res.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {new Date(res.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status Penggunaan',
            render: (res: Reservation) => <Badge status={res.status} />
        }
    ];

    const filterOptions = [
        {
            key: 'driver_name',
            label: 'Driver',
            options: DRIVER_LIST.map(d => ({ value: d.name, label: d.name }))
        },
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'approved', label: 'Disetujui' },
                { value: 'in_use', label: 'Sedang Dipakai' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Batal' }
            ]
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat rekap laporan driver...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                    <Car className="w-7 h-7 text-ojk-red" />
                    Laporan & Rekap Penugasan Driver
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Pantau ketersediaan driver kantor secara realtime, penugasan mobil dinas, dan histori perjalanan pegawai.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Drivers */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Driver Kantor</span>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{DRIVER_LIST.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <User className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Driver Busy / In Use */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sedang Bertugas</span>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{busyCount}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <UserCheck className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Driver Free / Standby */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standby / Tersedia</span>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{freeCount}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                {/* Total Trips */}
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Perjalanan</span>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalTripsThisMonth}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

            </div>

            {/* Realtime Driver Status Cards Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                        <Activity className="w-4 h-4 text-ojk-red" />
                        Status Realtime Driver Kantor Hari Ini
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {driverStatusList.map((d) => (
                        <div 
                            key={d.id}
                            className={`p-4 rounded-2xl border transition-all ${
                                d.isBusy 
                                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40' 
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                        d.isBusy 
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' 
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                    }`}>
                                        {d.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">{d.name}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{d.nip} &bull; {d.phone}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                                    d.isBusy 
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' 
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                    {d.isBusy ? 'Sedang Bertugas' : 'Tersedia'}
                                </span>
                            </div>

                            {/* Active trip info */}
                            {d.isBusy && d.activeTrip ? (
                                <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-900/30 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                        <span>Mobil: {d.activeTrip.asset?.name}</span>
                                        <span className="uppercase">{d.activeTrip.asset?.code}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Peminjam: {d.activeTrip.user?.name} ({d.activeTrip.user?.division?.name})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Tujuan: {d.activeTrip.destination || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                            {new Date(d.activeTrip.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(d.activeTrip.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                                    <span>Siap ditugaskan untuk reservasi baru</span>
                                    <span>Total Tugas: {d.totalTrips}x</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Historical Driver Assignments */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col space-y-1">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                        Log Riwayat Penugasan Driver
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Laporan histori seluruh penugasan pengemudi kantor yang telah disetujui.
                    </p>
                </div>

                <DataTable 
                    columns={columns}
                    data={driverAssignments}
                    searchKey="driver_name"
                    searchPlaceholder="Cari berdasarkan nama driver kantor..."
                    filterOptions={filterOptions}
                    exportName="laporan_penugasan_driver_ojk"
                />
            </div>

        </div>
    );
};
