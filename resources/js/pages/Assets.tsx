import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Button, Input, Select, Dialog, Badge, toast } from '../components/UI';
import { QRCodeSVG } from 'qrcode.react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    QrCode, 
    Eye, 
    Printer, 
    MapPin, 
    Briefcase,
    Calendar,
    Settings,
    FileText
} from 'lucide-react';

interface AssetCategory {
    id: number;
    name: string;
    slug: string;
}

interface Asset {
    id: number;
    code: string;
    name: string;
    category_id: number;
    location: string;
    status: 'available' | 'reserved' | 'in_use' | 'maintenance' | 'inactive';
    condition: 'good' | 'fair' | 'poor';
    photo: string | null;
    qr_code: string | null;
    maintenance_schedule: string | null;
    category?: AssetCategory;
}

export const Assets: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'super_admin';

    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Form fields
    const [assetId, setAssetId] = useState<number | null>(null);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number>(0);
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<'available' | 'reserved' | 'in_use' | 'maintenance' | 'inactive'>('available');
    const [condition, setCondition] = useState<'good' | 'fair' | 'poor'>('good');
    const [photo, setPhoto] = useState('');
    const [maintenanceSchedule, setMaintenanceSchedule] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, PNG, WEBP).');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 2 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPhoto(reader.result as string);
            toast.success('Gambar berhasil dimuat.');
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
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    };

    // Fetch Assets and Categories
    const fetchData = async () => {
        try {
            setLoading(true);
            const [assetRes, catRes] = await Promise.all([
                axios.get('/assets'),
                axios.get('/categories')
            ]);
            setAssets(assetRes.data);
            setCategories(catRes.data);
            if (catRes.data.length > 0) {
                setCategoryId(catRes.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching assets', error);
            toast.error('Gagal mengambil data aset.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open Form for Create
    const handleCreateOpen = () => {
        setAssetId(null);
        setCode(`AST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
        setName('');
        if (categories.length > 0) setCategoryId(categories[0].id);
        setLocation('');
        setStatus('available');
        setCondition('good');
        setPhoto('');
        setMaintenanceSchedule('');
        setFormOpen(true);
    };

    // Open Form for Edit
    const handleEditOpen = (asset: Asset) => {
        setAssetId(asset.id);
        setCode(asset.code);
        setName(asset.name);
        setCategoryId(asset.category_id);
        setLocation(asset.location);
        setStatus(asset.status);
        setCondition(asset.condition);
        setPhoto(asset.photo || '');
        setMaintenanceSchedule(asset.maintenance_schedule || '');
        setFormOpen(true);
    };

    // Handle Form Submit (Store or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name || !location) {
            toast.warning('Silakan lengkapi semua kolom wajib.');
            return;
        }

        setSubmitting(true);
        const payload = {
            code,
            name,
            category_id: categoryId,
            location,
            status,
            condition,
            photo: photo || null,
            maintenance_schedule: maintenanceSchedule || null
        };

        try {
            if (assetId) {
                await axios.put(`/assets/${assetId}`, payload);
                toast.success('Aset berhasil diperbarui.');
            } else {
                await axios.post('/assets', payload);
                toast.success('Aset baru berhasil ditambahkan.');
            }
            setFormOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data aset.');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus aset ini? Data tidak akan terhapus permanen (Soft Delete).')) return;
        try {
            await axios.delete(`/assets/${id}`);
            toast.success('Aset berhasil dihapus.');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus aset.');
        }
    };

    // Print QR Code logic
    const handlePrintQr = () => {
        const printContent = document.getElementById('qr-printable-area');
        if (!printContent) return;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const printWindow = window.open(windowUrl, `Print_${uniqueName}`, 'left=50,top=50,width=600,height=600');
        
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Cetak QR Code - ${selectedAsset?.name}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; display: flex; flex-col; items-center: justify-content: center; height: 80vh; text-align: center; margin-top: 50px; }
                        .qr-card { border: 2px solid #ccc; border-radius: 16px; padding: 30px; max-width: 300px; margin: auto; }
                        h3 { margin-bottom: 5px; color: #333; }
                        p { margin-top: 5px; font-size: 12px; color: #666; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="qr-card">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'code',
            header: 'Kode Aset',
            render: (asset: Asset) => <span className="font-bold text-slate-800 dark:text-slate-100">{asset.code}</span>
        },
        {
            key: 'name',
            header: 'Nama Aset',
            render: (asset: Asset) => (
                <div className="flex items-center gap-3">
                    {asset.photo ? (
                        <img 
                            src={asset.photo} 
                            alt={asset.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-150" 
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 font-bold border border-slate-150">
                            AST
                        </div>
                    )}
                    <span className="font-bold text-slate-750 dark:text-slate-200">{asset.name}</span>
                </div>
            )
        },
        {
            key: 'category.name',
            header: 'Kategori',
            render: (asset: Asset) => <span className="font-semibold text-slate-400 text-xs">{asset.category?.name || '-'}</span>
        },
        {
            key: 'location',
            header: 'Lokasi',
            render: (asset: Asset) => (
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-350">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {asset.location}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (asset: Asset) => <Badge status={asset.status} />
        },
        {
            key: 'condition',
            header: 'Kondisi',
            render: (asset: Asset) => {
                const colors = {
                    good: 'text-emerald-500 bg-emerald-500/10',
                    fair: 'text-amber-500 bg-amber-500/10',
                    poor: 'text-red-500 bg-red-500/10'
                };
                const labels = { good: 'Baik', fair: 'Cukup', poor: 'Rusak' };
                return (
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${colors[asset.condition]}`}>
                        {labels[asset.condition]}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Aksi',
            sortable: false,
            render: (asset: Asset) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setSelectedAsset(asset); setDetailOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => { setSelectedAsset(asset); setQrOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="QR Code"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                        <React.Fragment>
                            <button 
                                onClick={() => handleEditOpen(asset)}
                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-500 dark:hover:bg-slate-850 transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(asset.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-650 rounded-lg text-slate-500 dark:hover:bg-slate-850 transition-colors"
                                title="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </React.Fragment>
                    )}
                </div>
            )
        }
    ];

    // Filter configuration
    const filterOptions = [
        {
            key: 'category.slug',
            label: 'Kategori',
            options: categories.map(c => ({ value: c.slug, label: c.name }))
        },
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'available', label: 'Tersedia' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'in_use', label: 'Sedang Dipakai' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'inactive', label: 'Tidak Aktif' }
            ]
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat data aset...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Daftar Master Aset Kantor
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Kelola data inventaris, status ketersediaan, dan jadwal perawatan berkala.
                    </p>
                </div>
                {isAdmin && (
                    <Button 
                        onClick={handleCreateOpen} 
                        className="rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs py-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Aset Baru
                    </Button>
                )}
            </div>

            {/* Assets Table Widget */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs">
                <DataTable 
                    columns={columns}
                    data={assets}
                    searchKey="name"
                    searchPlaceholder="Cari berdasarkan kode, nama, atau lokasi aset..."
                    filterOptions={filterOptions}
                    exportName="master_aset_ojk"
                />
            </div>

            {/* Create / Edit Form Modal */}
            <Dialog 
                isOpen={formOpen} 
                onClose={() => setFormOpen(false)} 
                title={assetId ? "Edit Detail Aset" : "Tambah Aset Baru"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <Input 
                        label="Kode Aset (Wajib)" 
                        placeholder="Misal: AST-KND-003" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        disabled={!!assetId} // Code is primary key read-only on edit
                    />

                    <Input 
                        label="Nama Aset (Wajib)" 
                        placeholder="Misal: Toyota Camry B 2345 OJK" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Select 
                        label="Kategori Aset (Wajib)" 
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        required
                    />

                    <Input 
                        label="Lokasi Penyimpanan (Wajib)" 
                        placeholder="Misal: Gedung B Parkir Lt. 1" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />

                    <Select 
                        label="Status Aset" 
                        options={[
                            { value: 'available', label: 'Tersedia (Available)' },
                            { value: 'reserved', label: 'Reserved' },
                            { value: 'in_use', label: 'Sedang Dipakai (In Use)' },
                            { value: 'maintenance', label: 'Maintenance' },
                            { value: 'inactive', label: 'Tidak Aktif' }
                        ]}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        required
                    />

                    <Select 
                        label="Kondisi Aset" 
                        options={[
                            { value: 'good', label: 'Baik (Good)' },
                            { value: 'fair', label: 'Cukup Layak (Fair)' },
                            { value: 'poor', label: 'Rusak / Butuh Service (Poor)' }
                        ]}
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as any)}
                        required
                    />

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-slate-650 dark:text-slate-350">Foto Aset (Opsional)</label>
                        {photo ? (
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <img src={photo} alt="Preview Aset" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setPhoto('')}
                                    className="absolute top-2 right-2 bg-red-650 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-red-750 transition-colors cursor-pointer"
                                >
                                    Hapus Foto
                                </button>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('photo-upload-input')?.click()}
                                className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-ojk-red bg-red-500/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/30'}`}
                            >
                                <input
                                    id="photo-upload-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <svg className="w-8 h-8 text-slate-450 dark:text-slate-550 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Drag & drop gambar ke sini, atau klik untuk memilih file
                                </span>
                                <span className="text-[10px] font-medium text-slate-450 dark:text-slate-500 mt-1">
                                    Format: JPG, PNG, WEBP (Maks. 2MB)
                                </span>
                            </div>
                        )}
                    </div>

                    <Input 
                        label="Jadwal Perawatan Terdekat (Opsional)" 
                        type="date"
                        value={maintenanceSchedule}
                        onChange={(e) => setMaintenanceSchedule(e.target.value)}
                    />

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                        <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? 'Menyimpan...' : 'Simpan Aset'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Asset Detail View Modal */}
            <Dialog 
                isOpen={detailOpen} 
                onClose={() => setDetailOpen(false)} 
                title="Informasi Detail Aset"
                size="md"
            >
                {selectedAsset && (
                    <div className="space-y-6">
                        {/* Image Panel */}
                        {selectedAsset.photo ? (
                            <img 
                                src={selectedAsset.photo} 
                                alt={selectedAsset.name} 
                                className="w-full h-48 rounded-2xl object-cover bg-slate-100 border border-slate-100" 
                            />
                        ) : (
                            <div className="w-full h-32 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 font-extrabold text-sm border border-slate-100">
                                TIDAK ADA FOTO
                            </div>
                        )}

                        {/* Detail Info Grid */}
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Nama Aset</span>
                                <p className="text-slate-800 dark:text-white font-bold">{selectedAsset.name}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Kode Aset</span>
                                <p className="text-slate-800 dark:text-white font-bold">{selectedAsset.code}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Kategori</span>
                                <p className="text-slate-850 dark:text-slate-300 font-bold">{selectedAsset.category?.name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Lokasi Simpan</span>
                                <p className="text-slate-850 dark:text-slate-300 font-bold">{selectedAsset.location}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Status</span>
                                <div className="pt-0.5"><Badge status={selectedAsset.status} /></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-medium">Kondisi Fisik</span>
                                <div>
                                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${selectedAsset.condition === 'good' ? 'text-emerald-500 bg-emerald-500/10' : selectedAsset.condition === 'fair' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                        {selectedAsset.condition === 'good' ? 'Baik' : selectedAsset.condition === 'fair' ? 'Cukup' : 'Rusak'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <span className="text-slate-400 font-medium">Jadwal Perawatan (Maintenance Schedule)</span>
                                <p className="text-slate-850 dark:text-slate-300 font-bold">
                                    {selectedAsset.maintenance_schedule 
                                        ? new Date(selectedAsset.maintenance_schedule).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Tidak dijadwalkan'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog 
                isOpen={qrOpen} 
                onClose={() => setQrOpen(false)} 
                title="Asset QR Code"
                size="sm"
            >
                {selectedAsset && (
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm" id="qr-printable-area">
                            <QRCodeSVG 
                                value={selectedAsset.qr_code || selectedAsset.code} 
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                            <h3>{selectedAsset.name}</h3>
                            <p>{selectedAsset.code}</p>
                        </div>

                        <div className="text-xs text-slate-500 max-w-[240px] font-semibold leading-relaxed">
                            Tempel QR Code ini pada aset fisik untuk mempermudah identifikasi.
                        </div>

                        <div className="flex gap-2 w-full pt-4 border-t border-slate-50 dark:border-slate-800/40 justify-center">
                            <Button variant="secondary" onClick={() => setQrOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="primary" onClick={handlePrintQr} className="flex items-center gap-1.5">
                                <Printer className="w-4 h-4" />
                                Cetak QR
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

        </div>
    );
};
