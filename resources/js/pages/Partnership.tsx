import React, { useState } from 'react';
import { Card, CardContent, Button, Input, Select, Badge, Dialog, toast } from '../components/UI';
import { 
    Building2, 
    MapPin, 
    Star, 
    Percent, 
    Phone, 
    Mail, 
    ExternalLink, 
    Coffee, 
    Wifi, 
    Car, 
    Utensils, 
    Search, 
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    Copy
} from 'lucide-react';

interface HotelPartner {
    id: number;
    name: string;
    city: string;
    rating: number;
    discount: string;
    corporateCode: string;
    image: string;
    address: string;
    facilities: string[];
    description: string;
    contactPerson: string;
    phone: string;
    email: string;
    rateRange: string;
}

export const Partnership: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedRating, setSelectedRating] = useState('all');
    const [selectedHotel, setSelectedHotel] = useState<HotelPartner | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const hotels: HotelPartner[] = [
        {
            id: 1,
            name: 'The Papandayan Hotel Bandung',
            city: 'Bandung',
            rating: 5,
            discount: 'Diskon 25% Pegawai OJK',
            corporateCode: 'OJK-PAPANDAYAN-2026',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            address: 'Jl. Gatot Subroto No.83, Malabar, Lengkong, Kota Bandung, Jawa Barat',
            facilities: ['Sarapan 2 Pax', 'Executive Lounge Access', 'Kolam Renang', 'Fitness Center', 'Free Shuttle Station'],
            description: 'Hotel bintang 5 klasik mewah di pusat kota Bandung dengan fasilitas lengkap dan pelayanan khusus bagi pejabat serta pegawai Otoritas Jasa Keuangan.',
            contactPerson: 'Bpk. Rian Hidayat (Corporate Sales Manager)',
            phone: '+62 812-2345-6789',
            email: 'reservation@thepapandayan.com',
            rateRange: 'Rp 850.000 - Rp 1.450.000 / malam'
        },
        {
            id: 2,
            name: 'Grand Mercure Bandung Setiabudi',
            city: 'Bandung',
            rating: 5,
            discount: 'Diskon 20% + Free Upgrade',
            corporateCode: 'OJK-MERCURE-2026',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            address: 'Jl. Dr. Setiabudi No.269, Isola, Sukasari, Kota Bandung, Jawa Barat',
            facilities: ['Warm Swimming Pool', 'Meeting Room Special Rate', 'Free Upgrade Kamar', 'High Speed Wifi', 'Spa & Wellness'],
            description: 'Akomodasi premium bintang 5 di kawasan sejuk Setiabudi Bandung dengan akses mudah ke tempat pertemuan dan meeting package terintegrasi.',
            contactPerson: 'Ibu Sarah Dewi (Account Executive OJK)',
            phone: '+62 813-9876-5432',
            email: 'sales@grandmercure-bandung.com',
            rateRange: 'Rp 920.000 - Rp 1.650.000 / malam'
        },
        {
            id: 3,
            name: 'Savoy Homann Hotel Bandung',
            city: 'Bandung',
            rating: 4,
            discount: 'Diskon 30% Corporate OJK',
            corporateCode: 'OJK-HOMANN-2026',
            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            address: 'Jl. Asia Afrika No.112, Cikawao, Lengkong, Kota Bandung, Jawa Barat',
            facilities: ['Historic Landmark', 'Free Heritage City Shuttle', 'Buffet Breakfast', 'Meeting Hall', 'Free Valet Parking'],
            description: 'Hotel art-deco bersejarah legendaris di Asia Afrika Bandung, mitra strategis OJK untuk kegiatan dinas, seminar, dan penginapan tamu resmi.',
            contactPerson: 'Bpk. Ahmad Fauzi (Sales Manager)',
            phone: '+62 811-4567-8901',
            email: 'corp@savoyhomannbandung.com',
            rateRange: 'Rp 650.000 - Rp 1.100.000 / malam'
        },
        {
            id: 4,
            name: 'Hilton Bandung',
            city: 'Bandung',
            rating: 5,
            discount: 'Diskon 18% Premium Benefit',
            corporateCode: 'OJK-HILTON-2026',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
            address: 'Jl. HOS Cokroaminoto No.41-43, Pasir Kaliki, Cicendo, Kota Bandung, Jawa Barat',
            facilities: ['Rooftop Pool', 'Executive Lounge', 'Direct Station Shuttle', 'Grand Ballroom', '24h Fitness Center'],
            description: 'Hotel internasional bintang 5 berlokasi strategis dekat Stasiun Bandung dengan ruang pertemuan spektakuler dan kenyamanan kelas dunia.',
            contactPerson: 'Ibu Nania Putri (Corporate Reservation Desk)',
            phone: '+62 812-7788-9900',
            email: 'bandung.info@hilton.com',
            rateRange: 'Rp 1.150.000 - Rp 2.100.000 / malam'
        },
        {
            id: 5,
            name: 'InterContinental Bandung Dago Pakar',
            city: 'Bandung',
            rating: 5,
            discount: 'Diskon 22% Luxury Resort',
            corporateCode: 'OJK-INTERCON-2026',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            address: 'Jalan Resik No.1, Dago Pakar, Cimenyan, Kabupaten Bandung, Jawa Barat',
            facilities: ['Mountain View', 'Golf Course Access', 'Infinity Pool', 'Helipad Access', 'Heated Kids Pool'],
            description: 'Resort mewah bintang 5 di dataran tinggi Dago Pakar dengan pemandangan Bandung yang memukau, ideal untuk gathering dinas OJK dan retreat executive.',
            contactPerson: 'Bpk. Hendra Wijaya (Senior Sales Executive)',
            phone: '+62 813-3344-5566',
            email: 'icbandung.sales@ihg.com',
            rateRange: 'Rp 1.350.000 - Rp 2.500.000 / malam'
        },
        {
            id: 6,
            name: 'Pullman Bandung Grand Central',
            city: 'Bandung',
            rating: 5,
            discount: 'Diskon 25% Special Rate',
            corporateCode: 'OJK-PULLMAN-2026',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            address: 'Jl. Diponegoro No.27, Citarum, Bandung Wetan, Kota Bandung, Jawa Barat',
            facilities: ['Near Gedung Sate', 'Executive Boardroom', 'All Day Dining', 'Spa Center', 'Electric Car Charging Station'],
            description: 'Hotel modern bintang 5 persis di seberang Gedung Sate dengan teknologi rapat tercanggih dan kamar mewah berkonsep kontemporer.',
            contactPerson: 'Ibu Maya Lestari (Key Account Manager)',
            phone: '+62 811-2233-4455',
            email: 'reservation@pullman-bandung.com',
            rateRange: 'Rp 1.200.000 - Rp 2.200.000 / malam'
        }
    ];

    const filteredHotels = hotels.filter(hotel => {
        const matchesQuery = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             hotel.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCity === 'all' || hotel.city.toLowerCase() === selectedCity.toLowerCase();
        const matchesRating = selectedRating === 'all' || hotel.rating === parseInt(selectedRating);
        return matchesQuery && matchesCity && matchesRating;
    });

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Kode promo ${code} berhasil disalin!`);
    };

    return (
        <div className="space-y-8 font-sans">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#A60C25] via-[#C8102E] to-[#900A1F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>
                <div className="relative z-10 space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Corporate Partnership OJK Jawa Barat</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Partnership & Hotel Mitra OJK 🏨
                    </h2>
                    <p className="text-xs sm:text-sm text-red-100 font-normal leading-relaxed">
                        Nikmati fasilitas penginapan resmi dan tarif diskon khusus pegawai Otoritas Jasa Keuangan Regional Jawa Barat di berbagai hotel berbintang mitra terpercaya.
                    </p>
                </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center justify-between border-l-4 border-l-ojk-red">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hotel Mitra Active</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">12 Hotel</span>
                    </div>
                    <Building2 className="w-6 h-6 text-ojk-red" />
                </Card>

                <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diskon Maksimal</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">s.d. 30%</span>
                    </div>
                    <Percent className="w-6 h-6 text-emerald-500" />
                </Card>

                <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kota Jangkauan</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">5 Kota</span>
                    </div>
                    <MapPin className="w-6 h-6 text-blue-500" />
                </Card>

                <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-500">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Benefit Tambahan</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white">Executive Lounge</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-purple-500" />
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className="relative lg:col-span-2">
                        <Input
                            placeholder="Cari nama hotel, lokasi, atau alamat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-xs py-2.5"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>

                    <Select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="text-xs py-2.5"
                    >
                        <option value="all">Semua Kota (Jawa Barat)</option>
                        <option value="bandung">Bandung</option>
                        <option value="bogor">Bogor</option>
                        <option value="cirebon">Cirebon</option>
                        <option value="garut">Garut</option>
                    </Select>

                    <Select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="text-xs py-2.5"
                    >
                        <option value="all">Semua Rating Star</option>
                        <option value="5">⭐⭐⭐⭐⭐ Bintang 5</option>
                        <option value="4">⭐⭐⭐⭐ Bintang 4</option>
                        <option value="3">⭐⭐⭐ Bintang 3</option>
                    </Select>
                </div>
            </Card>

            {/* Hotel Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.length > 0 ? (
                    filteredHotels.map((hotel) => (
                        <Card key={hotel.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            
                            {/* Image Header */}
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img 
                                    src={hotel.image} 
                                    alt={hotel.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

                                {/* Discount Badge Top Left */}
                                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <Percent className="w-3 h-3" />
                                    <span>{hotel.discount}</span>
                                </div>

                                {/* Star Rating Top Right */}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span>{hotel.rating}.0</span>
                                </div>

                                {/* Hotel City Bottom Left */}
                                <div className="absolute bottom-3 left-3 text-white text-[11px] font-bold flex items-center gap-1 drop-shadow-md">
                                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                                    <span>{hotel.city}</span>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-base font-extrabold text-slate-850 dark:text-white leading-snug group-hover:text-ojk-red transition-colors">
                                        {hotel.name}
                                    </h3>
                                    
                                    <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {hotel.address}
                                    </p>

                                    {/* Facilities List */}
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {hotel.facilities.slice(0, 3).map((fac, idx) => (
                                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                                {fac}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range & Corporate Code */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Perkiraan Tarif OJK:</span>
                                        <span className="font-extrabold text-ojk-red text-[11px]">{hotel.rateRange}</span>
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10px]">
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{hotel.corporateCode}</span>
                                        <button 
                                            onClick={() => copyCode(hotel.corporateCode)}
                                            className="text-ojk-red hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                            title="Salin Kode Corporate OJK"
                                        >
                                            <Copy className="w-3 h-3" />
                                            Salin
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Button 
                                            variant="secondary" 
                                            className="w-full text-xs font-bold py-2 rounded-xl"
                                            onClick={() => { setSelectedHotel(hotel); setModalOpen(true); }}
                                        >
                                            Detail & Kontak
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            className="w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                                            onClick={() => window.open(`https://wa.me/${hotel.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(hotel.contactPerson)},%20saya%20pegawai%20OJK%20Regional%20Jawa%20Barat%20ingin%20reservasi%20kamar%20menggunakan%20kode%20${hotel.corporateCode}`, '_blank')}
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            Hubungi / Pesan
                                        </Button>
                                    </div>
                                </div>

                            </div>

                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-400 font-semibold space-y-2">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                        <p>Tidak ada hotel mitra yang sesuai dengan pencarian Anda.</p>
                    </div>
                )}
            </div>

            {/* Hotel Detail Modal */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedHotel(null); }}
                title={selectedHotel?.name || 'Detail Hotel Mitra OJK'}
                size="md"
            >
                {selectedHotel && (
                    <div className="space-y-5 text-xs font-sans">
                        <div className="relative h-44 rounded-2xl overflow-hidden">
                            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs">
                                {selectedHotel.discount}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{selectedHotel.name}</h4>
                            <p className="text-slate-450 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                {selectedHotel.address}
                            </p>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {selectedHotel.description}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <h5 className="font-extrabold text-slate-700 dark:text-slate-200">Fasilitas Khusus Pegawai OJK:</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedHotel.facilities.map((fac, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{fac}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/50 space-y-2">
                            <span className="font-extrabold text-ojk-red uppercase tracking-wider text-[10px] block">Kontak Resepsionis / Corporate Sales OJK Desk:</span>
                            <div className="space-y-1 text-slate-700 dark:text-slate-200 font-semibold">
                                <p><strong>Person in Charge:</strong> {selectedHotel.contactPerson}</p>
                                <p><strong>Telepon / WhatsApp:</strong> {selectedHotel.phone}</p>
                                <p><strong>Email Corporate:</strong> {selectedHotel.email}</p>
                                <p><strong>Kode Diskon:</strong> <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded font-mono text-red-600">{selectedHotel.corporateCode}</code></p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                Tutup
                            </Button>
                            <Button 
                                variant="primary" 
                                className="flex items-center gap-1.5"
                                onClick={() => window.open(`https://wa.me/${selectedHotel.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(selectedHotel.contactPerson)},%20saya%20pegawai%20OJK%20Regional%20Jawa%20Barat%20ingin%20reservasi%20kamar%20menggunakan%20kode%20${selectedHotel.corporateCode}`, '_blank')}
                            >
                                <Phone className="w-4 h-4" />
                                Hubungi via WhatsApp
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

        </div>
    );
};
