'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Dialog, TextArea, Badge, toast } from '@/components/UI';
import { Check, X, ShieldAlert } from 'lucide-react';

interface Reservation {
    id: number;
    user_id: number;
    asset_id: number;
    start_date: string;
    startDate?: string;
    end_date: string;
    endDate?: string;
    purpose: string;
    destination: string | null;
    status: string;
    rejection_reason: string | null;
    user?: { name: string; email: string; nip: string };
    asset?: { name: string; code: string; location: string };
    created_at: string;
}

export default function ApprovalsPage() {
    const { user } = useAuth();
    const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedResId, setSelectedResId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPendingReservations = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/reservations?status=pending');
            if (res.ok) {
                setPendingReservations(await res.json());
            }
        } catch (error) {
            console.error('Error loading pending approvals', error);
            toast.error('Gagal memuat persetujuan peminjaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReservations();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            const res = await fetch(`/api/reservations/${id}/approve`, { method: 'POST' });
            if (res.ok) {
                toast.success('Peminjaman aset berhasil disetujui!');
                fetchPendingReservations();
            } else {
                toast.error('Gagal menyetujui peminjaman.');
            }
        } catch (error: any) {
            toast.error('Gagal menyetujui peminjaman.');
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResId || !rejectionReason.trim()) {
            toast.warning('Silakan tuliskan alasan penolakan.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`/api/reservations/${selectedResId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason }),
            });
            if (res.ok) {
                toast.success('Pengajuan peminjaman berhasil ditolak.');
                setRejectModalOpen(false);
                setRejectionReason('');
                fetchPendingReservations();
            } else {
                toast.error('Gagal menolak pengajuan.');
            }
        } catch (error: any) {
            toast.error('Gagal menolak peminjaman.');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'id',
            header: 'ID',
            render: (res: Reservation) => <span className="font-bold text-slate-400">#RSV-{res.id}</span>
        },
        {
            key: 'user.name',
            header: 'Pemohon',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.user?.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{res.user?.nip}</span>
                </div>
            )
        },
        {
            key: 'asset.name',
            header: 'Aset',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.asset?.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{res.asset?.location}</span>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Jadwal Mulai',
            render: (res: Reservation) => {
                const sDate = res.start_date || res.startDate;
                return sDate ? new Date(sDate).toLocaleString('id-ID') : '-';
            }
        },
        {
            key: 'end_date',
            header: 'Jadwal Selesai',
            render: (res: Reservation) => {
                const eDate = res.end_date || res.endDate;
                return eDate ? new Date(eDate).toLocaleString('id-ID') : '-';
            }
        },
        {
            key: 'purpose',
            header: 'Keperluan',
            render: (res: Reservation) => <span className="truncate max-w-[180px] block" title={res.purpose}>{res.purpose}</span>
        },
        {
            key: 'actions',
            header: 'Aksi Validator',
            sortable: false,
            render: (res: Reservation) => (
                <div className="flex gap-2">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-3 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        onClick={() => handleApprove(res.id)}
                    >
                        <Check className="w-3 h-3" />
                        Setujui
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        className="py-1 px-3 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        onClick={() => { setSelectedResId(res.id); setRejectModalOpen(true); }}
                    >
                        <X className="w-3 h-3" />
                        Tolak
                    </Button>
                </div>
            )
        }
    ];

    if (!user || !['super_admin', 'validator'].includes(user.role)) {
        return (
            <div className="p-8 text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Akses Dibatasi</h3>
                <p className="text-xs text-slate-500">Anda tidak memiliki hak akses validator untuk halaman ini.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Persetujuan Reservasi (Approval Panel)
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Review dan berikan persetujuan permohonan reservasi fasilitas kantor.
                </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat persetujuan...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={pendingReservations}
                        searchKey="user.name"
                        searchPlaceholder="Cari berdasarkan pemohon..."
                        exportName="persetujuan_pending"
                    />
                )}
            </div>

            <Dialog
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Tolak Pengajuan Peminjaman"
                size="sm"
            >
                <form onSubmit={handleRejectSubmit} className="space-y-4">
                    <TextArea 
                        label="Alasan Penolakan (Wajib)"
                        placeholder="Misal: Mobil dinas sedang dijadwalkan untuk tugas luar kota direksi..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="danger" type="submit" disabled={submitting}>
                            {submitting ? 'Memproses...' : 'Tolak Pengajuan'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
