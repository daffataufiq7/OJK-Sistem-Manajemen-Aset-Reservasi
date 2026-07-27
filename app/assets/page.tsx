'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Input, Select, Dialog, Badge, toast } from '@/components/UI';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    ShieldAlert, 
    UploadCloud, 
    Image as ImageIcon, 
    Car, 
    Building2, 
    CheckCircle2, 
    RefreshCw,
    MapPin
} from 'lucide-react';

interface AssetCategory {
    id: number;
    name: string;
    slug?: string;
}

interface Asset {
    id: number;
    code: string;
    name: string;
    category_id?: number;
    categoryId?: number;
    location: string;
    status: string;
    condition: string;
    photo: string | null;
    qr_code?: string | null;
    qrCode?: string | null;
    category?: AssetCategory;
}

export default function AssetsPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    // Form inputs
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('available');
    const [condition, setCondition] = useState('good');
    const [photo, setPhoto] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [aRes, cRes] = await Promise.all([
                fetch('/api/assets'),
                fetch('/api/categories')
            ]);
            if (aRes.ok) setAssets(await aRes.json());
            if (cRes.ok) setCategories(await cRes.json());
        } catch (error) {
            console.error('Error fetching assets', error);
            toast.error('Gagal memuat daftar aset.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingAsset(null);
        setCode(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
        setName('');
        setCategoryId(categories[0]?.id || '');
        setLocation('');
        setStatus('available');
        setCondition('good');
        setPhoto('');
        setModalOpen(true);
    };

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset);
        setCode(asset.code);
        setName(asset.name);
        setCategoryId(asset.category_id || asset.categoryId || (categories[0]?.id || ''));
        setLocation(asset.location);
        setStatus(asset.status);
        setCondition(asset.condition);
        setPhoto(asset.photo || '');
        setModalOpen(true);
    };

    // Drag and Drop File Handlers
    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, PNG, WEBP).');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 5 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPhoto(reader.result as string);
            toast.success('Foto kendaraan/aset berhasil dimuat!');
        };
        reader.onerror = () => {
            toast.error('Gagal membaca file gambar.');
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name || !categoryId || !location) {
            toast.warning('Silakan lengkapi semua bidang wajib.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                code,
                name,
                category_id: Number(categoryId),
                location,
                status,
                condition,
                photo: photo || null
            };

            let res;
            if (editingAsset) {
                res = await fetch(`/api/assets/${editingAsset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/assets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                toast.success(`Aset berhasil ${editingAsset ? 'diperbarui' : 'ditambahkan'}.`);
                setModalOpen(false);
                fetchData();
            } else {
                const errData = await res.json();
                toast.error(errData.message || 'Gagal menyimpan aset.');
            }
        } catch (error) {
            toast.error('Gagal menyimpan aset.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Aset berhasil dihapus.');
                fetchData();
            } else {
                toast.error('Gagal menghapus aset.');
            }
        } catch (error) {
            toast.error('Gagal menghapus aset.');
        }
    };

    const columns = [
        { 
            key: 'name', 
            header: 'Nama & Foto Aset', 
            render: (a: Asset) => (
                <div className="flex items-center gap-3.5 min-w-[230px]">
                    {a.photo ? (
                        <img 
                            src={a.photo} 
                            alt={a.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0" 
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            {a.code.startsWith('MOB') || a.code.startsWith('KND') || a.category?.slug === 'kendaraan' ? (
                                <Car className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <Building2 className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                    )}
                    <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[200px]" title={a.name}>
                            {a.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-bold mt-0.5">
                            {a.code}
                        </span>
                    </div>
                </div>
            ) 
        },
        { 
            key: 'category.name', 
            header: 'Kategori', 
            render: (a: Asset) => (
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {a.category?.name || 'Aset'}
                </span>
            ) 
        },
        { 
            key: 'location', 
            header: 'Lokasi Penyimpanan', 
            render: (a: Asset) => (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 min-w-[150px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {a.location}
                </span>
            ) 
        },
        { 
            key: 'status', 
            header: 'Status Ketersediaan', 
            render: (a: Asset) => <Badge status={a.status} /> 
        },
        {
            key: 'actions',
            header: 'Opsi Super Admin',
            sortable: false,
            render: (a: Asset) => (
                <div className="flex items-center gap-2 shrink-0 min-w-[130px]">
                    <button 
                        onClick={() => openEditModal(a)} 
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                        title="Edit Data Aset"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Edit</span>
                    </button>

                    <button 
                        onClick={() => handleDelete(a.id)} 
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102 active:scale-98"
                        title="Hapus Aset"
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
                <p className="text-xs text-slate-500">Halaman manajemen aset hanya dapat diakses oleh Super Admin.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6 font-sans pb-12">
            
            {/* Header Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                            <Car className="w-6 h-6" />
                        </div>
                        Kelola Master Aset Kantor & Kendaraan Dinas
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        Tambah, ubah foto kendaraan dengan Drag & Drop, atau atur ketersediaan inventaris OJK.
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
                        Tambah Aset Baru
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
                        Memuat master aset...
                    </div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={assets}
                        searchKey="name"
                        searchPlaceholder="Cari berdasarkan nama atau kode aset..."
                        exportName="master_aset_ojk"
                    />
                )}
            </div>

            {/* ==========================================
                MODAL TAMBAH / EDIT ASET (DENGAN DRAG & DROP FOTO)
               ========================================== */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAsset ? 'Edit Data Aset & Foto' : 'Tambah Aset Baru'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                    
                    {/* Input Drag and Drop Foto Aset */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Foto Aset / Kendaraan Dinas</span>
                            {photo && (
                                <button
                                    type="button"
                                    onClick={() => setPhoto('')}
                                    className="text-[11px] text-red-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <Trash2 className="w-3 h-3" /> Hapus Foto
                                </button>
                            )}
                        </label>

                        {photo ? (
                            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 flex items-center gap-4">
                                <img 
                                    src={photo} 
                                    alt="Preview Aset" 
                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0" 
                                />
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Foto Aset Berhasil Dimuat</span>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Gambar siap disimpan
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPhoto('')}
                                        className="text-xs text-ojk-red font-bold hover:underline cursor-pointer text-left pt-1"
                                    >
                                        Ganti Foto / Upload Ulang...
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                                    dragActive 
                                        ? 'border-ojk-red bg-red-50/60 dark:bg-red-950/40 ring-4 ring-ojk-red/10 scale-[1.01]' 
                                        : 'border-slate-300 dark:border-slate-700 hover:border-ojk-red hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="p-3 rounded-full bg-red-500/10 text-ojk-red">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Geser & Lepas foto kendaraan di sini
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        atau <span className="text-ojk-red font-semibold underline">klik untuk memilih gambar</span> dari file komputer
                                    </p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    Format: PNG, JPG, WEBP (Maksimal 5MB)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Preset Gambar Model Mobil OJK */}
                    <div className="space-y-1.5 pt-0.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Atau Pilih Foto Preset Sesuai Model Kendaraan Dinas OJK:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { name: 'Toyota Fortuner', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Toyota Alphard VIP', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Toyota Kijang Innova', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Toyota Hilux 4x4', url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Nissan X-Trail', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Toyota Camry Sedan', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Toyota Zenix Hybrid', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Isuzu Traga Box', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80' },
                                { name: 'Honda CB 150 R', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
                            ].map((preset, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setPhoto(preset.url);
                                        toast.success(`Foto preset ${preset.name} dipilih!`);
                                    }}
                                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                        photo === preset.url
                                            ? 'bg-ojk-red text-white border-ojk-red shadow-xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
                                    }`}
                                >
                                    <span>🚗 {preset.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input 
                            label="Kode Aset / Plat Nomor" 
                            placeholder="Contoh: MOB-001 / D 1234 OJK"
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Nama Aset / Kendaraan" 
                            placeholder="Contoh: Toyota Innova Zenix 2.0"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                            label="Kategori Aset"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>

                        <Input 
                            label="Lokasi Penyimpanan / Parkir" 
                            placeholder="Contoh: Garasi B1 / Ruang Rapat Lt 3"
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select label="Status Ketersediaan" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="available">Tersedia (Available)</option>
                            <option value="reserved">Disetujui (Reserved)</option>
                            <option value="in_use">Sedang Dipakai (In Use)</option>
                            <option value="maintenance">Perawatan (Maintenance)</option>
                            <option value="inactive">Tidak Aktif (Inactive)</option>
                        </Select>

                        <Select label="Kondisi Fisik Aset" value={condition} onChange={(e) => setCondition(e.target.value)}>
                            <option value="good">Sangat Baik (Good)</option>
                            <option value="fair">Cukup (Fair)</option>
                            <option value="poor">Perlu Perbaikan (Poor)</option>
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
                            {submitting ? 'Menyimpan...' : (editingAsset ? 'Simpan Perubahan' : 'Simpan Aset')}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
