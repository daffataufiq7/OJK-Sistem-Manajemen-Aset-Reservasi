import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Button, Input, Select, Dialog, toast } from '../components/UI';
import { Plus, Edit, Trash2, ShieldAlert, User, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Division {
    id: number;
    name: string;
}

interface UserAccount {
    id: number;
    name: string;
    nip: string;
    email: string;
    role: 'super_admin' | 'validator' | 'pegawai';
    division_id: number | null;
    division?: Division;
}

export const Users: React.FC = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // Guard page
    useEffect(() => {
        if (currentUser && currentUser.role !== 'super_admin') {
            toast.error('Akses ditolak. Halaman ini khusus untuk Super Admin.');
            navigate('/dashboard');
        }
    }, [currentUser]);

    const [users, setUsers] = useState<UserAccount[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);

    // Form modal state
    const [formOpen, setFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [nip, setNip] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'super_admin' | 'validator' | 'pegawai'>('pegawai');
    const [divisionId, setDivisionId] = useState<number>(0);

    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, divRes] = await Promise.all([
                axios.get('/users'),
                axios.get('/divisions')
            ]);
            setUsers(usersRes.data);
            setDivisions(divRes.data);
            if (divRes.data.length > 0) {
                setDivisionId(divRes.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching users', error);
            toast.error('Gagal mengambil data user.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateOpen = () => {
        setSelectedUser(null);
        setName('');
        setNip('');
        setEmail('');
        setPassword('');
        setRole('pegawai');
        if (divisions.length > 0) setDivisionId(divisions[0].id);
        setFormOpen(true);
    };

    const handleEditOpen = (u: UserAccount) => {
        setSelectedUser(u);
        setName(u.name);
        setNip(u.nip);
        setEmail(u.email);
        setPassword(''); // leave blank on edit
        setRole(u.role);
        setDivisionId(u.division_id || (divisions.length > 0 ? divisions[0].id : 0));
        setFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !nip || !email || (!selectedUser && !password)) {
            toast.warning('Silakan lengkapi kolom wajib.');
            return;
        }

        setSubmitting(true);
        const payload: any = {
            name,
            nip,
            email,
            role,
            division_id: divisionId
        };

        if (password) {
            payload.password = password;
        }

        try {
            if (selectedUser) {
                await axios.put(`/users/${selectedUser.id}`, payload);
                toast.success('Akun user berhasil diperbarui.');
            } else {
                await axios.post('/users', payload);
                toast.success('User baru berhasil ditambahkan.');
            }
            setFormOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data user.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (u: UserAccount) => {
        if (u.id === currentUser?.id) {
            toast.error('Anda tidak bisa menghapus akun Anda sendiri.');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus akun ${u.name}?`)) return;

        try {
            await axios.delete(`/users/${u.id}`);
            toast.success('Akun berhasil dihapus.');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus user.');
        }
    };

    // Columns
    const columns = [
        {
            key: 'nip',
            header: 'NIP / ID',
            render: (u: UserAccount) => (
                <span className="font-extrabold text-slate-700 dark:text-slate-200 font-mono text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {u.nip}
                </span>
            )
        },
        {
            key: 'name',
            header: 'Nama & Email Kedinasan',
            render: (u: UserAccount) => (
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
            header: 'Divisi Kantor',
            render: (u: UserAccount) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[160px] block">
                    {u.division?.name || 'Kantor Regional 2 Jabar'}
                </span>
            )
        },
        {
            key: 'role',
            header: 'Role Akses (RBAC)',
            render: (u: UserAccount) => {
                const labels = {
                    super_admin: 'Super Admin',
                    validator: 'Validator / Admin',
                    pegawai: 'Pegawai'
                };
                const badges = {
                    super_admin: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/50 dark:text-red-300',
                    validator: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300',
                    pegawai: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                };
                return (
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-wider ${badges[u.role]}`}>
                        {labels[u.role]}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Opsi Super Admin',
            sortable: false,
            render: (u: UserAccount) => (
                <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
                    <button 
                        onClick={() => handleEditOpen(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                        title="Edit User"
                    >
                        <Edit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Edit</span>
                    </button>
                    <button 
                        onClick={() => handleDelete(u)}
                        disabled={u.id === currentUser?.id}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={u.id === currentUser?.id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus User'}
                    >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span>Hapus</span>
                    </button>
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
                <span className="text-xs text-slate-500 font-semibold">Memuat manajemen user...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Shield className="w-6.5 h-6.5 text-ojk-red" />
                        Manajemen User & Keanggotaan
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Kelola akun pegawai, sesuaikan NIP/Email OJK, divisi regional, dan batasan hak akses (RBAC).
                    </p>
                </div>
                <Button 
                    onClick={handleCreateOpen} 
                    className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs py-2"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Akun Baru
                </Button>
            </div>

            {/* Table wrapper */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={users}
                    searchKey="name"
                    searchPlaceholder="Cari berdasarkan nama atau NIP pegawai..."
                    exportName="daftar_user_ojk_jabar"
                />
            </div>

            {/* Form Modal */}
            <Dialog 
                isOpen={formOpen} 
                onClose={() => setFormOpen(false)} 
                title={selectedUser ? "Edit Akun User" : "Tambah Akun User Baru"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <Input 
                        label="Nama Lengkap Pegawai (Wajib)" 
                        placeholder="Misal: Mochammad Fadel" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input 
                        label="NIP Pegawai (Wajib - Unik)" 
                        placeholder="Misal: 30005" 
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        required
                    />

                    <Input 
                        label="Email Resmi OJK (Wajib - Unik)" 
                        type="email"
                        placeholder="fadel@ojk.go.id" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input 
                        label={selectedUser ? "Sandi Baru (Kosongkan jika tak diubah)" : "Kata Sandi Akun (Wajib)"} 
                        type="password"
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!selectedUser}
                    />

                    <Select 
                        label="Role Hak Akses (RBAC)" 
                        options={[
                            { value: 'pegawai', label: 'Pegawai (Standard User)' },
                            { value: 'validator', label: 'Admin / Validator (Approve Flow)' },
                            { value: 'super_admin', label: 'Super Admin (Full Access)' }
                        ]}
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        required
                    />

                    <Select 
                        label="Divisi / Departemen Kerja" 
                        options={divisions.map(d => ({ value: d.id, label: d.name }))}
                        value={divisionId}
                        onChange={(e) => setDivisionId(Number(e.target.value))}
                        required
                    />

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                        <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? 'Menyimpan...' : 'Simpan User'}
                        </Button>
                    </div>
                </form>
            </Dialog>

        </div>
    );
};
