import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Card, toast } from '../components/UI';
import { Activity, ShieldAlert, Monitor, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: {
        name: string;
        nip: string;
        role: string;
        division?: {
            name: string;
        }
    }
}

export const AuditLogs: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Guard page
    useEffect(() => {
        if (user && user.role !== 'super_admin') {
            toast.error('Akses ditolak. Halaman ini khusus untuk Super Admin.');
            navigate('/dashboard');
        }
    }, [user]);

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/audit-logs');
            // Check if backend paginates or returns array
            const data = response.data.data ? response.data.data : response.data;
            setLogs(data);
        } catch (error) {
            console.error('Error fetching audit logs', error);
            toast.error('Gagal mengambil data audit log.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Format action badges
    const getActionBadge = (action: string) => {
        const a = action.toLowerCase();
        let colors = 'bg-slate-100 text-slate-700 border-slate-200';
        let text = action;

        if (a.includes('login')) {
            colors = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
            text = 'LOGIN';
        } else if (a.includes('create')) {
            colors = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400';
            text = 'CREATE';
        } else if (a.includes('update')) {
            colors = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
            text = 'UPDATE';
        } else if (a.includes('delete')) {
            colors = 'bg-red-50 text-red-750 border-red-100 dark:bg-red-950/20 dark:text-red-400';
            text = 'DELETE';
        } else if (a.includes('approve')) {
            colors = 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400';
            text = 'APPROVE';
        } else if (a.includes('reject')) {
            colors = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400';
            text = 'REJECT';
        }

        return (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${colors}`}>
                {text}
            </span>
        );
    };

    // Columns
    const columns = [
        {
            key: 'created_at',
            header: 'Waktu Kejadian',
            render: (log: AuditLog) => (
                <span className="text-slate-500 font-semibold">
                    {new Date(log.created_at).toLocaleString('id-ID')} WIB
                </span>
            )
        },
        {
            key: 'action',
            header: 'Jenis Aksi',
            render: (log: AuditLog) => getActionBadge(log.action)
        },
        {
            key: 'user.name',
            header: 'Pelaku Aksi',
            render: (log: AuditLog) => (
                <div className="flex flex-col leading-tight">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.user?.name || 'Sistem'}</span>
                    {log.user && (
                        <span className="text-[9px] font-semibold text-slate-400">NIP: {log.user.nip} &bull; {log.user.role.toUpperCase()}</span>
                    )}
                </div>
            )
        },
        {
            key: 'description',
            header: 'Deskripsi Detil Aktivitas',
            render: (log: AuditLog) => <span className="font-semibold text-slate-700 dark:text-slate-350">{log.description}</span>
        },
        {
            key: 'ip_address',
            header: 'Alamat IP / Browser',
            render: (log: AuditLog) => (
                <div className="flex flex-col text-[10px] font-semibold text-slate-400 leading-tight">
                    <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        {log.ip_address || '-'}
                    </span>
                    <span className="truncate max-w-[150px] flex items-center gap-1 mt-0.5" title={log.user_agent || ''}>
                        <Monitor className="w-3 h-3 text-slate-400 shrink-0" />
                        {log.user_agent ? log.user_agent.split(' ')[0] : '-'}
                    </span>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat log audit sistem...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-6.5 h-6.5 text-ojk-red animate-pulse" />
                    Log Audit Keamanan & Aktivitas (Audit Log)
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Pantau secara ketat log login, penambahan aset, persetujuan validator, dan modifikasi data krusial lainnya.
                </p>
            </div>

            {/* Logs Table Card */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={logs}
                    searchKey="description"
                    searchPlaceholder="Cari log audit berdasarkan kata kunci deskripsi..."
                    exportName="log_audit_keamanan_ojk"
                />
            </div>

        </div>
    );
};
