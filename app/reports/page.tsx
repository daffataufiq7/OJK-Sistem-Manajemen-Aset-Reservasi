'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/UI';
import { FileBarChart2, ShieldAlert } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/reservations');
            if (res.ok) setReservations(await res.json());
        } catch (error) {
            console.error('Fetch reports error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const columns = [
        { key: 'id', header: 'ID', render: (r: any) => <span className="font-bold text-slate-400">#RSV-{r.id}</span> },
        { key: 'user.name', header: 'Pemohon', render: (r: any) => r.user?.name || '-' },
        { key: 'asset.name', header: 'Aset', render: (r: any) => r.asset?.name || '-' },
        { key: 'start_date', header: 'Waktu Pinjam', render: (r: any) => (r.start_date || r.startDate) ? new Date(r.start_date || r.startDate).toLocaleString('id-ID') : '-' },
        { key: 'status', header: 'Status Akhir', render: (r: any) => <Badge status={r.status} /> }
    ];

    if (!user || !['super_admin', 'validator'].includes(user.role)) {
        return (
            <div className="p-8 text-center space-y-4 font-sans">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Akses Dibatasi</h3>
                <p className="text-xs text-slate-500">Laporan peminjaman hanya dapat diakses oleh Admin & Validator.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <FileBarChart2 className="w-6 h-6 text-ojk-red" />
                    Laporan Eksekutif Peminjaman & Penggunaan Aset
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Rekapitulasi data penggunaan kendaraan dinas dan ruang rapat OJK Jawa Barat.
                </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat laporan...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={reservations}
                        searchKey="user.name"
                        searchPlaceholder="Cari berdasarkan nama pemohon..."
                        exportName="laporan_penggunaan_aset_ojk"
                    />
                )}
            </div>
        </div>
    );
}
