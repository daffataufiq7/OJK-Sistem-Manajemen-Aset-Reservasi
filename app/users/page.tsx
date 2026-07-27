'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Input, Select, Dialog, toast } from '@/components/UI';
import { Plus, Users as UsersIcon, ShieldAlert } from 'lucide-react';

interface Division {
    id: number;
    name: string;
}

interface UserData {
    id: number;
    name: string;
    nip: string;
    email: string;
    role: string;
    division_id?: number | null;
    divisionId?: number | null;
    division?: Division;
}

export default function UsersPage() {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [nip, setNip] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('pegawai');
    const [divisionId, setDivisionId] = useState<string | number>('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [uRes, dRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/divisions')
            ]);
            if (uRes.ok) setUsersList(await uRes.json());
            if (dRes.ok) setDivisions(await dRes.json());
        } catch (error) {
            console.error('Fetch users error', error);
            toast.error('Gagal memuat pengguna.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = () => {
        setName('');
        setNip('');
        setEmail('');
        setPassword('password');
        setRole('pegawai');
        setDivisionId(divisions[0]?.id || '');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !nip || !email) {
            toast.warning('Silakan lengkapi data pengguna.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    nip,
                    email,
                    password,
                    role,
                    division_id: divisionId ? Number(divisionId) : null
                })
            });

            if (res.ok) {
                toast.success('Pengguna baru berhasil ditambahkan.');
                setModalOpen(false);
                fetchData();
            } else {
                toast.error('Gagal menambahkan pengguna.');
            }
        } catch (error) {
            toast.error('Gagal menambahkan pengguna.');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { key: 'nip', header: 'NIP / ID', render: (u: UserData) => <span className="font-bold text-slate-400 font-mono">{u.nip}</span> },
        { key: 'name', header: 'Nama Lengkap', render: (u: UserData) => <span className="font-extrabold text-slate-800 dark:text-white">{u.name}</span> },
        { key: 'email', header: 'Email Kedinasan', render: (u: UserData) => u.email },
        { key: 'division.name', header: 'Divisi', render: (u: UserData) => u.division?.name || 'Kantor Regional 2 Jabar' },
        { 
            key: 'role', 
            header: 'Role', 
            render: (u: UserData) => {
                const colors: Record<string, string> = {
                    super_admin: 'bg-red-50 text-red-600 border-red-100',
                    validator: 'bg-blue-50 text-blue-600 border-blue-100',
                    pegawai: 'bg-slate-100 text-slate-700 border-slate-200'
                };
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${colors[u.role] || colors.pegawai}`}>
                        {u.role}
                    </span>
                );
            } 
        }
    ];

    if (!user || user.role !== 'super_admin') {
        return (
            <div className="p-8 text-center space-y-4 font-sans">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Akses Dibatasi</h3>
                <p className="text-xs text-slate-500">Manajemen pengguna hanya dapat diakses oleh Super Admin.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-ojk-red" />
                        Manajemen Pengguna & Pengelola (User Management)
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Kelola data pegawai, validator, dan super admin OJK Jawa Barat.
                    </p>
                </div>

                <Button onClick={openModal} className="bg-ojk-red text-white flex items-center gap-2 rounded-xl text-xs py-2.5 px-4 font-bold">
                    <Plus className="w-4 h-4" />
                    Tambah Pengguna Baru
                </Button>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat pengguna...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={usersList}
                        searchKey="name"
                        searchPlaceholder="Cari berdasarkan nama atau NIP..."
                        exportName="user_management_ojk"
                    />
                )}
            </div>

            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Tambah Pengguna Baru"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="NIP / ID Pengguna" value={nip} onChange={(e) => setNip(e.target.value)} required />
                    <Input label="Email Kedinasan" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Kata Sandi Awal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <Select label="Role Pengguna" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="pegawai">Pegawai</option>
                        <option value="validator">Validator / Admin Facility</option>
                        <option value="super_admin">Super Admin</option>
                    </Select>

                    <Select label="Divisi" value={divisionId} onChange={(e) => setDivisionId(e.target.value)}>
                        <option value="">-- Tanpa Divisi Khusus --</option>
                        {divisions.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </Select>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="bg-ojk-red text-white">
                            {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
