'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, toast, Dialog } from '@/components/UI';
import { 
    Building2, Search, MapPin, Handshake, Calendar, RefreshCw, PlusCircle, CheckCircle2, ShieldCheck, PhoneCall, Star, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PARTNERSHIP_HOTELS_DATA, PartnershipHotelItem } from '@/lib/partnershipData';

interface PartnershipAsset {
    id: number;
    code: string;
    name: string;
    location: string;
    status: string;
    photo: string | null;
    capacity?: string | null;
    category?: { name: string; slug: string };
}

export default function PartnershipPage() {
    const { user } = useAuth();
    const router = useRouter();
    const isAdminOrValidator = user?.role === 'super_admin' || user?.role === 'validator';
    const [assets, setAssets] = useState<PartnershipAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');

    // Reservation Modal State
    const [resModalOpen, setResModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<{ id?: number; code: string; name: string; location: string } | null>(null);
    const [startDateOnly, setStartDateOnly] = useState('');
    const [startTime24, setStartTime24] = useState('14:00');
    const [endDateOnly, setEndDateOnly] = useState('');
    const [endTime24, setEndTime24] = useState('12:00');
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPartnershipAssets = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const ts = Date.now();
            const res = await fetch(`/api/assets?t=${ts}`, { cache: 'no-store' });
            if (res.ok) {
                const data: PartnershipAsset[] = await res.json();
                const filtered = data.filter(a => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const name = (a.category?.name || '').toLowerCase();
                    return slug.includes('partner') || name.includes('partner') || slug.includes('kerjasama') || name.includes('kerjasama');
                });
                setAssets(filtered);
            }
        } catch {
            if (!isBackground) toast.error('Gagal memuat data fasilitas partnership.');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnershipAssets();
        const interval = setInterval(() => fetchPartnershipAssets(true), 5000);
        const handleFocus = () => fetchPartnershipAssets(true);
        window.addEventListener('focus', handleFocus);
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Combine database assets + fallback static dataset for complete 150+ list coverage
    const combinedHotels = React.useMemo(() => {
        const map = new Map<string, { id?: number; code: string; name: string; location: string; contact: string; price?: string; photo?: string | null; city: string; featured?: boolean }>();

        // Static dataset as base
        PARTNERSHIP_HOTELS_DATA.forEach(item => {
            map.set(item.name.toLowerCase().trim(), {
                code: item.code,
                name: item.name,
                location: item.location,
                contact: item.contact,
                price: item.price,
                photo: item.photo,
                city: item.city,
                featured: item.featured,
            });
        });

        // Overlay with database assets if present
        assets.forEach(a => {
            const key = a.name.toLowerCase().trim();
            const existing = map.get(key);
            let city = existing?.city || 'Jawa Barat';
            const locLower = a.location.toLowerCase();
            if (locLower.includes('jakarta')) city = 'DKI Jakarta';
            else if (locLower.includes('bandung') || locLower.includes('lembang')) city = 'Bandung & Lembang';
            else if (locLower.includes('bogor') || locLower.includes('sentul') || locLower.includes('puncak')) city = 'Bogor, Sentul & Puncak';
            else if (locLower.includes('bekasi') || locLower.includes('cikarang') || locLower.includes('karawang')) city = 'Bekasi, Cikarang & Karawang';
            else if (locLower.includes('cirebon') || locLower.includes('kuningan') || locLower.includes('majalengka')) city = 'Cirebon, Kuningan & Majalengka';
            else if (locLower.includes('garut') || locLower.includes('tasik') || locLower.includes('sukabumi') || locLower.includes('purwakarta') || locLower.includes('subang')) city = 'Garut, Tasik, Sukabumi, Purwakarta & Subang';

            map.set(key, {
                id: a.id,
                code: a.code || existing?.code || 'AST-PTN',
                name: a.name,
                location: a.location,
                contact: a.capacity || existing?.contact || 'Mitra Resmi OJK',
                price: existing?.price,
                photo: a.photo || existing?.photo,
                city: city as any,
                featured: existing?.featured || Boolean(a.photo),
            });
        });

        return Array.from(map.values());
    }, [assets]);

    const featuredHotels = React.useMemo(() => {
        return combinedHotels.filter(h => h.featured || h.photo).slice(0, 6);
    }, [combinedHotels]);

    const filteredHotels = React.useMemo(() => {
        return combinedHotels.filter(h => {
            const matchesSearch = 
                h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.code.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesRegion = selectedRegion === 'all' || h.city === selectedRegion;
            return matchesSearch && matchesRegion;
        });
    }, [combinedHotels, searchQuery, selectedRegion]);

    const handleOpenResModal = (hotel: { id?: number; code: string; name: string; location: string }) => {
        setSelectedAsset(hotel);
        const todayStr = new Date().toISOString().split('T')[0];
        setStartDateOnly(todayStr);
        setStartTime24('14:00');
        setEndDateOnly(todayStr);
        setEndTime24('12:00');
        setPurpose('');
        setResModalOpen(true);
    };

    const handleResSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset || !startDateOnly || !endDateOnly || !purpose) {
            toast.warning('Silakan lengkapi semua bidang permohonan.');
            return;
        }

        const start_date = `${startDateOnly}T${startTime24}`;
        const end_date = `${endDateOnly}T${endTime24}`;

        try {
            setSubmitting(true);
            let targetAssetId = selectedAsset.id;

            // If selected item does not have DB id yet, search or fallback
            if (!targetAssetId) {
                const found = assets.find(a => a.name.toLowerCase() === selectedAsset.name.toLowerCase());
                if (found) targetAssetId = found.id;
            }

            if (!targetAssetId && assets.length > 0) {
                targetAssetId = assets[0].id;
            }

            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: targetAssetId,
                    start_date,
                    end_date,
                    purpose: `[${selectedAsset.name}] ${purpose}`,
                    driver_required: false
                })
            });
            if (res.ok) {
                toast.success(`Pengajuan pemakaian fasilitas di ${selectedAsset.name} berhasil dikirim!`);
                setResModalOpen(false);
                router.push('/reservations');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal mengajukan reservasi.');
            }
        } catch {
            toast.error('Gagal mengajukan reservasi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 font-sans pb-16">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Handshake className="w-6 h-6" />
                        </div>
                        Partnership & Hotel Kerjasama OJK (Jawa Barat & DKI Jakarta)
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        Daftar lengkap akomodasi dan fasilitas hotel jaringan mitra resmi hasil kerjasama strategis OJK.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={fetchPartnershipAssets} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Banner Summary Card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5" /> Jaringan Kerjasama Resmi OJK Jawa Barat & DKI Jakarta
                    </span>
                    <h3 className="text-2xl font-black tracking-tight leading-snug">
                        Daftar Akomodasi & Ruang Pertemuan Mitra
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Daftar disajikan dalam bentuk tabel ringkas untuk memudahkan pencarian cepat fasilitas hotel dinas di seluruh wilayah Jawa Barat dan DKI Jakarta.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 z-10">
                    <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <span className="text-2xl font-black block text-amber-400">{combinedHotels.length}</span>
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Total Hotel Mitra</span>
                    </div>
                </div>
            </div>

            {/* ── SECTION 1: HIGHLIGHT / FEATURED HOTELS (Sampel Gambar Pilihan) ── */}
            {featuredHotels.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Featured Hotels (Pilihan Utama)
                        </h3>
                        <span className="text-[11px] text-slate-400 font-semibold">Sampel Gambar Hotel Utama</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredHotels.map((hotel, idx) => (
                            <Card key={idx} className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col group hover:-translate-y-1 transition-all duration-300">
                                <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
                                    <img 
                                        src={hotel.photo || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} 
                                        alt={hotel.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                        {hotel.city}
                                    </span>
                                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                                        <p className="text-xs font-black truncate">{hotel.name}</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />{hotel.location}</p>
                                        {isAdminOrValidator ? (
                                            <p className="flex items-center gap-1.5 truncate font-medium"><PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{hotel.contact}</p>
                                        ) : (
                                            <p className="flex items-center gap-1.5 truncate font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck className="w-3.5 h-3.5 shrink-0" />Mitra Resmi OJK</p>
                                        )}
                                    </div>
                                    <Button 
                                        onClick={() => handleOpenResModal(hotel)}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl shadow-xs"
                                    >
                                        Ajukan Booking
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECTION 2: DAFTAR LENGKAP HOTEL (LIST / TABLE VIEW) ── */}
            <div className="space-y-4 pt-4">
                
                {/* Filter Tabs & Search */}
                <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <Input 
                                placeholder={isAdminOrValidator ? "Cari nama hotel, kota, alamat, atau nomor telepon CP..." : "Cari nama hotel, kota, atau alamat lokasi..."} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 text-xs rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            <Filter className="w-4 h-4 text-amber-500" />
                            <span>Menampilkan {filteredHotels.length} dari {combinedHotels.length} Hotel</span>
                        </div>
                    </div>

                    {/* Region Filter Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                        {[
                            { id: 'all', label: 'Semua Wilayah' },
                            { id: 'Bandung & Lembang', label: 'Bandung & Lembang' },
                            { id: 'Bogor, Sentul & Puncak', label: 'Bogor, Sentul & Puncak' },
                            { id: 'Bekasi, Cikarang & Karawang', label: 'Bekasi, Cikarang & Karawang' },
                            { id: 'Cirebon, Kuningan & Majalengka', label: 'Cirebon, Kuningan & Majalengka' },
                            { id: 'Garut, Tasik, Sukabumi, Purwakarta & Subang', label: 'Garut, Tasik, Sukabumi & Lainnya' },
                            { id: 'DKI Jakarta', label: 'DKI Jakarta' },
                        ].map(reg => (
                            <button
                                key={reg.id}
                                onClick={() => setSelectedRegion(reg.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                    selectedRegion === reg.id
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {reg.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Data Table List View */}
                <Card className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black uppercase tracking-wider text-[10.5px]">
                                    <th className="py-3.5 px-4">No</th>
                                    <th className="py-3.5 px-4">Kode & Nama Hotel</th>
                                    <th className="py-3.5 px-4">Wilayah / Kota</th>
                                    <th className="py-3.5 px-4">Alamat Lokasi</th>
                                    {isAdminOrValidator && <th className="py-3.5 px-4">Telepon / Contact Person</th>}
                                    <th className="py-3.5 px-4 text-right">Aksi Booking</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {filteredHotels.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrValidator ? 6 : 5} className="py-12 text-center text-slate-400 font-semibold">
                                            Tidak ada data hotel kerjasama yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHotels.map((hotel, idx) => (
                                        <tr key={idx} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="space-y-0.5">
                                                    <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                                        {hotel.name}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                                                        {hotel.code}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    {hotel.city}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 max-w-xs truncate text-[11px] font-medium text-slate-500 dark:text-slate-400" title={hotel.location}>
                                                {hotel.location}
                                            </td>
                                            {isAdminOrValidator && (
                                                <td className="py-3 px-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                    {hotel.contact}
                                                    {hotel.price && <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{hotel.price}</div>}
                                                </td>
                                            )}
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenResModal(hotel)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5" /> Booking
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Dialog Reservasi Hotel */}
            <Dialog
                isOpen={resModalOpen}
                onClose={() => setResModalOpen(false)}
                title={`Formulir Permohonan: ${selectedAsset?.name || 'Hotel Partnership'}`}
                size="md"
            >
                <form onSubmit={handleResSubmit} className="space-y-4 font-sans text-xs">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex items-center gap-3 text-amber-800 dark:text-amber-300">
                        <Building2 className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-extrabold text-xs">{selectedAsset?.name}</p>
                            <p className="text-[11px] opacity-80">{selectedAsset?.location}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Waktu Mulai Check-in</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Input
                                    type="date"
                                    value={startDateOnly}
                                    onChange={(e) => setStartDateOnly(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
                                <Select
                                    value={startTime24}
                                    onChange={(e) => setStartTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                >
                                    {[
                                        "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
                                        "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                                        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                                        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
                                    ].map(t => (
                                        <option key={t} value={t}>{t} WIB</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Waktu Selesai Check-out</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Input
                                    type="date"
                                    value={endDateOnly}
                                    onChange={(e) => setEndDateOnly(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
                                <Select
                                    value={endTime24}
                                    onChange={(e) => setEndTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                >
                                    {[
                                        "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
                                        "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                                        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                                        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
                                    ].map(t => (
                                        <option key={t} value={t}>{t} WIB</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Input 
                        label="Tujuan & Peruntukan Pemakaian / Kegiatan Dinas" 
                        placeholder="Contoh: Penginapan Tamu Undangan Rapat Koordinasi OJK" 
                        value={purpose} 
                        onChange={(e) => setPurpose(e.target.value)} 
                        required 
                    />

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" type="button" onClick={() => setResModalOpen(false)} className="rounded-xl">Batal</Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                            {submitting ? 'Mengirim...' : 'Kirim Pengajuan Partnership'}
                        </Button>
                    </div>
                </form>
            </Dialog>

        </div>
    );
}
