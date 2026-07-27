'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { toast } from '@/components/UI';
import { Activity, ShieldAlert } from 'lucide-react';

export default function AuditLogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/audit-logs');
            if (res.ok) setLogs(await res.json());
        } catch (error) {
            console.error('Audit logs fetch error', error);
            toast.error('Gagal memuat audit log.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns = [
        {
            key: 'created_at',
            header: 'Waktu Log',
            render: (l: any) => {
                const cDate = l.created_at || l.createdAt;
                return cDate ? new Date(cDate).toLocaleString('id-ID') : '-';
            }
        },
        { key: 'user.name', header: 'Aktor / Pengguna', render: (l: any) => l.user?.name || 'Sistem Autentikasi' },
        { key: 'action', header: 'Aksi (Action)', render: (l: any) => <span className="font-mono font-bold text-ojk-red">{l.action}</span> },
        { key: 'description', header: 'Deskripsi Aktivitas', render: (l: any) => l.description },
        { key: 'ip_address', header: 'IP Address', render: (l: any) => <span className="font-mono text-slate-400">{l.ip_address || l.ipAddress || '127.0.0.1'}</span> }
    ];

    if (!user || user.role !== 'super_admin') {
        return (
            <div className="p-8 text-center space-y-4 font-sans">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Akses Dibatasi</h3>
                <p className="text-xs text-slate-500">Audit log keamanan hanya dapat diakses oleh Super Admin.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-ojk-red" />
                    Audit Log Aktivitas Sistem & Keamanan
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Catatan histori aktivitas pengguna dan perubahan data di dalam sistem.
                </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat audit log...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={logs}
                        searchKey="description"
                        searchPlaceholder="Cari deskripsi aktivitas..."
                        exportName="audit_logs_ojk"
                    />
                )}
            </div>
        </div>
    );
}
