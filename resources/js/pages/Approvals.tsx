import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Button, Dialog, Input, Select, TextArea, Badge, toast } from '../components/UI';
import { DRIVER_LIST } from '../constants/drivers';
import { 
    CheckSquare, 
    XOctagon, 
    FileText, 
    Calendar, 
    Clock, 
    User,
    ClipboardList,
    AlertCircle,
    Trash2,
    CheckCircle2
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
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [assignedDriver, setAssignedDriver] = useState('');
    const [selectedDriverOption, setSelectedDriverOption] = useState('');
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

    const handleApproveOpen = (req: Reservation) => {
        setSelectedReq(req);
        const existingDriver = req.driver_name || '';
        setAssignedDriver(existingDriver);
        
        // Check if existing driver is in master list
        const found = DRIVER_LIST.find(d => d.name === existingDriver);
        if (found) {
            setSelectedDriverOption(existingDriver);
        } else if (existingDriver) {
            setSelectedDriverOption('custom');
        } else {
            setSelectedDriverOption('');
        }
        setApprovalOpen(true);
    };

    const handleApproveSubmit = async () => {
        if (!selectedReq) return;
        try {
            setSubmitting(true);
            await axios.post(`/reservations/${selectedReq.id}/approve`, {
                driver_name: assignedDriver.trim() || null
            });
            toast.success('Permintaan peminjaman berhasil disetujui.');
            setApprovalOpen(false);
            setAssignedDriver('');
            setSelectedReq(null);
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

    const handleComplete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menyelesaikan peminjaman ini secara manual?')) return;
        
        try {
            setSubmitting(true);
            await axios.post(`/reservations/${id}/complete-usage`);
            toast.success('Peminjaman telah selesai.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyelesaikan peminjaman.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data reservasi ini secara permanen?')) return;
        
        try {
            setSubmitting(true);
            await axios.delete(`/reservations/${id}`);
            toast.success('Reservasi berhasil dihapus.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus reservasi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        const statusLabels: Record<string, string> = {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            in_use: 'Sedang Dipakai',
            completed: 'Selesai',
            cancelled: 'Batal'
        };

        const targetLabel = statusLabels[newStatus] || newStatus;

        if (!window.confirm(`Apakah Anda yakin ingin mengubah status reservasi ini menjadi "${targetLabel}"?`)) {
            fetchRequests();
            return;
        }

        try {
            setSubmitting(true);
            await axios.put(`/reservations/${id}`, { status: newStatus });
            toast.success('Status reservasi berhasil diperbarui.');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui status.');
            fetchRequests();
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
            render: (res: Reservation) => {
                const getSelectStyle = (status: string) => {
                    const s = status.toLowerCase();
                    if (s === 'available' || s === 'tersedia') {
                        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
                    } else if (s === 'reserved' || s === 'disetujui' || s === 'approved') {
                        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
                    } else if (s === 'in_use' || s === 'sedang dipakai' || s === 'in use') {
                        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
                    } else if (s === 'maintenance' || s === 'perawatan') {
                        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30';
                    } else if (s === 'inactive' || s === 'tidak aktif') {
                        return 'bg-slate-100 text-slate-650 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-750';
                    } else if (s === 'pending' || s === 'menunggu') {
                        return 'bg-yellow-50 text-yellow-750 border-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30';
                    } else if (s === 'rejected' || s === 'ditolak') {
                        return 'bg-red-50 text-red-750 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';
                    } else if (s === 'completed' || s === 'selesai') {
                        return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800';
                    } else if (s === 'cancelled' || s === 'dibatalkan') {
                        return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-750';
                    }
                    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                };

                return (
                    <select
                        value={res.status}
                        onChange={(e) => handleStatusChange(res.id, e.target.value)}
                        disabled={submitting}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-ojk-red/25 dark:bg-slate-900 ${getSelectStyle(res.status)}`}
                    >
                        <option value="pending" className="text-slate-850 bg-white dark:bg-slate-950">Menunggu</option>
                        <option value="approved" className="text-slate-850 bg-white dark:bg-slate-950">Disetujui</option>
                        <option value="rejected" className="text-slate-850 bg-white dark:bg-slate-950">Ditolak</option>
                        <option value="in_use" className="text-slate-850 bg-white dark:bg-slate-950">Sedang Dipakai</option>
                        <option value="completed" className="text-slate-850 bg-white dark:bg-slate-950">Selesai</option>
                        <option value="cancelled" className="text-slate-850 bg-white dark:bg-slate-950">Batal</option>
                    </select>
                );
            }
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
                    {res.status === 'pending' && (
                        <React.Fragment>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 border-none shrink-0"
                                onClick={() => handleApproveOpen(res)}
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
                    )}
                    {['approved', 'reserved', 'in_use'].includes(res.status) && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none shrink-0 flex items-center gap-1"
                            onClick={() => handleComplete(res.id)}
                            disabled={submitting}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Selesaikan
                        </Button>
                    )}
                </div>
            )
        },
        {
            key: 'delete_action',
            header: 'Aksi',
            sortable: false,
            render: (res: Reservation) => (
                <div className="flex items-center">
                    <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 hover:text-red-700 transition-colors shrink-0"
                        title="Hapus"
                        disabled={submitting}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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

            {/* Approval & Driver Assignment Modal */}
            <Dialog 
                isOpen={approvalOpen} 
                onClose={() => { setApprovalOpen(false); setSelectedReq(null); setAssignedDriver(''); }} 
                title="Persetujuan & Penugasan Driver"
            >
                <div className="space-y-4">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl leading-relaxed">
                        Anda akan menyetujui peminjaman aset <strong>{selectedReq?.asset?.name}</strong> oleh <strong>{selectedReq?.user?.name}</strong>.
                    </div>

                    <div className="space-y-3">
                        <Select 
                            label="Pilih Driver Kantor yang Ditugaskan"
                            value={selectedDriverOption}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedDriverOption(val);
                                if (val !== 'custom') {
                                    setAssignedDriver(val);
                                } else {
                                    setAssignedDriver('');
                                }
                            }}
                            options={[
                                { value: '', label: '-- Pilih Driver Kantor --' },
                                ...DRIVER_LIST.map(d => ({ value: d.name, label: `${d.name} (${d.nip}) - ${d.phone}` })),
                                { value: 'custom', label: '+ Input Nama Driver Lainnya...' }
                            ]}
                        />

                        {selectedDriverOption === 'custom' && (
                            <Input 
                                label="Nama Driver Kantor (Custom)"
                                placeholder="Tuliskan nama driver..."
                                value={assignedDriver}
                                onChange={(e) => setAssignedDriver(e.target.value)}
                            />
                        )}

                        <p className="text-[10px] text-slate-400 font-semibold">
                            * Nama driver akan otomatis tercantum pada notifikasi persetujuan yang dikirim ke pemohon.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => { setApprovalOpen(false); setSelectedReq(null); setAssignedDriver(''); }} disabled={submitting}>
                            Batal
                        </Button>
                        <Button variant="primary" onClick={handleApproveSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 border-none">
                            {submitting ? 'Memproses...' : 'Setujui Peminjaman'}
                        </Button>
                    </div>
                </div>
            </Dialog>

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

                            {selectedReq.driver_name ? (
                                <div className="flex items-start gap-2.5">
                                    <User className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Driver Ditugaskan</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedReq.driver_name}</span>
                                    </div>
                                </div>
                            ) : selectedReq.driver_required ? (
                                <div className="flex items-start gap-2.5">
                                    <User className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Layanan Driver</span>
                                        <span className="text-slate-850 dark:text-slate-350 font-bold">Driver Ditugaskan Kantor</span>
                                    </div>
                                </div>
                            ) : null}

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
                                        onClick={() => { setDetailOpen(false); handleApproveOpen(selectedReq); }}
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
