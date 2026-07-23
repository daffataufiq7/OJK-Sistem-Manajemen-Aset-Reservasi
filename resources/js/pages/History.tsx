import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Badge, Button, toast } from '../components/UI';
import { History as HistoryIcon, MapPin, User, Calendar } from 'lucide-react';

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
    rejection_reason: string | null;
    user?: UserProfile;
    asset?: Asset;
    created_at: string;
}

export const History: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/reservations');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Columns
    const columns = [
        {
            key: 'id',
            header: 'Kode RSV',
            render: (res: Reservation) => <span className="font-bold text-slate-450 uppercase">#RSV-{res.id}</span>
        },
        {
            key: 'asset.name',
            header: 'Aset Peminjaman',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.asset?.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{res.asset?.code}</span>
                </div>
            )
        },
        {
            key: 'user.name',
            header: 'Pegawai Peminjam',
            render: (res: Reservation) => (
                <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.user?.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400">NIP: {res.user?.nip} &bull; {res.user?.division?.name || '-'}</span>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Tanggal Mulai',
            render: (res: Reservation) => (
                <span className="font-semibold text-slate-600 dark:text-slate-350">
                    {new Date(res.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {new Date(res.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
            )
        },
        {
            key: 'end_date',
            header: 'Tanggal Selesai',
            render: (res: Reservation) => (
                <span className="font-semibold text-slate-655 dark:text-slate-350">
                    {new Date(res.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {new Date(res.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
            )
        },
        {
            key: 'purpose',
            header: 'Agenda / Keperluan',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="truncate max-w-[160px] font-semibold text-xs text-slate-700 dark:text-slate-300 block" title={res.purpose}>
                        {res.purpose}
                    </span>
                    {res.driver_name && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Driver: {res.driver_name}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1">
                    <Badge status={res.status} />
                    {res.status === 'rejected' && res.rejection_reason && (
                        <span className="text-[9px] text-red-500 font-semibold max-w-[140px] leading-tight block">
                            Alasan: {res.rejection_reason}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Aksi',
            sortable: false,
            render: (res: Reservation) => {
                const canCancel = ['pending', 'approved', 'reserved'].includes(res.status);
                if (canCancel) {
                    return (
                        <Button
                            variant="danger"
                            size="sm"
                            className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-red-600 hover:bg-red-700 border-none shrink-0"
                            onClick={() => handleCancel(res.id)}
                            disabled={submitting}
                        >
                            Batalkan
                        </Button>
                    );
                }
                return <span className="text-[10px] text-slate-400 font-semibold">-</span>;
            }
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'pending', label: 'Menunggu (Pending)' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'rejected', label: 'Ditolak' },
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
                <span className="text-xs text-slate-500 font-semibold">Memuat riwayat peminjaman...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <HistoryIcon className="w-6.5 h-6.5 text-ojk-red" />
                    Riwayat Peminjaman Aset
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    {user?.role === 'pegawai' 
                        ? 'Daftar seluruh transaksi peminjaman aset kantor yang pernah Anda ajukan.' 
                        : 'Laporan log lengkap peminjaman aset seluruh pegawai regional Jawa Barat.'
                    }
                </p>
            </div>

            {/* Table wrapper */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={history}
                    searchKey="asset.name"
                    searchPlaceholder="Cari data berdasarkan nama aset kantor..."
                    filterOptions={filterOptions}
                    exportName="log_riwayat_peminjaman_ojk"
                />
            </div>

        </div>
    );
};
