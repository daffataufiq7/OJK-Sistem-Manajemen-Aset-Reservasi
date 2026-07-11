import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { Button, Input, Select, TextArea, Badge, toast, Card } from '../components/UI';
import { 
    Calendar, 
    Clock, 
    Plus, 
    AlertTriangle, 
    CheckCircle2, 
    FileText, 
    Users, 
    MapPin,
    CalendarCheck,
    Navigation,
    UserCheck,
    HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    status: string;
    condition: string;
    photo: string | null;
}

interface Reservation {
    id: number;
    user_id: number;
    asset_id: number;
    start_date: string;
    end_date: string;
    purpose: string;
    destination: string | null;
    driver_required: boolean;
    driver_name: string | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'reserved' | 'in_use' | 'completed' | 'cancelled';
    rejection_reason: string | null;
    asset?: Asset;
    created_at: string;
}

export const Reservations: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data lists
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

    // Form inputs
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [assetId, setAssetId] = useState<number>(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [destination, setDestination] = useState('');
    const [driverRequired, setDriverRequired] = useState(false);
    const [driverName, setDriverName] = useState('');
    const [notes, setNotes] = useState('');

    // State helpers
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);
    const [checkingConflict, setCheckingConflict] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resResponse, catResponse, assetResponse] = await Promise.all([
                axios.get('/reservations'),
                axios.get('/categories'),
                axios.get('/assets')
            ]);
            setReservations(resResponse.data);
            setCategories(catResponse.data);
            setAssets(assetResponse.data);

            if (catResponse.data.length > 0) {
                setSelectedCategory(catResponse.data[0].slug);
            }
        } catch (error) {
            console.error('Error loading data', error);
            toast.error('Gagal memuat data peminjaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter assets dynamically based on category
    useEffect(() => {
        if (!selectedCategory) return;
        const matchedCat = categories.find(c => c.slug === selectedCategory);
        if (!matchedCat) return;

        const filtered = assets.filter(a => a.category_id === matchedCat.id);
        setFilteredAssets(filtered);
        
        if (filtered.length > 0) {
            setAssetId(filtered[0].id);
        } else {
            setAssetId(0);
        }
        
        // Reset driver flag if category changes from vehicle
        if (selectedCategory !== 'kendaraan') {
            setDriverRequired(false);
            setDriverName('');
            setDestination('');
        }
    }, [selectedCategory, assets, categories]);

    // Check conflict check logic
    const verifyConflicts = async () => {
        if (!assetId || !startDate || !endDate) return;
        
        // Ensure dates are parsed correctly and valid range
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            setConflictWarning('Waktu selesai harus setelah waktu mulai.');
            return;
        }

        try {
            setCheckingConflict(true);
            setConflictWarning(null);
            const response = await axios.get('/reservations/check-conflict', {
                params: { asset_id: assetId, start_date: startDate, end_date: endDate }
            });

            if (response.data.conflict) {
                const details = response.data.details[0];
                setConflictWarning(
                    `Aset ini sudah dibooking oleh ${details.user_name} pada waktu tersebut untuk keperluan: "${details.purpose}". Silakan pilih aset lain atau ubah jadwal.`
                );
            } else {
                // Check if selected asset is under maintenance or inactive
                const selected = assets.find(a => a.id === assetId);
                if (selected?.status === 'maintenance') {
                    setConflictWarning('Warning: Aset saat ini sedang dalam jadwal pemeliharaan (Maintenance Schedule).');
                } else if (selected?.status === 'inactive') {
                    setConflictWarning('Warning: Aset berstatus Nonaktif (tidak bisa dipinjam).');
                } else {
                    setConflictWarning(null);
                }
            }
        } catch (error) {
            console.error('Conflict checking error', error);
        } finally {
            setCheckingConflict(false);
        }
    };

    // Trigger conflict check when fields change
    useEffect(() => {
        verifyConflicts();
    }, [assetId, startDate, endDate]);

    // Submit Booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetId || !startDate || !endDate || !purpose) {
            toast.warning('Silakan lengkapi semua kolom wajib.');
            return;
        }

        if (conflictWarning && !conflictWarning.startsWith('Warning:')) {
            toast.error('Tidak dapat mengirimkan peminjaman karena bentrok jadwal.');
            return;
        }

        setSubmitting(true);
        const payload = {
            asset_id: assetId,
            start_date: startDate,
            end_date: endDate,
            purpose,
            destination: selectedCategory === 'kendaraan' ? destination : null,
            driver_required: selectedCategory === 'kendaraan' ? driverRequired : false,
            driver_name: selectedCategory === 'kendaraan' && driverRequired ? driverName : null,
            notes: notes || null
        };

        try {
            await axios.post('/reservations', payload);
            toast.success('Pengajuan peminjaman berhasil dikirim. Menunggu persetujuan Validator.');
            
            // Reset form
            setPurpose('');
            setDestination('');
            setDriverRequired(false);
            setDriverName('');
            setNotes('');
            
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan peminjaman.');
        } finally {
            setSubmitting(false);
        }
    };

    // Actions
    const handleStartUsage = async (id: number) => {
        try {
            await axios.post(`/reservations/${id}/start-usage`);
            toast.success('Peminjaman diaktifkan (Aset Sedang Digunakan).');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memulai penggunaan.');
        }
    };

    const handleCompleteUsage = async (id: number) => {
        try {
            await axios.post(`/reservations/${id}/complete-usage`);
            toast.success('Aset berhasil dikembalikan (Selesai).');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengembalikan aset.');
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) return;
        try {
            await axios.post(`/reservations/${id}/cancel`);
            toast.success('Peminjaman berhasil dibatalkan.');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal membatalkan peminjaman.');
        }
    };

    // Table columns
    const columns = [
        {
            key: 'id',
            header: 'ID Peminjaman',
            render: (res: Reservation) => <span className="font-bold text-slate-450 uppercase">#RSV-{res.id}</span>
        },
        {
            key: 'asset.name',
            header: 'Aset yang Dipinjam',
            render: (res: Reservation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{res.asset?.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{res.asset?.code}</span>
                </div>
            )
        },
        {
            key: 'start_date',
            header: 'Waktu Mulai',
            render: (res: Reservation) => (
                <span className="font-semibold text-slate-600 dark:text-slate-350">
                    {new Date(res.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(res.start_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
            )
        },
        {
            key: 'end_date',
            header: 'Waktu Selesai',
            render: (res: Reservation) => (
                <span className="font-semibold text-slate-655 dark:text-slate-350">
                    {new Date(res.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(res.end_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
            )
        },
        {
            key: 'purpose',
            header: 'Keperluan',
            render: (res: Reservation) => <span className="truncate max-w-[200px] block font-semibold text-xs text-slate-500" title={res.purpose}>{res.purpose}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (res: Reservation) => (
                <div className="flex flex-col space-y-1">
                    <Badge status={res.status} />
                    {res.status === 'rejected' && res.rejection_reason && (
                        <span className="text-[9px] text-red-500 font-semibold max-w-[140px] leading-tight block">
                            Alasan: {res.rejection_reason}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Aksi Peminjam',
            sortable: false,
            render: (res: Reservation) => {
                const isMyBooking = res.user_id === user?.id;
                
                return (
                    <div className="flex gap-2">
                        {/* Cancel option for pending bookings */}
                        {isMyBooking && res.status === 'pending' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-bold border-red-200 text-red-650 hover:bg-red-50"
                                onClick={() => handleCancel(res.id)}
                            >
                                Batalkan
                            </Button>
                        )}
                        {/* Start usage option for approved bookings */}
                        {isMyBooking && res.status === 'approved' && (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 border-none"
                                onClick={() => handleStartUsage(res.id)}
                            >
                                Ambil/Pakai
                            </Button>
                        )}
                        {/* Complete usage option for in-use bookings */}
                        {isMyBooking && res.status === 'in_use' && (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 border-none"
                                onClick={() => handleCompleteUsage(res.id)}
                            >
                                Kembalikan
                            </Button>
                        )}
                        {(!isMyBooking || ['rejected', 'completed', 'cancelled'].includes(res.status)) && (
                            <span className="text-[10px] font-semibold text-slate-400">Selesai</span>
                        )}
                    </div>
                );
            }
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat formulir reservasi...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            
            {/* Header Breadcrumb */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Pengajuan Reservasi & Peminjaman Aset
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Lakukan peminjaman mobil dinas, ruangan rapat, proyektor, atau laptop di sini.
                </p>
            </div>

            {/* Top Grid: Form and Info Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Form Reservation Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 soft-shadow flex flex-col space-y-5">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-800/40">
                        Formulir Peminjaman
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Category selection */}
                        <Select 
                            label="Kategori Aset (Wajib)"
                            options={categories.map(c => ({ value: c.slug, label: c.name }))}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            required
                        />

                        {/* Asset selection */}
                        <Select 
                            label="Pilih Aset (Wajib)"
                            options={filteredAssets.map(a => ({ value: a.id, label: `${a.name} (${a.code}) - ${a.status === 'available' ? 'Tersedia' : 'Sibuk'}` }))}
                            value={assetId}
                            onChange={(e) => setAssetId(Number(e.target.value))}
                            required
                            disabled={filteredAssets.length === 0}
                        />

                        {/* Date Start */}
                        <Input 
                            label="Tanggal & Waktu Mulai (Wajib)"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />

                        {/* Date End */}
                        <Input 
                            label="Tanggal & Waktu Selesai (Wajib)"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />

                        {/* Vehicle details */}
                        {selectedCategory === 'kendaraan' && (
                            <React.Fragment>
                                <Input 
                                    label="Tujuan Perjalanan (Wajib)"
                                    placeholder="Misal: Kantor OJK Pusat, Jakarta"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    required
                                />

                                <div className="flex flex-col space-y-1.5 justify-end">
                                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 mb-2">Bantuan Pengemudi</label>
                                    <div className="flex items-center space-x-4 h-10">
                                        <label className="inline-flex items-center text-xs font-semibold cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={driverRequired} 
                                                onChange={(e) => setDriverRequired(e.target.checked)}
                                                className="mr-2 rounded border-slate-300 text-ojk-red focus:ring-ojk-red" 
                                            />
                                            Butuh Driver Kantor
                                        </label>
                                    </div>
                                </div>

                                {driverRequired && (
                                    <Input 
                                        label="Nama Driver (Opsional)"
                                        placeholder="Tulis driver yang diajukan..."
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        className="sm:col-span-2"
                                    />
                                )}
                            </React.Fragment>
                        )}

                        {/* Purpose */}
                        <TextArea 
                            label="Keperluan / Tujuan Peminjaman (Wajib)"
                            placeholder="Jelaskan agenda kerja secara lengkap..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="sm:col-span-2"
                            required
                        />

                        {/* Notes */}
                        <TextArea 
                            label="Catatan Tambahan (Opsional)"
                            placeholder="Catatan pendukung..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="sm:col-span-2"
                        />

                        {/* Real-time Warning Box */}
                        {checkingConflict && (
                            <div className="sm:col-span-2 p-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memverifikasi ketersediaan jadwal aset...
                            </div>
                        )}

                        {conflictWarning && (
                            <div className={`sm:col-span-2 p-4 rounded-xl text-xs font-semibold flex items-start gap-3 ${conflictWarning.startsWith('Warning:') ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-750 border border-red-100'}`}>
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-bold">{conflictWarning.startsWith('Warning:') ? 'Peringatan Pemeliharaan' : 'Jadwal Bentrok!'}</p>
                                    <p className="leading-relaxed font-semibold">{conflictWarning}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Actions */}
                        <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={submitting || (!!conflictWarning && !conflictWarning.startsWith('Warning:'))}
                                className="px-6 py-2.5 rounded-xl text-xs font-bold"
                            >
                                {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Reservasi'}
                            </Button>
                        </div>

                    </form>
                </div>

                {/* Right: Info Rules Side Banner */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-tr from-slate-900 to-slate-800 border-none text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/10 rounded-full blur-xl"></div>
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4.5 h-4.5 text-ojk-red shrink-0" />
                            Aturan Peminjaman
                        </h4>
                        <ul className="space-y-2.5 text-[11px] text-slate-300 font-semibold leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-ojk-red font-bold">&bull;</span>
                                Pengajuan wajib diajukan minimal 1 hari sebelum pemakaian dilakukan.
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-ojk-red font-bold">&bull;</span>
                                Pengisian data keperluan harus mendetail untuk memudahkan Validator memberikan izin.
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-ojk-red font-bold">&bull;</span>
                                Jika mengajukan pembatalan, harap lakukan sebelum status disetujui (Approved).
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-ojk-red font-bold">&bull;</span>
                                Pengemudi (Driver) internal hanya tersedia untuk tugas dinas luar kota yang mendesak.
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-slate-400" /> Alur Approval
                        </h4>
                        <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4 text-[10px] font-semibold text-slate-500">
                            <div className="relative">
                                <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-250 dark:bg-slate-800 border border-slate-350 flex items-center justify-center text-[8px] font-extrabold">1</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">Kirim Pengajuan</span>
                                Status otomatis di-set `Pending` menunggu antrean validator.
                            </div>
                            <div className="relative">
                                <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-250 dark:bg-slate-800 border border-slate-350 flex items-center justify-center text-[8px] font-extrabold">2</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">Persetujuan (Approve)</span>
                                Status berubah `Approved` & Aset berubah `Reserved`.
                            </div>
                            <div className="relative">
                                <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-250 dark:bg-slate-800 border border-slate-350 flex items-center justify-center text-[8px] font-extrabold">3</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">Digunakan (In Use)</span>
                                Tekan tombol `Ambil/Pakai` untuk mengubah status menjadi `In Use`.
                            </div>
                            <div className="relative">
                                <span className="absolute -left-7.5 top-0.5 w-3.5 h-3.5 rounded-full bg-slate-250 dark:bg-slate-800 border border-slate-350 flex items-center justify-center text-[8px] font-extrabold">4</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">Kembalikan</span>
                                Setelah selesai pakai, klik `Kembalikan` agar status aset kembali `Available`.
                            </div>
                        </div>
                    </Card>
                </div>

            </div>

            {/* Bottom Panel: User's Booking List */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-ojk-red shrink-0" />
                    Riwayat Pengajuan Peminjaman Saya
                </h3>
                <DataTable 
                    columns={columns}
                    data={reservations}
                    searchKey="asset.name"
                    searchPlaceholder="Cari riwayat berdasarkan nama aset..."
                    exportName="riwayat_reservasi_saya"
                />
            </div>

        </div>
    );
};
