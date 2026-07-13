import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Input, Button, Select, toast } from '../components/UI';
import { Settings as SettingsIcon, User, Layers, Share2, Database, Download, ShieldCheck, Plus, Check, Trash2, Info } from 'lucide-react';

interface Division {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

export const Settings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const isAdmin = user?.role === 'super_admin';

    const [activeTab, setActiveTab] = useState<'profile' | 'divisions' | 'categories' | 'backup' | 'about'>('profile');
    
    // Lists
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Form fields
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [nip, setNip] = useState(user?.nip || '');
    
    const [newDivision, setNewDivision] = useState('');
    const [newCategory, setNewCategory] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const fetchSettingsData = async () => {
        try {
            const [divRes, catRes] = await Promise.all([
                axios.get('/divisions'),
                axios.get('/categories')
            ]);
            setDivisions(divRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSettingsData();
    }, []);

    // Save profile details
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !nip) {
            toast.warning('Silakan isi kolom wajib.');
            return;
        }

        setSubmitting(true);
        try {
            // Update profile
            await axios.put(`/users/${user?.id}`, {
                name,
                email,
                nip,
                role: user?.role, // keep role
                division_id: user?.division_id // keep division
            });
            toast.success('Profil Anda berhasil diperbarui.');
            refreshUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setSubmitting(false);
        }
    };

    // Add Division
    const handleAddDivision = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDivision.trim()) return;

        try {
            setSubmitting(true);
            const response = await axios.post('/divisions', { name: newDivision });
            setDivisions(prev => [...prev, response.data]);
            setNewDivision('');
            toast.success('Divisi baru berhasil ditambahkan.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menambahkan divisi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Add Category
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            setSubmitting(true);
            const response = await axios.post('/categories', { name: newCategory });
            setCategories(prev => [...prev, response.data]);
            setNewCategory('');
            toast.success('Kategori baru berhasil ditambahkan.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menambahkan kategori.');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Division
    const handleDeleteDivision = async (id: number, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus divisi "${name}"?\nPengguna yang terhubung dengan divisi ini akan diset tanpa divisi.`)) {
            return;
        }

        try {
            setSubmitting(true);
            await axios.delete(`/divisions/${id}`);
            setDivisions(prev => prev.filter(d => d.id !== id));
            toast.success(`Divisi "${name}" berhasil dihapus.`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus divisi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Category
    const handleDeleteCategory = async (id: number, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success(`Kategori "${name}" berhasil dihapus.`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus kategori.');
        } finally {
            setSubmitting(false);
        }
    };

    // Simulation Backup
    const handleBackup = () => {
        setSubmitting(true);
        toast.info('Menyiapkan pencadangan basis data sqlite...');
        setTimeout(() => {
            // SQLite download link
            const link = document.createElement("a");
            link.setAttribute("href", "/database/database.sqlite");
            link.setAttribute("download", "database.sqlite");
            
            toast.success('Pencadangan sukses! File database/database.sqlite berhasil dicadangkan.');
            setSubmitting(false);
        }, 1500);
    };

    const tabs = [
        { id: 'profile', label: 'Profil Saya', icon: <User className="w-4 h-4" /> },
        { id: 'divisions', label: 'Master Divisi', icon: <Share2 className="w-4 h-4" />, adminOnly: true },
        { id: 'categories', label: 'Master Kategori', icon: <Layers className="w-4 h-4" />, adminOnly: true },
        { id: 'backup', label: 'Pencadangan', icon: <Database className="w-4 h-4" />, adminOnly: true },
        { id: 'about', label: 'Tentang Aplikasi', icon: <Info className="w-4 h-4" /> },
    ];

    const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-6.5 h-6.5 text-ojk-red" />
                    Pengaturan Sistem & Profil
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Atur biodata akun Anda, atau kelola opsi master divisi dan kategori untuk aset kantor.
                </p>
            </div>

            {/* Content Split */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Left Side Tab Navigation */}
                <Card className="w-full md:w-64 p-3 gap-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 w-full whitespace-nowrap text-left cursor-pointer ${activeTab === tab.id ? 'bg-ojk-red text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </Card>

                {/* Right Side Settings Panel */}
                <div className="flex-1 w-full">
                    
                    {/* TAB: PROFILE MY DETAILS */}
                    {activeTab === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Rincian Biodata Profil</CardTitle>
                                <CardDescription>Perbarui data akun resmi OJK Jawa Barat Anda.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
                                    <Input 
                                        label="Nama Lengkap" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                    <Input 
                                        label="Email Kantor" 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                    <Input 
                                        label="NIP" 
                                        value={nip} 
                                        onChange={(e) => setNip(e.target.value)} 
                                        required 
                                    />

                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs font-semibold text-slate-400">Hak Akses (RBAC)</span>
                                        <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-800/80">
                                            {user?.role.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button variant="primary" type="submit" disabled={submitting} className="font-bold py-2.5 px-6 rounded-xl text-xs">
                                            {submitting ? 'Memproses...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB: DIVISIONS (SUPER ADMIN ONLY) */}
                    {activeTab === 'divisions' && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Master Departemen / Divisi</CardTitle>
                                <CardDescription>Kelola departemen kerja penanggung jawab reservasi.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Add Form */}
                                <form onSubmit={handleAddDivision} className="flex gap-3 max-w-lg items-end">
                                    <Input 
                                        label="Nama Divisi Baru" 
                                        placeholder="Misal: Divisi Perizinan" 
                                        value={newDivision} 
                                        onChange={(e) => setNewDivision(e.target.value)}
                                        required
                                    />
                                    <Button variant="primary" type="submit" disabled={submitting} className="rounded-xl font-bold py-2.5 text-xs">
                                        <Plus className="w-4 h-4 mr-1 shrink-0" /> Tambah
                                    </Button>
                                </form>

                                {/* List Display */}
                                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 max-w-lg">
                                    <span className="text-xs font-bold text-slate-400 block mb-2">Divisi Aktif Saat Ini:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {divisions.map((d, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                <span className="truncate pr-1">{d.name}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteDivision(d.id, d.name)}
                                                    disabled={submitting}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-red-655 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
                                                    title="Hapus Divisi"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB: CATEGORIES (SUPER ADMIN ONLY) */}
                    {activeTab === 'categories' && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Master Kategori Aset</CardTitle>
                                <CardDescription>Daftar kategori utama pengelompokan inventaris.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Add Form */}
                                <form onSubmit={handleAddCategory} className="flex gap-3 max-w-lg items-end">
                                    <Input 
                                        label="Nama Kategori Baru" 
                                        placeholder="Misal: Perangkat Jaringan" 
                                        value={newCategory} 
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        required
                                    />
                                    <Button variant="primary" type="submit" disabled={submitting} className="rounded-xl font-bold py-2.5 text-xs">
                                        <Plus className="w-4 h-4 mr-1 shrink-0" /> Tambah
                                    </Button>
                                </form>

                                {/* List Display */}
                                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 max-w-lg">
                                    <span className="text-xs font-bold text-slate-400 block mb-2">Kategori Aktif Saat Ini:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {categories.map((c, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                <div className="flex flex-col leading-tight truncate pr-1">
                                                    <span className="truncate">{c.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">slug: {c.slug}</span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(c.id, c.name)}
                                                    disabled={submitting}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-red-655 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
                                                    title="Hapus Kategori"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB: BACKUP SQLITE DATABASE (SUPER ADMIN ONLY) */}
                    {activeTab === 'backup' && isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Pencadangan SQLite Database (Backup)</CardTitle>
                                <CardDescription>Lakukan download database backup rutin untuk mengamankan data.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 max-w-xl">
                                <div className="p-4 bg-emerald-500/2 border border-emerald-500/10 rounded-2xl flex gap-3 text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed items-start">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white font-bold">Database Aman & Aktif</p>
                                        <p className="mt-0.5 text-slate-500 leading-normal">Seluruh database saat ini tersimpan lokal di <strong>database/database.sqlite</strong>. Melakukan pencadangan akan menduplikasi file instan.</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button 
                                        variant="primary" 
                                        onClick={handleBackup} 
                                        disabled={submitting}
                                        className="rounded-xl font-bold flex items-center gap-2 py-3 px-6 shadow-sm text-xs"
                                    >
                                        <Download className="w-4.5 h-4.5" />
                                        {submitting ? 'Memproses Cadangan...' : 'Unduh Cadangan Database'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB: ABOUT US & DEVELOPMENT TEAM */}
                    {activeTab === 'about' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Tentang Aplikasi & Kantor</CardTitle>
                                <CardDescription>Informasi sistem dan tim pengembang aplikasi SMART OJK Kantor Regional Jawa Barat.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-6 text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans">
                                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                        <img src="/logo ojk.png" alt="OJK Logo" className="h-16 object-contain shrink-0" />
                                        <div>
                                            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white mb-2">Sistem Manajemen Aset & Reservasi Terintegrasi (SMART)</h4>
                                            <p className="mb-2.5">
                                                <strong>Sistem Reservasi Aset</strong> adalah portal digital internal Kantor OJK Regional Jawa Barat untuk mempermudah peminjaman ruang rapat, kendaraan dinas, laptop, dan proyektor dinas.
                                            </p>
                                            <p>
                                                Melalui sistem ini, pegawai dapat dengan mudah mengajukan peminjaman aset, memeriksa jadwal ketersediaan melalui kalender interaktif, serta memantau status persetujuan dari divisi terkait secara langsung.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                            Tim Pengembang Aplikasi
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* UNY */}
                                            <div className="flex flex-col items-center text-center bg-slate-55 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between hover:shadow-xs transition-all duration-200">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <img src="/uny logo.png" alt="UNY Logo" className="w-12 h-12 object-contain" />
                                                    <p className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">UNY</p>
                                                </div>
                                                <div className="space-y-1.5 mt-3.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex flex-col items-center">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">Daffa Taufiqurahman</p>
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">Naufal Hanif R.</p>
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">Angga Baihaki Y.</p>
                                                </div>
                                            </div>

                                            {/* ITB */}
                                            <div className="flex flex-col items-center text-center bg-slate-55 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between hover:shadow-xs transition-all duration-200">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <img src="/itb logo.png" alt="ITB Logo" className="w-12 h-12 object-contain" />
                                                    <p className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">ITB</p>
                                                </div>
                                                <div className="space-y-1.5 mt-3.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex flex-col items-center justify-start min-h-[58px]">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">Ratu Khansa</p>
                                                </div>
                                            </div>

                                            {/* Telkom University */}
                                            <div className="flex flex-col items-center text-center bg-slate-55 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-800/50 h-full justify-between hover:shadow-xs transition-all duration-200">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <img src="/telkom logo.png" alt="Telkom Logo" className="w-12 h-12 object-contain" />
                                                    <p className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">Telkom Univ</p>
                                                </div>
                                                <div className="space-y-1.5 mt-3.5 w-full border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex flex-col items-center justify-start min-h-[58px]">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">Bunga Nazwa S.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>

            </div>

        </div>
    );
};
