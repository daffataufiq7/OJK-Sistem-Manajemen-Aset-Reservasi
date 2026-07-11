import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Button, Dialog, TextArea, Badge, toast } from '../components/UI';
import { 
    CheckSquare, 
    XOctagon, 
    FileText, 
    Calendar, 
    Clock, 
    User,
    ClipboardList,
    AlertCircle
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
    email: string;
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

export const Approvals: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Prevent non-validators/admins from viewing this page
    useEffect(() => {
        if (user && !['super_admin', 'validator'].includes(user.role)) {
            toast.error('Akses ditolak. Halaman ini hanya untuk Validator.');
            navigate('/dashboard');
        }
    }, [user]);

    const [requests, setRequests] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [selectedReq, setSelectedReq] = useState<Reservation | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/reservations');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching reservations for approvals', error);
            toast.error('Gagal memuat antrean persetujuan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menyetujui peminjaman aset ini?')) return;
        
        try {
            setSubmitting(true);
            await axios.post(`/reservations/${id}/approve`);
            toast.success('Permintaan peminjaman disetujui.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyetujui.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectOpen = (req: Reservation) => {
        setSelectedReq(req);
        setRejectionReason('');
        setRejectionOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedReq) return;
        if (!rejectionReason.trim() || rejectionReason.length < 5) {
            toast.warning('Silakan berikan alasan penolakan yang sah (minimal 5 karakter).');
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(`/reservations/${selectedReq.id}/reject`, {
                rejection_reason: rejectionReason
            });
            toast.success('Permintaan peminjaman ditolak.');
            setRejectionOpen(false);
            setRejectionReason('');
            setSelectedReq(null);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menolak.');
        } finally {
            setSubmitting(false);
        }
    };

    // Columns
    const columns = [
        {
            key: 'id',
            header: 'ID RSV',
            render: (res: Reservation) => <span className="font-bold text-slate-450">#RSV-{res.id}</span>
        },
        {
            key: 'user.name',
            header: 'Pegawai & Divisi',
            render: (res: Reservation) => (
                <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.user?.name}</span>
                    <span className="text-[9px] font-semibold text-slate-400">{res.user?.division?.name || '-'}</span>
                </div>
            )
        },
        {
            key: 'asset.name',
            header: 'Aset Kantor',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.asset?.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{res.asset?.code}</span>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Jadwal Peminjaman',
            render: (res: Reservation) => (
                <div className="flex flex-col text-[11px] leading-snug">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                        {new Date(res.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {new Date(res.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (res: Reservation) => <Badge status={res.status} />
        },
        {
            key: 'actions',
            header: 'Keputusan',
            sortable: false,
            render: (res: Reservation) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setSelectedReq(res); setDetailOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Detail"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    {res.status === 'pending' ? (
                        <React.Fragment>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 border-none shrink-0"
                                onClick={() => handleApprove(res.id)}
                                disabled={submitting}
                            >
                                Setujui
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold border-red-200 text-red-650 hover:bg-red-50 shrink-0"
                                onClick={() => handleRejectOpen(res)}
                                disabled={submitting}
                            >
                                Tolak
                            </Button>
                        </React.Fragment>
                    ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Diproses</span>
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
                <span className="text-xs text-slate-500 font-semibold">Memuat data antrean persetujuan...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Title Header */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Antrean Persetujuan Peminjaman Aset (Approvals)
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Lakukan verifikasi berkas keperluan pegawai, cek konflik jadwal, dan tentukan persetujuan peminjaman aset.
                </p>
            </div>

            {/* Main Table */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={requests}
                    searchKey="user.name"
                    searchPlaceholder="Cari berdasarkan nama pegawai peminjam..."
                    filterOptions={filterOptions}
                    exportName="laporan_persetujuan_validator"
                />
            </div>

            {/* Rejection Reason Modal */}
            <Dialog 
                isOpen={rejectionOpen} 
                onClose={() => { setRejectionOpen(false); setSelectedReq(null); }} 
                title="Tolak Pengajuan Peminjaman"
            >
                <div className="space-y-4">
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span>
                            Anda akan menolak pengajuan untuk aset <strong>{selectedReq?.asset?.name}</strong> oleh <strong>{selectedReq?.user?.name}</strong>.
                        </span>
                    </div>

                    <TextArea 
                        label="Alasan Penolakan (Wajib - Minimal 5 karakter)"
                        placeholder="Tuliskan mengapa pengajuan ini tidak disetujui (misal: ruang sedang direnovasi, mobil dinas service)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => { setRejectionOpen(false); setSelectedReq(null); }} disabled={submitting}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={handleRejectSubmit} disabled={submitting}>
                            {submitting ? 'Memproses...' : 'Tolak Pengajuan'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Detail Modal */}
            <Dialog
                isOpen={detailOpen}
                onClose={() => { setDetailOpen(false); setSelectedReq(null); }}
                title="Rincian Pengajuan Reservasi"
                size="md"
            >
                {selectedReq && (
                    <div className="space-y-5">
                        {/* Status Header */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs font-bold text-slate-800 dark:text-white">
                                    {selectedReq.asset?.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                    {selectedReq.asset?.code}
                                </span>
                            </div>
                            <Badge status={selectedReq.status} />
                        </div>

                        {/* Rincian Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
                            
                            <div className="flex items-start gap-2.5">
                                <User className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Pegawai Peminjam</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedReq.user?.name}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold">NIP: {selectedReq.user?.nip} &bull; {selectedReq.user?.division?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Jadwal Penggunaan</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-bold">
                                        {new Date(selectedReq.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-[9px] text-slate-450 font-bold">
                                        {new Date(selectedReq.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedReq.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                            </div>

                            {selectedReq.destination && (
                                <div className="flex items-start gap-2.5">
                                    <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Tujuan Perjalanan</span>
                                        <span className="text-slate-850 dark:text-slate-300 font-bold">{selectedReq.destination}</span>
                                    </div>
                                </div>
                            )}

                            {selectedReq.driver_required && (
                                <div className="flex items-start gap-2.5">
                                    <User className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Layanan Driver</span>
                                        <span className="text-slate-850 dark:text-slate-350 font-bold">Butuh Driver Kantor</span>
                                        {selectedReq.driver_name && (
                                            <span className="text-[9px] text-emerald-600 font-bold">Diajukan: {selectedReq.driver_name}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2.5 sm:col-span-2">
                                <ClipboardList className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Keperluan Agenda</span>
                                    <p className="text-slate-850 dark:text-slate-300 font-semibold leading-relaxed">
                                        {selectedReq.purpose}
                                    </p>
                                </div>
                            </div>

                            {selectedReq.notes && (
                                <div className="flex items-start gap-2.5 sm:col-span-2">
                                    <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Catatan Tambahan</span>
                                        <p className="text-slate-655 dark:text-slate-400 font-semibold">{selectedReq.notes}</p>
                                    </div>
                                </div>
                            )}

                            {selectedReq.status === 'rejected' && selectedReq.rejection_reason && (
                                <div className="flex items-start gap-2.5 sm:col-span-2 p-3 bg-red-50 text-red-750 border border-red-100 rounded-xl">
                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-red-550 font-bold uppercase tracking-wider">Alasan Penolakan</span>
                                        <p className="font-bold text-xs">{selectedReq.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Decisions inside detail modal */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                            <Button variant="secondary" onClick={() => { setDetailOpen(false); setSelectedReq(null); }}>
                                Tutup
                            </Button>
                            {selectedReq.status === 'pending' && (
                                <React.Fragment>
                                    <Button 
                                        variant="danger"
                                        onClick={() => { setDetailOpen(false); handleRejectOpen(selectedReq); }}
                                    >
                                        Tolak
                                    </Button>
                                    <Button 
                                        variant="primary"
                                        onClick={() => { setDetailOpen(false); handleApprove(selectedReq.id); }}
                                    >
                                        Setujui
                                    </Button>
                                </React.Fragment>
                            )}
                        </div>

                    </div>
                )}
            </Dialog>

        </div>
    );
};
