'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, toast, Dialog } from '@/components/UI';
import { 
    Building2, Search, MapPin, Handshake, Calendar, RefreshCw, PlusCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
    const [assets, setAssets] = useState<PartnershipAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('all');

    // Reservation Modal State
    const [resModalOpen, setResModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<PartnershipAsset | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPartnershipAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/assets');
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
            toast.error('Gagal memuat data fasilitas partnership.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnershipAssets();
    }, []);

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              a.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              a.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLoc = selectedLocation === 'all' || a.location.toLowerCase().includes(selectedLocation.toLowerCase());
        return matchesSearch && matchesLoc;
    });

    const handleOpenResModal = (asset: PartnershipAsset) => {
        setSelectedAsset(asset);
        setStartDate('');
        setEndDate('');
        setPurpose('');
        setResModalOpen(true);
    };

    const handleResSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset || !startDate || !endDate || !purpose) {
            toast.warning('Silakan lengkapi semua bidang permohonan.');
            return;
        }
        try {
            setSubmitting(true);
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: selectedAsset.id,
                    start_date: startDate,
                    end_date: endDate,
                    purpose,
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
                        Partnership & Hotel Kerjasama OJK Jawa Barat
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        Fasilitas hotel bintang lima & lokasi akomodasi mitra resmi hasil kerjasama strategis OJK.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={fetchPartnershipAssets} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Banner Card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5" /> Kerjasama Resmi OJK Jabar & Hotel Berbintang
                    </span>
                    <h3 className="text-2xl font-black tracking-tight leading-snug">
                        Akses Akomodasi & Ruang Pertemuan Mitra
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Seluruh pegawai OJK Jawa Barat dapat mengajukan permohonan penggunaan sarana dan prasarana di hotel jaringan partnership OJK untuk kegiatan dinas maupun penginapan tamu resmi.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 z-10">
                    <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <span className="text-2xl font-black block text-amber-400">{assets.length}</span>
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Hotel Mitra</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <Input 
                            placeholder="Cari nama hotel, lokasi, atau kota di Jawa Barat..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-xs rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {['all', 'Bandung', 'Bogor'].map(loc => (
                            <button
                                key={loc}
                                onClick={() => setSelectedLocation(loc)}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                    selectedLocation === loc
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
                                }`}
                            >
                                {loc === 'all' ? 'Semua Wilayah' : loc}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Hotel Cards Grid */}
            {loading ? (
                <div className="py-16 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memuat daftar lokasi partnership hotel...
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tidak ada hotel mitra yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(hotel => (
                        <Card key={hotel.id} className="rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col group">
                            
                            {/* Image Container - Fixed Landscape 16:9 */}
                            <div className="relative h-52 w-full overflow-hidden bg-slate-900 shrink-0">
                                <img 
                                    src={hotel.photo || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} 
                                    alt={hotel.name}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                {/* TOP-LEFT BADGE: KAPASITAS & MITRA */}
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                                    {hotel.capacity && (
                                        <span className="bg-amber-600/95 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                            🤝 {hotel.capacity}
                                        </span>
                                    )}
                                    <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                        Mitra Resmi OJK
                                    </span>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3">
                                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                                        {hotel.code}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-base font-black text-slate-850 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                                        {hotel.name}
                                    </h4>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{hotel.location}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <Button 
                                        onClick={() => handleOpenResModal(hotel)}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Ajukan Reservasi / Booking
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Dialog Reservasi Hotel */}
            <Dialog
                isOpen={resModalOpen}
                onClose={() => setResModalOpen(false)}
                title={`Formulir Reservasi: ${selectedAsset?.name || 'Hotel Partnership'}`}
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
                        <Input 
                            label="Tanggal & Waktu Mulai Check-in" 
                            type="datetime-local" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            required 
                        />
                        <Input 
                            label="Tanggal & Waktu Selesai Check-out" 
                            type="datetime-local" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                        />
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
