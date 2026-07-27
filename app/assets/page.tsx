'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/DataTable';
import { Button, Input, Select, Dialog, Badge, toast } from '@/components/UI';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

interface AssetCategory {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    code: string;
    name: string;
    category_id: number;
    location: string;
    status: string;
    condition: string;
    photo: string | null;
    qr_code: string | null;
    category?: AssetCategory;
}

export default function AssetsPage() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('available');
    const [condition, setCondition] = useState('good');
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
        setModalOpen(true);
    };

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset);
        setCode(asset.code);
        setName(asset.name);
        setCategoryId(asset.category_id || (asset as any).categoryId || '');
        setLocation(asset.location);
        setStatus(asset.status);
        setCondition(asset.condition);
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name || !categoryId || !location) {
            toast.warning('Silakan lengkapi semua bidang.');
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
                condition
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
                toast.error('Gagal menyimpan aset.');
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
        { key: 'code', header: 'Kode Aset', render: (a: Asset) => <span className="font-bold text-slate-400 font-mono">{a.code}</span> },
        { key: 'name', header: 'Nama Aset', render: (a: Asset) => <span className="font-extrabold text-slate-800 dark:text-white">{a.name}</span> },
        { key: 'category.name', header: 'Kategori', render: (a: Asset) => a.category?.name || 'Aset' },
        { key: 'location', header: 'Lokasi', render: (a: Asset) => a.location },
        { key: 'status', header: 'Status', render: (a: Asset) => <Badge status={a.status} /> },
        {
            key: 'actions',
            header: 'Aksi',
            sortable: false,
            render: (a: Asset) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(a)} className="p-1.5 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
        <div className="p-8 space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Kelola Master Aset Kantor
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Tambah, ubah, atau atur status ketersediaan inventaris aset OJK.
                    </p>
                </div>

                <Button onClick={openCreateModal} className="bg-ojk-red text-white flex items-center gap-2 rounded-xl text-xs py-2.5 px-4 font-bold">
                    <Plus className="w-4 h-4" />
                    Tambah Aset Baru
                </Button>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat master aset...</div>
                ) : (
                    <DataTable 
                        columns={columns}
                        data={assets}
                        searchKey="name"
                        searchPlaceholder="Cari nama aset..."
                        exportName="master_aset_ojk"
                    />
                )}
            </div>

            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAsset ? 'Edit Data Aset' : 'Tambah Aset Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Kode Aset" value={code} onChange={(e) => setCode(e.target.value)} required />
                    <Input label="Nama Aset" value={name} onChange={(e) => setName(e.target.value)} required />
                    
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

                    <Input label="Lokasi Penyimpanan / Parkir" value={location} onChange={(e) => setLocation(e.target.value)} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Status Aset" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="available">Tersedia (Available)</option>
                            <option value="reserved">Disetujui (Reserved)</option>
                            <option value="in_use">Sedang Dipakai (In Use)</option>
                            <option value="maintenance">Perawatan (Maintenance)</option>
                            <option value="inactive">Tidak Aktif (Inactive)</option>
                        </Select>

                        <Select label="Kondisi Aset" value={condition} onChange={(e) => setCondition(e.target.value)}>
                            <option value="good">Sangat Baik (Good)</option>
                            <option value="fair">Cukup (Fair)</option>
                            <option value="poor">Perlu Perbaikan (Poor)</option>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="bg-ojk-red text-white">
                            {submitting ? 'Simpan...' : 'Simpan Aset'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
