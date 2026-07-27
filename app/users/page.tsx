'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Input, Select, Dialog, toast } from '@/components/UI';
import { Plus, Users as UsersIcon, ShieldAlert, Edit2, Trash2, User, Shield, RefreshCw } from 'lucide-react';

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

    // Form Modal state (Create / Edit)
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Delete Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    // Form inputs
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
            toast.error('Gagal memuat daftar pengguna.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open Modal for Creating new user
    const openCreateModal = () => {
        setSelectedUser(null);
        setName('');
        setNip('');
        setEmail('');
        setPassword('password');
        setRole('pegawai');
        setDivisionId(divisions[0]?.id || '');
        setModalOpen(true);
    };

    // Open Modal for Editing existing user
    const openEditModal = (u: UserData) => {
        setSelectedUser(u);
        setName(u.name);
        setNip(u.nip);
        setEmail(u.email);
        setPassword(''); // Blank unless updating password
        setRole(u.role);
        setDivisionId(u.division_id || u.divisionId || (divisions[0]?.id || ''));
        setModalOpen(true);
    };

    // Handle Submit Create / Update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !nip || !email) {
            toast.warning('Silakan lengkapi data pengguna.');
            return;
        }

        try {
            setSubmitting(true);
            const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
            const method = selectedUser ? 'PUT' : 'POST';

            const payload: any = {
                name,
                nip,
                email,
                role,
                division_id: divisionId ? Number(divisionId) : null
            };

            if (password) {
                payload.password = password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`Pengguna berhasil ${selectedUser ? 'diperbarui' : 'ditambahkan'}.`);
                setModalOpen(false);
                setSelectedUser(null);
                fetchData();
            } else {
                const errData = await res.json();
                toast.error(errData.message || 'Gagal menyimpan pengguna.');
            }
        } catch (error) {
            toast.error('Gagal menyimpan data pengguna.');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Delete Confirmation Modal
    const openDeleteModal = (u: UserData) => {
        if (u.id === user?.id) {
            toast.error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!');
            return;
        }
        setUserToDelete(u);
        setDeleteModalOpen(true);
    };

    // Confirm Delete User
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        if (userToDelete.id === user?.id) {
            toast.error('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`/api/users/${userToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success(`Akun user ${userToDelete.name} (${userToDelete.nip}) berhasil dihapus.`);
                setDeleteModalOpen(false);
                setUserToDelete(null);
                fetchData();
            } else {
                const errData = await res.json();
                toast.error(errData.message || 'Gagal menghapus pengguna.');
            }
        } catch (error) {
            toast.error('Gagal menghapus pengguna.');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { 
            key: 'nip', 
            header: 'NIP / ID', 
            render: (u: UserData) => (
                <span className="font-extrabold text-slate-700 dark:text-slate-200 font-mono text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {u.nip}
                </span>
            ) 
        },
        { 
            key: 'name', 
            header: 'Nama & Email Kedinasan', 
            render: (u: UserData) => (
                <div className="flex items-center gap-3 min-w-[210px]">
                    <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-slate-800 border border-red-100 dark:border-slate-700 flex items-center justify-center text-ojk-red dark:text-slate-200 font-extrabold text-xs shadow-2xs shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col leading-tight overflow-hidden space-y-0.5">
                        <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[200px]" title={u.name}>
                            {u.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                            {u.email}
                        </span>
                    </div>
                </div>
            ) 
        },
        { 
            key: 'division.name', 
            header: 'Divisi / Satker', 
            render: (u: UserData) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[160px] block">
                    {u.division?.name || 'Kantor Regional 2 Jabar'}
                </span>
            ) 
        },
        { 
            key: 'role', 
            header: 'Role Akses', 
            render: (u: UserData) => {
                const colors: Record<string, string> = {
                    super_admin: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-300',
                    validator: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300',
                    pegawai: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                };
                const labels: Record<string, string> = {
                    super_admin: 'Super Admin',
                    validator: 'Validator Facility',
                    pegawai: 'Pegawai OJK'
                };
                return (
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-wider ${colors[u.role] || colors.pegawai}`}>
                        {labels[u.role] || u.role}
                    </span>
                );
            } 
        },
        {
            key: 'actions',
            header: 'Opsi Super Admin',
            sortable: false,
            render: (u: UserData) => (
                <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
                    <button
                        onClick={() => openEditModal(u)}
                        title="Ubah Data User"
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Edit</span>
                    </button>

                    <button
                        onClick={() => openDeleteModal(u)}
                        title={u.id === user?.id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus User'}
                        disabled={u.id === user?.id}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span>Hapus</span>
                    </button>
                </div>
            )
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
        <div className="p-6 md:p-8 space-y-6 font-sans pb-12">
            
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        Manajemen Pengguna & Pengelola (User Management)
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        Kelola akun pegawai, validator persetujuan, dan super admin OJK Jawa Barat.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchData}
                        className="rounded-xl flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button 
                        onClick={openCreateModal} 
                        className="bg-ojk-red text-white hover:bg-red-700 flex items-center gap-2 rounded-xl text-xs py-2.5 px-4 font-bold shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Pengguna Baru
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-ojk-red" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Memuat data pengguna...
                    </div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={usersList}
                        searchKey="name"
                        searchPlaceholder="Cari berdasarkan nama, NIP, atau email..."
                        exportName="user_management_ojk"
                    />
                )}
            </div>

            {/* ==========================================
                1. MODAL TAMBAH / EDIT USER
               ========================================== */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedUser ? `Ubah Data User: ${selectedUser.name}` : "Tambah Pengguna Baru"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                    <Input 
                        label="Nama Lengkap Pegawai" 
                        placeholder="Contoh: Ahmad Rizki, S.T."
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input 
                            label="NIP / Nomor Identitas" 
                            placeholder="Contoh: 19920815202001"
                            value={nip} 
                            onChange={(e) => setNip(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Email Kedinasan" 
                            type="email" 
                            placeholder="contoh@ojk.go.id"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <Input 
                        label={selectedUser ? "Kata Sandi Baru (Kosongkan jika tidak diubah)" : "Kata Sandi Awal"} 
                        type="password" 
                        placeholder={selectedUser ? "••••••••" : "Masukkan kata sandi"}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required={!selectedUser} 
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select label="Role Akses Sistem" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="pegawai">Pegawai OJK</option>
                            <option value="validator">Validator / Admin Facility</option>
                            <option value="super_admin">Super Admin</option>
                        </Select>

                        <Select label="Divisi / Satuan Kerja" value={divisionId} onChange={(e) => setDivisionId(e.target.value)}>
                            <option value="">-- Tanpa Divisi Khusus --</option>
                            {divisions.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button 
                            variant="secondary" 
                            type="button" 
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={submitting} 
                            className="bg-ojk-red text-white hover:bg-red-700 rounded-xl font-bold"
                        >
                            {submitting ? 'Menyimpan...' : (selectedUser ? 'Simpan Perubahan' : 'Tambah Pengguna')}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* ==========================================
                2. MODAL KONFIRMASI HAPUS USER
               ========================================== */}
            <Dialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={`Konfirmasi Hapus User: ${userToDelete?.name}`}
                size="sm"
            >
                {userToDelete && (
                    <div className="space-y-4 py-1 font-sans text-xs">
                        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
                            <ShieldAlert className="w-6 h-6 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-red-800 dark:text-red-200">Hapus Akun Pengguna</h4>
                                <p className="leading-relaxed">
                                    Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen dari sistem?
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                            <p><span className="text-slate-400">Nama Lengkap:</span> <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong></p>
                            <p><span className="text-slate-400">NIP / ID:</span> <span className="font-mono">{userToDelete.nip}</span></p>
                            <p><span className="text-slate-400">Email:</span> {userToDelete.email}</p>
                            <p><span className="text-slate-400">Role:</span> <span className="font-bold uppercase text-ojk-red">{userToDelete.role}</span></p>
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
}
