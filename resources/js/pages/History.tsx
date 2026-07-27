import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Badge, Button, Dialog, Input, Select, TextArea, Card, toast } from '../components/UI';
import { DRIVER_LIST } from '../constants/drivers';
import { 
    History as HistoryIcon, 
    MapPin, 
    User, 
    Calendar, 
    Clock, 
    Eye, 
    Edit3, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    XCircle, 
    FileText, 
    Filter, 
    Layers, 
    Car, 
    Building2,
    ShieldAlert,
    CheckSquare,
    RefreshCw
} from 'lucide-react';

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
    email?: string;
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
    rejection_reason: string | null;
    user?: UserProfile;
    asset?: Asset;
    created_at: string;
}

export const History: React.FC = () => {
    const { user } = useAuth();
    const isAdminOrValidator = user && ['super_admin', 'validator'].includes(user.role);

    const [history, setHistory] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal States
    const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Edit Form States
    const [editStatus, setEditStatus] = useState<string>('pending');
    const [editDriverName, setEditDriverName] = useState<string>('');
    const [selectedDriverOption, setSelectedDriverOption] = useState<string>('');
    const [editRejectionReason, setEditRejectionReason] = useState<string>('');
    const [editNotes, setEditNotes] = useState<string>('');

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/reservations');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history', error);
            toast.error('Gagal memuat riwayat peminjaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Summary Statistics
    const stats = useMemo(() => {
        const total = history.length;
        const approved = history.filter(r => ['approved', 'reserved'].includes(r.status)).length;
        const inUse = history.filter(r => r.status === 'in_use').length;
        const completed = history.filter(r => r.status === 'completed').length;
        const rejectedOrCancelled = history.filter(r => ['rejected', 'cancelled'].includes(r.status)).length;
        return { total, approved, inUse, completed, rejectedOrCancelled };
    }, [history]);

    // Handle Cancel (Pegawai or Admin)
    const handleCancel = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan reservasi ini?')) return;

        try {
            setSubmitting(true);
            await axios.post(`/reservations/${id}/cancel`);
            toast.success('Reservasi berhasil dibatalkan.');
            fetchHistory();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal membatalkan reservasi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Detail Modal
    const handleOpenDetail = (res: Reservation) => {
        setSelectedRes(res);
        setDetailModalOpen(true);
    };

    // Open Edit Modal (Admin & Validator)
    const handleOpenEdit = (res: Reservation) => {
        setSelectedRes(res);
        setEditStatus(res.status);
        setEditNotes(res.notes || '');
        setEditRejectionReason(res.rejection_reason || '');
        const driverName = res.driver_name || '';
        setEditDriverName(driverName);

        const foundDriver = DRIVER_LIST.find(d => d.name === driverName);
        if (foundDriver) {
            setSelectedDriverOption(driverName);
        } else if (driverName) {
            setSelectedDriverOption('custom');
        } else {
            setSelectedDriverOption('');
        }

        setEditModalOpen(true);
    };

    // Save Edit Status
    const handleSaveEdit = async () => {
        if (!selectedRes) return;

        if (editStatus === 'rejected' && (!editRejectionReason || editRejectionReason.trim().length < 3)) {
            toast.warning('Silakan berikan alasan penolakan yang jelas (minimal 3 karakter).');
            return;
        }

        try {
            setSubmitting(true);
            const driverToSave = selectedDriverOption === 'custom' 
                ? editDriverName.trim() 
                : (selectedDriverOption || editDriverName.trim() || null);

            await axios.put(`/reservations/${selectedRes.id}`, {
                status: editStatus,
                rejection_reason: editStatus === 'rejected' ? editRejectionReason : null,
                notes: editNotes || null,
                driver_name: driverToSave
            });

            toast.success(`Status reservasi #RSV-${selectedRes.id} berhasil diperbarui.`);
            setEditModalOpen(false);
            setSelectedRes(null);
            fetchHistory();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui status reservasi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Delete Modal (Admin & Validator)
    const handleOpenDelete = (res: Reservation) => {
        setSelectedRes(res);
        setDeleteModalOpen(true);
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
        if (!selectedRes) return;

        try {
            setSubmitting(true);
            await axios.delete(`/reservations/${selectedRes.id}`);
            toast.success(`Riwayat reservasi #RSV-${selectedRes.id} berhasil dihapus.`);
            setDeleteModalOpen(false);
            setSelectedRes(null);
            fetchHistory();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus riwayat.');
        } finally {
            setSubmitting(false);
        }
    };

    // Columns configuration for DataTable
    const columns = [
        {
            key: 'id',
            header: 'Kode RSV',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1 min-w-[90px]">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs tracking-wide">
                        #RSV-{res.id}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-medium">
                        {new Date(res.created_at || res.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                </div>
            )
        },
        {
            key: 'user.name',
            header: 'Pegawai Pemohon',
            render: (res: Reservation) => (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-slate-800 border border-red-100 dark:border-slate-700 flex items-center justify-center text-ojk-red dark:text-slate-200 font-bold shrink-0 text-xs shadow-xs">
                        {res.user?.name ? res.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col leading-tight overflow-hidden space-y-0.5">
                        <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[220px]" title={res.user?.name}>
                            {res.user?.name || '-'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
                            NIP: {res.user?.nip || '-'} &bull; {res.user?.division?.name || '-'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'asset.name',
            header: 'Aset Peminjaman',
            render: (res: Reservation) => (
                <div className="flex flex-col leading-tight min-w-[190px] space-y-1">
                    <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[240px]" title={res.asset?.name}>
                        {res.asset?.name || '-'}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9.5px] font-extrabold rounded-md uppercase tracking-wider border border-slate-200/60 dark:border-slate-700">
                            {res.asset?.code || 'AST'}
                        </span>
                        {res.asset?.location && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]" title={res.asset.location}>
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {res.asset.location}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Waktu Peminjaman',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1 text-xs min-w-[210px]">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-ojk-red shrink-0" />
                        <span>{new Date(res.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pl-5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                            {new Date(res.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'purpose',
            header: 'Agenda & Driver',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1.5 min-w-[200px] max-w-[260px]">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2" title={res.purpose}>
                        {res.purpose}
                    </span>
                    {res.driver_name && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 w-fit">
                            <User className="w-3 h-3 text-emerald-600" /> Driver: {res.driver_name}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1 min-w-[120px]">
                    <Badge status={res.status} />
                    {res.status === 'rejected' && res.rejection_reason && (
                        <span className="text-[10.5px] text-red-500 font-medium max-w-[150px] line-clamp-2" title={res.rejection_reason}>
                            Alasan: {res.rejection_reason}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Opsi CRUD',
            sortable: false,
            render: (res: Reservation) => (
                <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
                    {/* View Detail Button */}
                    <button
                        onClick={() => handleOpenDetail(res)}
                        title="Lihat Detail"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                    >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Detail</span>
                    </button>

                    {/* Edit Status Button (Admin & Validator) */}
                    {isAdminOrValidator && (
                        <button
                            onClick={() => handleOpenEdit(res)}
                            title="Ubah Status / Edit"
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="hidden sm:inline">Ubah</span>
                        </button>
                    )}

                    {/* Delete Button (Admin & Validator) */}
                    {isAdminOrValidator && (
                        <button
                            onClick={() => handleOpenDelete(res)}
                            title="Hapus Riwayat"
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            <span className="hidden sm:inline">Hapus</span>
                        </button>
                    )}

                    {/* Cancel Button (Pegawai) */}
                    {!isAdminOrValidator && ['pending', 'approved', 'reserved'].includes(res.status) && (
                        <Button
                            variant="danger"
                            size="sm"
                            className="rounded-xl px-3 py-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 border-none shrink-0 shadow-2xs"
                            onClick={() => handleCancel(res.id)}
                            disabled={submitting}
                        >
                            Batalkan
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'pending', label: 'Menunggu (Pending)' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'reserved', label: 'Telah Dipesan' },
                { value: 'in_use', label: 'Sedang Dipakai' },
                { value: 'completed', label: 'Selesai' },
                { value: 'rejected', label: 'Ditolak' },
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
                <span className="text-xs text-slate-500 font-semibold">Memuat riwayat peminjaman...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-8">
            
            {/* Header Title & Refresh Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                            <HistoryIcon className="w-6 h-6" />
                        </div>
                        Riwayat Peminjaman Aset
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        {isAdminOrValidator 
                            ? 'Laporan log lengkap dan manajemen CRUD riwayat peminjaman aset seluruh pegawai Kantor OJK Jawa Barat.'
                            : 'Daftar seluruh transaksi peminjaman aset kantor yang pernah Anda ajukan.' 
                        }
                    </p>
                </div>

                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchHistory}
                    className="rounded-xl flex items-center gap-1.5 self-start sm:self-auto text-xs"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Riwayat</span>
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</h3>
                </Card>

                <Card className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Disetujui</span>
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">{stats.approved}</h3>
                </Card>

                <Card className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sedang Dipakai</span>
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                            <Car className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{stats.inUse}</h3>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Selesai</span>
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 mt-2">{stats.completed}</h3>
                </Card>
            </div>

            {/* Table Container */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={history}
                    searchKey="asset.name"
                    searchPlaceholder="Cari berdasarkan nama aset, pemohon, keperluan..."
                    filterOptions={filterOptions}
                    exportName="log_riwayat_peminjaman_ojk"
                />
            </div>

            {/* ==========================================
                1. MODAL DETAIL RESERVASI
               ========================================== */}
            <Dialog
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title={`Detail Riwayat Reservasi #RSV-${selectedRes?.id}`}
                size="lg"
            >
                {selectedRes && (
                    <div className="space-y-5 py-1 font-sans">
                        {/* Header Status Banner */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-extrabold text-slate-600 dark:text-slate-300">
                                    #RSV-{selectedRes.id}
                                </span>
                                <Badge status={selectedRes.status} />
                            </div>
                            <span className="text-xs text-slate-400 font-medium">
                                Diajukan: {new Date(selectedRes.created_at || selectedRes.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        {/* Grid Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Card Pemohon */}
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-ojk-red">
                                    <User className="w-3.5 h-3.5" /> Data Pegawai Pemohon
                                </h4>
                                <div className="space-y-1 pl-5 text-slate-700 dark:text-slate-300">
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedRes.user?.name || '-'}</p>
                                    <p><span className="text-slate-400">NIP:</span> {selectedRes.user?.nip || '-'}</p>
                                    <p><span className="text-slate-400">Divisi / Satker:</span> {selectedRes.user?.division?.name || '-'}</p>
                                    {selectedRes.user?.email && <p><span className="text-slate-400">Email:</span> {selectedRes.user.email}</p>}
                                </div>
                            </div>

                            {/* Card Aset */}
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                                <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-ojk-red">
                                    <Building2 className="w-3.5 h-3.5" /> Informasi Aset
                                </h4>
                                <div className="space-y-1 pl-5 text-slate-700 dark:text-slate-300">
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedRes.asset?.name || '-'}</p>
                                    <p><span className="text-slate-400">Kode Aset:</span> <span className="font-mono font-semibold">{selectedRes.asset?.code || '-'}</span></p>
                                    <p><span className="text-slate-400">Lokasi:</span> {selectedRes.asset?.location || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Jadwal & Driver */}
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                            <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-ojk-red">
                                <Calendar className="w-3.5 h-3.5" /> Waktu & Penugasan
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5 text-slate-700 dark:text-slate-300">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Waktu Mulai:</span>
                                    <span className="font-bold text-slate-850 dark:text-white">
                                        {new Date(selectedRes.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &bull; {new Date(selectedRes.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Waktu Selesai:</span>
                                    <span className="font-bold text-slate-850 dark:text-white">
                                        {new Date(selectedRes.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &bull; {new Date(selectedRes.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                            </div>

                            <div className="pl-5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                <span className="text-slate-400">Kebutuhan Driver:</span>
                                <span className="font-semibold text-slate-800 dark:text-white">
                                    {selectedRes.driver_required ? 'Dibutuhkan Driver' : 'Tanpa Driver'}
                                </span>
                            </div>

                            {selectedRes.driver_name && (
                                <div className="pl-5 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                        <Car className="w-4 h-4" /> Driver Ditugaskan:
                                    </span>
                                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{selectedRes.driver_name}</span>
                                </div>
                            )}
                        </div>

                        {/* Keperluan / Agenda */}
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                            <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider text-ojk-red">
                                <FileText className="w-3.5 h-3.5" /> Keperluan / Agenda Dinas
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-5 font-medium">
                                {selectedRes.purpose}
                            </p>
                            {selectedRes.destination && (
                                <p className="pl-5 text-slate-500 dark:text-slate-400 font-semibold pt-1">
                                    Tujuan Lokasi: <span className="text-slate-800 dark:text-slate-200">{selectedRes.destination}</span>
                                </p>
                            )}
                        </div>

                        {/* Catatan / Alasan Penolakan */}
                        {selectedRes.rejection_reason && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/30 space-y-1 text-xs text-red-700 dark:text-red-300">
                                <h4 className="font-bold flex items-center gap-2 text-red-800 dark:text-red-200">
                                    <XCircle className="w-4 h-4" /> Alasan Penolakan:
                                </h4>
                                <p className="pl-6 font-medium">{selectedRes.rejection_reason}</p>
                            </div>
                        )}

                        {selectedRes.notes && (
                            <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs text-slate-700 dark:text-slate-300">
                                <h4 className="font-bold flex items-center gap-2">
                                    Catatan Tambahan:
                                </h4>
                                <p className="pl-5 font-medium">{selectedRes.notes}</p>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)} className="rounded-xl">
                                Tutup
                            </Button>
                            {isAdminOrValidator && (
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => { setDetailModalOpen(false); handleOpenEdit(selectedRes); }} 
                                    className="rounded-xl flex items-center gap-1.5"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> Ubah Status
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ==========================================
                2. MODAL UBAH STATUS (EDIT CRUD)
               ========================================== */}
            <Dialog
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={`Ubah Status Reservasi #RSV-${selectedRes?.id}`}
                size="md"
            >
                {selectedRes && (
                    <div className="space-y-4 py-1 font-sans text-xs">
                        {/* Summary Header */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedRes.asset?.name}</span>
                                <Badge status={selectedRes.status} />
                            </div>
                            <span className="text-slate-500 dark:text-slate-400">Pemohon: <strong className="text-slate-700 dark:text-slate-200">{selectedRes.user?.name}</strong> ({selectedRes.user?.division?.name})</span>
                        </div>

                        {/* Form Inputs */}
                        <Select
                            label="Pilih Status Baru"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                        >
                            <option value="pending">Menunggu Persetujuan (Pending)</option>
                            <option value="approved">Disetujui (Approved)</option>
                            <option value="reserved">Telah Dipesan (Reserved)</option>
                            <option value="in_use">Sedang Dipakai (In Use)</option>
                            <option value="completed">Selesai (Completed)</option>
                            <option value="rejected">Ditolak (Rejected)</option>
                            <option value="cancelled">Dibatalkan (Cancelled)</option>
                        </Select>

                        {/* Driver Selector */}
                        <div className="space-y-1.5">
                            <label className="font-semibold text-slate-650 dark:text-slate-350">Penugasan Driver / Pengemudi</label>
                            <Select
                                value={selectedDriverOption}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedDriverOption(val);
                                    if (val !== 'custom') {
                                        setEditDriverName(val);
                                    }
                                }}
                            >
                                <option value="">-- Tanpa Driver --</option>
                                {DRIVER_LIST.map((drv, idx) => (
                                    <option key={idx} value={drv.name}>
                                        {drv.name} ({drv.nip}) - {drv.phone}
                                    </option>
                                ))}
                                <option value="custom">+ Input Nama Driver Manual</option>
                            </Select>
                        </div>

                        {selectedDriverOption === 'custom' && (
                            <Input
                                label="Nama Driver Manual"
                                placeholder="Masukkan nama driver..."
                                value={editDriverName}
                                onChange={(e) => setEditDriverName(e.target.value)}
                            />
                        )}

                        {/* Rejection Reason (If status is rejected) */}
                        {editStatus === 'rejected' && (
                            <TextArea
                                label="Alasan Penolakan (Wajib jika menolak)"
                                placeholder="Tuliskan alasan mengapa permohonan ini ditolak..."
                                value={editRejectionReason}
                                onChange={(e) => setEditRejectionReason(e.target.value)}
                                className="border-red-300 focus:border-red-500"
                            />
                        )}

                        {/* Catatan Tambahan */}
                        <TextArea
                            label="Catatan Tambahan (Opsional)"
                            placeholder="Catatan internal atau keterangan untuk pemohon..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditModalOpen(false)}
                                disabled={submitting}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={handleSaveEdit}
                                disabled={submitting}
                                className="rounded-xl flex items-center gap-1.5 font-bold"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Simpan Perubahan Status
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* ==========================================
                3. MODAL HAPUS RIWAYAT (DELETE CRUD)
               ========================================== */}
            <Dialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={`Hapus Data Riwayat #RSV-${selectedRes?.id}`}
                size="sm"
            >
                {selectedRes && (
                    <div className="space-y-4 py-1 font-sans text-xs">
                        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
                            <ShieldAlert className="w-6 h-6 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-red-800 dark:text-red-200">Konfirmasi Hapus Riwayat</h4>
                                <p className="leading-relaxed">
                                    Apakah Anda yakin ingin menghapus data riwayat ini secara permanen dari database sistem?
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-slate-700 dark:text-slate-300">
                            <p><span className="text-slate-400">Kode RSV:</span> <strong className="font-mono">#RSV-{selectedRes.id}</strong></p>
                            <p><span className="text-slate-400">Pemohon:</span> {selectedRes.user?.name}</p>
                            <p><span className="text-slate-400">Aset:</span> {selectedRes.asset?.name}</p>
                            <p><span className="text-slate-400">Status Saat Ini:</span> <Badge status={selectedRes.status} /></p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={submitting}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={handleConfirmDelete}
                                disabled={submitting}
                                className="rounded-xl flex items-center gap-1.5 font-bold"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Menghapus...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Hapus Permanen
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

        </div>
    );
};
