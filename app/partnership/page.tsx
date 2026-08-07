'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge, toast, Dialog } from '@/components/UI';
import { 
    Building2, Search, MapPin, Handshake, Calendar, RefreshCw, PlusCircle, CheckCircle2, ShieldCheck, PhoneCall, Star, Filter, Edit2, Trash2, Plus, UploadCloud
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PARTNERSHIP_HOTELS_DATA, PartnershipHotelItem } from '@/lib/partnershipData';

interface AssetCategory { id: number; name: string; slug: string; }
interface PartnershipAsset {
    id: number;
    code: string;
    name: string;
    location: string;
    status: string;
    photo: string | null;
    capacity?: string | null;
    category_id?: number;
    categoryId?: number;
    category?: AssetCategory;
}

export default function PartnershipPage() {
    const { user } = useAuth();
    const router = useRouter();
    const isAdminOrValidator = Boolean(user && (user.role === 'super_admin' || user.role === 'validator'));

    const [assets, setAssets] = useState<PartnershipAsset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
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

    // Admin Hotel CRUD Modal State
    const [hotelModalOpen, setHotelModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<PartnershipAsset | null>(null);
    const [hCode, setHCode] = useState('');
    const [hName, setHName] = useState('');
    const [hCity, setHCity] = useState('Bandung & Lembang');
    const [hLocation, setHLocation] = useState('');
    const [hContact, setHContact] = useState('');
    const [hPhoto, setHPhoto] = useState('');

    const fetchPartnershipAssets = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const ts = Date.now();
            const [aRes, cRes] = await Promise.all([
                fetch(`/api/assets?t=${ts}`, { cache: 'no-store' }),
                fetch(`/api/categories?t=${ts}`, { cache: 'no-store' })
            ]);
            if (aRes.ok) {
                const data: PartnershipAsset[] = await aRes.json();
                const filtered = data.filter(a => {
                    const slug = (a.category?.slug || '').toLowerCase();
                    const name = (a.category?.name || '').toLowerCase();
                    return slug.includes('partner') || name.includes('partner') || slug.includes('kerjasama') || name.includes('kerjasama');
                });
                setAssets(filtered);
            }
            if (cRes.ok) {
                setCategories(await cRes.json());
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

    // Get Partnership Category ID
    const partnershipCatId = React.useMemo(() => {
        const found = categories.find(c => (c.slug || '').includes('partner') || (c.name || '').toLowerCase().includes('partner') || (c.slug || '').includes('kerjasama'));
        return found?.id || categories[0]?.id || 3;
    }, [categories]);

    // Combine database assets + fallback static dataset for complete list coverage
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

    // ─── ADMIN HOTEL CRUD ACTIONS ───
    const handleOpenAddHotelModal = () => {
        setEditingHotel(null);
        setHCode(`AST-PTN-${String(combinedHotels.length + 1).padStart(3, '0')}`);
        setHName('');
        setHCity('Bandung & Lembang');
        setHLocation('');
        setHContact('');
        setHPhoto('');
        setHotelModalOpen(true);
    };

    const handleOpenEditHotelModal = (hotel: { id?: number; code: string; name: string; location: string; contact: string; photo?: string | null; city: string }) => {
        const foundDbAsset = assets.find(a => a.id === hotel.id || a.name.toLowerCase() === hotel.name.toLowerCase());
        if (foundDbAsset) {
            setEditingHotel(foundDbAsset);
        } else {
            setEditingHotel({ id: 0, code: hotel.code, name: hotel.name, location: hotel.location, capacity: hotel.contact, photo: hotel.photo || null, status: 'available', condition: 'good' });
        }
        setHCode(hotel.code);
        setHName(hotel.name);
        setHCity(hotel.city);
        setHLocation(hotel.location);
        setHContact(hotel.contact);
        setHPhoto(hotel.photo || '');
        setHotelModalOpen(true);
    };

    const handleSaveHotelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hCode || !hName || !hLocation) {
            toast.warning('Silakan lengkapi kode, nama hotel, dan alamat lokasi.');
            return;
        }

        try {
            setSubmitting(true);
            const fullLocation = hLocation.includes(`(${hCity})`) ? hLocation : `${hLocation} (${hCity})`;
            const payload = {
                code: hCode,
                name: hName,
                category_id: partnershipCatId,
                location: fullLocation,
                capacity: hContact || null,
                status: 'available',
                condition: 'good',
                photo: hPhoto || null,
            };

            const isEditExisting = editingHotel && editingHotel.id > 0;
            const res = isEditExisting
                ? await fetch(`/api/assets/${editingHotel.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                : await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (res.ok) {
                toast.success(`Hotel Partnership "${hName}" berhasil ${isEditExisting ? 'diperbarui' : 'ditambahkan'}!`);
                setHotelModalOpen(false);
                fetchPartnershipAssets();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Gagal menyimpan data hotel.');
            }
        } catch {
            toast.error('Gagal menyimpan data hotel.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHotel = async (hotel: { id?: number; name: string }) => {
        const foundDbAsset = assets.find(a => a.id === hotel.id || a.name.toLowerCase() === hotel.name.toLowerCase());
        if (!foundDbAsset || foundDbAsset.id === 0) {
            toast.warning('Hotel ini belum tersimpan di database aktif.');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus "${hotel.name}" dari master partnership?`)) return;

        try {
            const res = await fetch(`/api/assets/${foundDbAsset.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`Hotel "${hotel.name}" berhasil dihapus.`);
                fetchPartnershipAssets();
            } else {
                toast.error('Gagal menghapus hotel.');
            }
        } catch {
            toast.error('Gagal menghapus hotel.');
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
                    {isAdminOrValidator && (
                        <Button 
                            onClick={handleOpenAddHotelModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Tambah Hotel Partnership
                        </Button>
                    )}
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
                                    <th className="py-3.5 px-4 text-right">Aksi & Booking</th>
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
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isAdminOrValidator && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleOpenEditHotelModal(hotel)}
                                                                className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                                                title="Edit Hotel Partnership"
                                                            >
                                                                <Edit2 className="w-3 h-3" /> Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteHotel(hotel)}
                                                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-[10.5px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                                                title="Hapus Hotel Partnership"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> Hapus
                                                            </button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenResModal(hotel)}
                                                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1"
                                                    >
                                                        <PlusCircle className="w-3.5 h-3.5" /> Booking
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Dialog Admin Create/Edit Hotel Partnership */}
            <Dialog
                isOpen={hotelModalOpen}
                onClose={() => setHotelModalOpen(false)}
                title={editingHotel && editingHotel.id > 0 ? `Edit Hotel: ${editingHotel.name}` : 'Tambah Hotel Partnership Baru'}
                size="md"
            >
                <form onSubmit={handleSaveHotelSubmit} className="space-y-3.5 font-sans text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input 
                            label="Kode Hotel / Aset" 
                            placeholder="AST-PTN-001" 
                            value={hCode} 
                            onChange={(e) => setHCode(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Nama Hotel Partnership" 
                            placeholder="Contoh: THE PAPANDAYAN HOTEL" 
                            value={hName} 
                            onChange={(e) => setHName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select 
                            label="Wilayah / Kota Scope" 
                            value={hCity} 
                            onChange={(e) => setHCity(e.target.value)} 
                            required
                        >
                            <option value="Bandung & Lembang">Bandung & Lembang</option>
                            <option value="Bogor, Sentul & Puncak">Bogor, Sentul & Puncak</option>
                            <option value="Bekasi, Cikarang & Karawang">Bekasi, Cikarang & Karawang</option>
                            <option value="Cirebon, Kuningan & Majalengka">Cirebon, Kuningan & Majalengka</option>
                            <option value="Garut, Tasik, Sukabumi, Purwakarta & Subang">Garut, Tasik, Sukabumi & Lainnya</option>
                            <option value="DKI Jakarta">DKI Jakarta</option>
                        </Select>

                        <Input 
                            label="Contact Person (CP), Telepon & Tarif" 
                            placeholder="Contoh: Telp: 022-7310799 | CP: TyaGita (0818635445) | Rp 1.500.000" 
                            value={hContact} 
                            onChange={(e) => setHContact(e.target.value)} 
                        />
                    </div>

                    <Input 
                        label="Alamat Lengkap Lokasi Hotel" 
                        placeholder="Contoh: Jl. Gatot Subroto No. 83, Bandung" 
                        value={hLocation} 
                        onChange={(e) => setHLocation(e.target.value)} 
                        required 
                    />

                    <Input 
                        label="URL Foto Hotel (Opsional untuk Featured Header)" 
                        placeholder="https://images.unsplash.com/photo-..." 
                        value={hPhoto} 
                        onChange={(e) => setHPhoto(e.target.value)} 
                    />

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="secondary" type="button" onClick={() => setHotelModalOpen(false)} className="rounded-xl">Batal</Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                            {submitting ? 'Menyimpan...' : 'Simpan Hotel Partnership'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Modal Dialog Permohonan Reservasi Hotel */}
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
                                <Input
                                    type="time"
                                    value={startTime24}
                                    onChange={(e) => setStartTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
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
                                <Input
                                    type="time"
                                    value={endTime24}
                                    onChange={(e) => setEndTime24(e.target.value)}
                                    className="text-xs py-2 rounded-xl"
                                    required
                                />
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
