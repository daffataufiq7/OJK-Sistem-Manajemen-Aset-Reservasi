'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Input, Select, Dialog, Badge, toast } from '@/components/UI';
import { 
    Plus, Edit2, Trash2, ShieldAlert, UploadCloud, Car, Building2,
    CheckCircle2, RefreshCw, MapPin, Handshake, LayoutGrid
} from 'lucide-react';

interface AssetCategory { id: number; name: string; slug?: string; }
interface Asset {
    id: number; code: string; name: string;
    category_id?: number; categoryId?: number;
    location: string; status: string; condition: string;
    photo: string | null; qr_code?: string | null; qrCode?: string | null;
    category?: AssetCategory;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
    { 
        key: 'kendaraan', label: 'Kendaraan Dinas', icon: Car, color: 'amber',
        slugs: ['kendaraan', 'kendaraan-dinas'],
        codePrefix: 'AST-KND',
        locationPlaceholder: 'Contoh: Basement Lt. 1 / Parkiran Motor',
        namePlaceholder: 'Contoh: Toyota Innova Zenix 2.0 G CVT',
        presets: [
            { name: 'Toyota Fortuner', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
            { name: 'Toyota Alphard VIP', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
            { name: 'Toyota Kijang Innova', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80' },
            { name: 'Toyota Hilux 4x4', url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80' },
            { name: 'Nissan X-Trail', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
            { name: 'Toyota Camry Sedan', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
            { name: 'Toyota Zenix Hybrid', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80' },
            { name: 'Isuzu Traga Box', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80' },
            { name: 'Honda CB 150 R', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
        ],
        presetEmoji: '🚗',
        presetLabel: 'Pilih Foto Preset Sesuai Model Kendaraan Dinas OJK:',
    },
    {
        key: 'ruangan', label: 'Ruang Rapat & Aula', icon: Building2, color: 'blue',
        slugs: ['ruangan', 'ruang-rapat'],
        codePrefix: 'AST-RNG',
        locationPlaceholder: 'Contoh: Gedung Utama Lt. 2 / Lt. 3',
        namePlaceholder: 'Contoh: Ruang Rapat Bale Astama',
        presets: [
            { name: 'Ruang Rapat Modern', url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop' },
            { name: 'Aula Besar', url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=800&auto=format&fit=crop' },
            { name: 'Ruang Kantor Klasik', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop' },
            { name: 'Ruang Meeting Kecil', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop' },
            { name: 'Conference Room', url: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?q=80&w=800&auto=format&fit=crop' },
        ],
        presetEmoji: '🏢',
        presetLabel: 'Pilih Foto Preset Sesuai Jenis Ruangan:',
    },
    {
        key: 'partnership', label: 'Partnership', icon: Handshake, color: 'emerald',
        slugs: ['partnership', 'kerjasama'],
        codePrefix: 'AST-PTN',
        locationPlaceholder: 'Contoh: Gedung Mitra / Lantai 1',
        namePlaceholder: 'Contoh: Fasilitas Olahraga Bersama Bank BRI',
        presets: [
            { name: 'Fasilitas Olahraga', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' },
            { name: 'Gedung Mitra', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop' },
            { name: 'Ruang Bersama', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=800&auto=format&fit=crop' },
            { name: 'Kantin / Cafetaria', url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?q=80&w=800&auto=format&fit=crop' },
        ],
        presetEmoji: '🤝',
        presetLabel: 'Pilih Foto Preset Sesuai Jenis Fasilitas Partnership:',
    },
] as const;

type TabKey = 'kendaraan' | 'ruangan' | 'partnership';

const TAB_COLORS: Record<string, { tab: string; active: string; badge: string; btn: string; icon: string }> = {
    kendaraan: {
        tab:    'hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
        active: 'border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30',
        badge:  'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        btn:    'bg-amber-500 hover:bg-amber-600 text-white',
        icon:   'bg-amber-500/10 text-amber-600',
    },
    ruangan: {
        tab:    'hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
        active: 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30',
        badge:  'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        btn:    'bg-blue-600 hover:bg-blue-700 text-white',
        icon:   'bg-blue-500/10 text-blue-600',
    },
    partnership: {
        tab:    'hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
        active: 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
        badge:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        btn:    'bg-emerald-600 hover:bg-emerald-700 text-white',
        icon:   'bg-emerald-500/10 text-emerald-600',
    },
};

export default function AssetsPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('kendaraan');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    // Form inputs
    const [code, setCode]         = useState('');
    const [name, setName]         = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [location, setLocation] = useState('');
    const [status, setStatus]     = useState('available');
    const [condition, setCondition] = useState('good');
    const [photo, setPhoto]       = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const currentTabConfig = TABS.find(t => t.key === activeTab)!;
    const colors = TAB_COLORS[activeTab];

    // ─── Filter assets by active tab ─────────────────────────────────────────
    const filteredAssets = assets.filter(a => {
        const slug = a.category?.slug?.toLowerCase() || '';
        const catName = a.category?.name?.toLowerCase() || '';
        if (activeTab === 'kendaraan') return slug.includes('kendaraan') || catName.includes('kendaraan');
        if (activeTab === 'ruangan')   return slug.includes('ruang') || catName.includes('ruang') || slug.includes('aula') || catName.includes('aula');
        if (activeTab === 'partnership') return slug.includes('partner') || catName.includes('partner') || slug.includes('kerjasama') || catName.includes('kerjasama');
        return false;
    });

    // Category filtered by tab
    const filteredCategories = categories.filter(c => {
        const slug = c.slug?.toLowerCase() || '';
        const n    = c.name?.toLowerCase() || '';
        if (activeTab === 'kendaraan')   return slug.includes('kendaraan') || n.includes('kendaraan');
        if (activeTab === 'ruangan')     return slug.includes('ruang') || n.includes('ruang') || n.includes('aula');
        if (activeTab === 'partnership') return slug.includes('partner') || n.includes('partner') || n.includes('kerjasama');
        return true;
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [aRes, cRes] = await Promise.all([fetch('/api/assets'), fetch('/api/categories')]);
            if (aRes.ok) setAssets(await aRes.json());
            if (cRes.ok) setCategories(await cRes.json());
        } catch { toast.error('Gagal memuat daftar aset.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreateModal = () => {
        setEditingAsset(null);
        const n = filteredAssets.length + 1;
        setCode(`${currentTabConfig.codePrefix}-${String(n).padStart(3,'0')}`);
        setName('');
        setCategoryId(filteredCategories[0]?.id || categories[0]?.id || '');
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

    // ─── File Drag & Drop ────────────────────────────────────────────────────
    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar (JPG, PNG, WEBP).'); return; }
        if (file.size > 5 * 1024 * 1024)    { toast.error('Ukuran gambar maksimal 5 MB.'); return; }
        const reader = new FileReader();
        reader.onload  = () => { setPhoto(reader.result as string); toast.success('Foto berhasil dimuat!'); };
        reader.onerror = () => toast.error('Gagal membaca file gambar.');
        reader.readAsDataURL(file);
    };
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name || !categoryId || !location) { toast.warning('Silakan lengkapi semua bidang wajib.'); return; }
        try {
            setSubmitting(true);
            const payload = { code, name, category_id: Number(categoryId), location, status, condition, photo: photo || null };
            const res = editingAsset
                ? await fetch(`/api/assets/${editingAsset.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                : await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
                toast.success(`Aset berhasil ${editingAsset ? 'diperbarui' : 'ditambahkan'}.`);
                setModalOpen(false);
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal menyimpan aset.');
            }
        } catch { toast.error('Gagal menyimpan aset.'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Aset berhasil dihapus.'); fetchData(); }
            else toast.error('Gagal menghapus aset.');
        } catch { toast.error('Gagal menghapus aset.'); }
    };

    // ─── Table Columns ───────────────────────────────────────────────────────
    const columns = [
        {
            key: 'name', header: 'Nama & Foto Aset',
            render: (a: Asset) => (
                <div className="flex items-center gap-3.5 min-w-[230px]">
                    {a.photo ? (
                        <img src={a.photo} alt={a.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0" />
                    ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${colors.badge}`}>
                            {activeTab === 'kendaraan'   ? <Car className="w-6 h-6" /> :
                             activeTab === 'ruangan'     ? <Building2 className="w-6 h-6" /> :
                                                           <Handshake className="w-6 h-6" />}
                        </div>
                    )}
                    <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="font-extrabold text-slate-850 dark:text-white text-xs truncate max-w-[200px]" title={a.name}>{a.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono font-bold mt-0.5">{a.code}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'location', header: 'Lokasi',
            render: (a: Asset) => (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 min-w-[150px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{a.location}
                </span>
            )
        },
        { key: 'status', header: 'Status', render: (a: Asset) => <Badge status={a.status} /> },
        {
            key: 'actions', header: 'Aksi', sortable: false,
            render: (a: Asset) => (
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEditModal(a)} className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs">
                        <Edit2 className="w-3.5 h-3.5" /><span>Edit</span>
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs">
                        <Trash2 className="w-3.5 h-3.5" /><span>Hapus</span>
                    </button>
                </div>
            )
        },
    ];

    // ─── Guard ───────────────────────────────────────────────────────────────
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

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${colors.icon}`}>
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        Kelola Master Aset OJK
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        Pilih kategori aset di bawah untuk mengelola inventaris secara terpisah.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl flex items-center gap-1.5 text-xs font-semibold">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                    <button
                        onClick={openCreateModal}
                        className={`flex items-center gap-2 rounded-xl text-xs py-2.5 px-4 font-bold shadow-xs transition-all ${colors.btn}`}
                    >
                        <Plus className="w-4 h-4" />
                        Tambah {currentTabConfig.label}
                    </button>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-full sm:w-auto sm:inline-flex border border-slate-200 dark:border-slate-700">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    const tabColors = TAB_COLORS[tab.key];
                    const count = assets.filter(a => {
                        const slug = a.category?.slug?.toLowerCase() || '';
                        const n    = a.category?.name?.toLowerCase() || '';
                        if (tab.key === 'kendaraan')   return slug.includes('kendaraan') || n.includes('kendaraan');
                        if (tab.key === 'ruangan')     return slug.includes('ruang') || n.includes('ruang') || n.includes('aula');
                        if (tab.key === 'partnership') return slug.includes('partner') || n.includes('partner') || n.includes('kerjasama');
                        return false;
                    }).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabKey)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start ${
                                isActive
                                    ? `${tabColors.active} shadow-sm`
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? tabColors.badge : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Description Card ── */}
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                activeTab === 'kendaraan'   ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' :
                activeTab === 'ruangan'     ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50' :
                                              'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
            }`}>
                <div className={`p-2.5 rounded-xl ${colors.icon}`}>
                    {activeTab === 'kendaraan'   ? <Car className="w-5 h-5" /> :
                     activeTab === 'ruangan'     ? <Building2 className="w-5 h-5" /> :
                                                   <Handshake className="w-5 h-5" />}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{currentTabConfig.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activeTab === 'kendaraan'   && 'Kelola seluruh armada kendaraan dinas OJK — mobil operasional, kendaraan pimpinan, motor, dan truk logistik.'}
                        {activeTab === 'ruangan'     && 'Kelola ruang rapat, aula, dan fasilitas pertemuan di seluruh gedung OJK Jawa Barat.'}
                        {activeTab === 'partnership' && 'Kelola aset dan fasilitas hasil kerja sama OJK dengan instansi atau mitra eksternal.'}
                    </p>
                </div>
                <div className="ml-auto text-right shrink-0">
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{filteredAssets.length}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Aset</p>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-ojk-red" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Memuat data {currentTabConfig.label}...
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center mx-auto`}>
                            {activeTab === 'kendaraan' ? <Car className="w-7 h-7" /> : activeTab === 'ruangan' ? <Building2 className="w-7 h-7" /> : <Handshake className="w-7 h-7" />}
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada {currentTabConfig.label}</p>
                        <p className="text-xs text-slate-400">Klik tombol "Tambah {currentTabConfig.label}" untuk menambahkan aset pertama.</p>
                        <button onClick={openCreateModal} className={`mt-2 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-xs font-bold ${colors.btn}`}>
                            <Plus className="w-3.5 h-3.5" />Tambah {currentTabConfig.label}
                        </button>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredAssets}
                        searchKey="name"
                        searchPlaceholder={`Cari ${currentTabConfig.label.toLowerCase()}...`}
                        exportName={`master_aset_${activeTab}_ojk`}
                    />
                )}
            </div>

            {/* ── Modal Tambah / Edit ── */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAsset ? `Edit ${currentTabConfig.label}` : `Tambah ${currentTabConfig.label} Baru`}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">

                    {/* Foto Upload */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Foto {currentTabConfig.label}</span>
                            {photo && (
                                <button type="button" onClick={() => setPhoto('')} className="text-[11px] text-red-500 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                                    <Trash2 className="w-3 h-3" /> Hapus Foto
                                </button>
                            )}
                        </label>

                        {photo ? (
                            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 flex items-center gap-4">
                                <img src={photo} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0" />
                                <div className="flex flex-col space-y-1">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Foto Berhasil Dimuat</span>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Gambar siap disimpan
                                    </span>
                                    <button type="button" onClick={() => setPhoto('')} className="text-xs text-ojk-red font-bold hover:underline cursor-pointer text-left pt-1">
                                        Ganti Foto / Upload Ulang...
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                                    dragActive
                                        ? 'border-ojk-red bg-red-50/60 dark:bg-red-950/40 ring-4 ring-ojk-red/10 scale-[1.01]'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-ojk-red hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="p-3 rounded-full bg-red-500/10 text-ojk-red"><UploadCloud className="w-6 h-6" /></div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Geser & Lepas foto di sini</p>
                                    <p className="text-[11px] text-slate-400 font-medium">atau <span className="text-ojk-red font-semibold underline">klik untuk memilih gambar</span></p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">PNG, JPG, WEBP (Maks 5MB)</span>
                            </div>
                        )}
                    </div>

                    {/* Preset Foto */}
                    <div className="space-y-1.5 pt-0.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{currentTabConfig.presetLabel}</label>
                        <div className="flex flex-wrap gap-1.5">
                            {currentTabConfig.presets.map((preset, idx) => (
                                <button
                                    key={idx} type="button"
                                    onClick={() => { setPhoto(preset.url); toast.success(`Foto preset ${preset.name} dipilih!`); }}
                                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                        photo === preset.url
                                            ? `${colors.btn} border-transparent shadow-xs`
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
                                    }`}
                                >
                                    {currentTabConfig.presetEmoji} {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input label="Kode Aset" placeholder={`Contoh: ${currentTabConfig.codePrefix}-001`} value={code} onChange={e => setCode(e.target.value)} required />
                        <Input label={`Nama ${currentTabConfig.label}`} placeholder={currentTabConfig.namePlaceholder} value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select label="Kategori" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="">-- Pilih Kategori --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <Input label="Lokasi" placeholder={currentTabConfig.locationPlaceholder} value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select label="Status Ketersediaan" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="available">Tersedia (Available)</option>
                            <option value="reserved">Disetujui (Reserved)</option>
                            <option value="in_use">Sedang Dipakai (In Use)</option>
                            <option value="maintenance">Perawatan (Maintenance)</option>
                            <option value="inactive">Tidak Aktif (Inactive)</option>
                        </Select>
                        <Select label="Kondisi Fisik" value={condition} onChange={e => setCondition(e.target.value)}>
                            <option value="good">Sangat Baik (Good)</option>
                            <option value="fair">Cukup (Fair)</option>
                            <option value="poor">Perlu Perbaikan (Poor)</option>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" type="button" onClick={() => setModalOpen(false)} className="rounded-xl">Batal</Button>
                        <button type="submit" disabled={submitting} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${colors.btn} disabled:opacity-60`}>
                            {submitting ? 'Menyimpan...' : (editingAsset ? 'Simpan Perubahan' : `Simpan ${currentTabConfig.label}`)}
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
