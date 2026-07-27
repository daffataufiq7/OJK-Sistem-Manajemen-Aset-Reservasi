'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { Badge, toast } from '@/components/UI';
import { History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/reservations');
            if (res.ok) setReservations(await res.json());
        } catch (error) {
            console.error('History fetch error', error);
            toast.error('Gagal memuat riwayat.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const columns = [
        { key: 'id', header: 'ID', render: (res: any) => <span className="font-bold text-slate-400">#RSV-{res.id}</span> },
        { key: 'user.name', header: 'Pemohon', render: (res: any) => res.user?.name || '-' },
        { key: 'asset.name', header: 'Aset', render: (res: any) => res.asset?.name || '-' },
        {
            key: 'start_date',
            header: 'Mulai',
            render: (res: any) => {
                const sDate = res.start_date || res.startDate;
                return sDate ? new Date(sDate).toLocaleString('id-ID') : '-';
            }
        },
        {
            key: 'end_date',
            header: 'Selesai',
            render: (res: any) => {
                const eDate = res.end_date || res.endDate;
                return eDate ? new Date(eDate).toLocaleString('id-ID') : '-';
            }
        },
        { key: 'purpose', header: 'Keperluan', render: (res: any) => <span className="truncate max-w-[200px] block">{res.purpose}</span> },
        { key: 'status', header: 'Status', render: (res: any) => <Badge status={res.status} /> }
    ];

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <HistoryIcon className="w-6 h-6 text-ojk-red" />
                    Riwayat Keseluruhan Peminjaman Aset
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Daftar seluruh aktivitas reservasi fasilitas kantor OJK Jawa Barat.
                </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat riwayat...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={reservations}
                        searchKey="asset.name"
                        searchPlaceholder="Cari berdasarkan nama pemohon atau aset..."
                        exportName="riwayat_keseluruhan_reservasi"
                    />
                )}
            </div>
        </div>
    );
}
