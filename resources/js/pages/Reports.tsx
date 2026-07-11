import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Input, toast, Badge } from '../components/UI';
import { FileBarChart2, Download, Printer, Filter, Calendar, Briefcase, Users, FileText } from 'lucide-react';

interface AssetCategory {
    id: number;
    name: string;
    slug: string;
}

interface Division {
    id: number;
    name: string;
}

interface ReservationReport {
    id: number;
    user_name: string;
    division: string;
    asset_name: string;
    category: string;
    start_date: string;
    end_date: string;
    purpose: string;
    status: string;
}

export const Reports: React.FC = () => {
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [reportData, setReportData] = useState<ReservationReport[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter fields
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryId, setCategoryId] = useState<string>('ALL');
    const [divisionId, setDivisionId] = useState<string>('ALL');
    const [status, setStatus] = useState<string>('ALL');

    const fetchFilters = async () => {
        try {
            const [catResponse, divResponse] = await Promise.all([
                axios.get('/categories'),
                axios.get('/divisions')
            ]);
            setCategories(catResponse.data);
            setDivisions(divResponse.data);
        } catch (error) {
            console.error('Error fetching filters', error);
        }
    };

    useEffect(() => {
        fetchFilters();
        handleFilterSubmit(); // load initial data
    }, []);

    const handleFilterSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (categoryId !== 'ALL') params.category_id = categoryId;
            if (divisionId !== 'ALL') params.division_id = divisionId;
            if (status !== 'ALL') params.status = status;

            const response = await axios.get('/reservations', { params });
            
            // Format response for report display
            const formatted: ReservationReport[] = response.data.map((r: any) => ({
                id: r.id,
                user_name: r.user?.name || '-',
                division: r.user?.division?.name || '-',
                asset_name: r.asset?.name || '-',
                category: r.asset?.category?.name || '-',
                start_date: new Date(r.start_date).toLocaleDateString('id-ID'),
                end_date: new Date(r.end_date).toLocaleDateString('id-ID'),
                purpose: r.purpose,
                status: r.status
            }));
            
            setReportData(formatted);
            toast.success(`Ditemukan ${formatted.length} data laporan.`);
        } catch (error) {
            console.error('Error running report', error);
            toast.error('Gagal memuat data laporan.');
        } finally {
            setLoading(false);
        }
    };

    // Client-side CSV download
    const handleExportCSV = () => {
        if (reportData.length === 0) {
            toast.warning('Tidak ada data untuk diexport.');
            return;
        }

        const headers = ['ID Peminjaman', 'Pegawai', 'Divisi', 'Aset', 'Kategori', 'Tanggal Mulai', 'Tanggal Selesai', 'Keperluan', 'Status'];
        const csvRows = [
            headers.join(','),
            ...reportData.map(r => [
                `#RSV-${r.id}`,
                `"${r.user_name.replace(/"/g, '""')}"`,
                `"${r.division.replace(/"/g, '""')}"`,
                `"${r.asset_name.replace(/"/g, '""')}"`,
                `"${r.category.replace(/"/g, '""')}"`,
                `"${r.start_date}"`,
                `"${r.end_date}"`,
                `"${r.purpose.replace(/"/g, '""')}"`,
                `"${r.status.toUpperCase()}"`
            ].join(','))
        ];

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `laporan_peminjaman_ojk_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Printing optimized report view
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 font-sans print:p-0">
            
            {/* Header Title (hide on print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <FileBarChart2 className="w-6.5 h-6.5 text-ojk-red" />
                        Laporan & Analisis Statistik Aset
                    </h2>
                    <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                        Gunakan filter untuk menyaring log data reservasi, dan lakukan export ke CSV, Excel, atau PDF.
                    </p>
                </div>
            </div>

            {/* Filter Panel (hide on print) */}
            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle className="text-xs flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Pencarian Terpadu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Input 
                            label="Tanggal Mulai" 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input 
                            label="Tanggal Selesai" 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <Select 
                            label="Kategori Aset"
                            options={[{ value: 'ALL', label: 'Semua Kategori' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        />
                        <Select 
                            label="Divisi Pegawai"
                            options={[{ value: 'ALL', label: 'Semua Divisi' }, ...divisions.map(d => ({ value: d.id, label: d.name }))]}
                            value={divisionId}
                            onChange={(e) => setDivisionId(e.target.value)}
                        />
                        <Select 
                            label="Status Reservasi"
                            options={[
                                { value: 'ALL', label: 'Semua Status' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Reserved' },
                                { value: 'in_use', label: 'In Use' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'cancelled', label: 'Cancelled' }
                            ]}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />

                        <div className="sm:col-span-2 lg:col-span-5 flex justify-end gap-3 pt-2">
                            <Button variant="outline" size="sm" type="button" onClick={handleExportCSV} className="text-xs flex items-center gap-1.5 rounded-xl">
                                <Download className="w-3.5 h-3.5" /> Export Excel/CSV
                            </Button>
                            <Button variant="outline" size="sm" type="button" onClick={handlePrint} className="text-xs flex items-center gap-1.5 rounded-xl">
                                <Printer className="w-3.5 h-3.5" /> Cetak PDF
                            </Button>
                            <Button variant="primary" size="sm" type="submit" disabled={loading} className="text-xs font-bold px-6 py-2 rounded-xl">
                                {loading ? 'Memproses...' : 'Terapkan Filter'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Print Header Logo (only on print) */}
            <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-350 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-extrabold text-white text-xl">OJK</div>
                    <div className="flex flex-col text-left">
                        <span className="font-extrabold text-sm text-slate-800 leading-snug">OTORITAS JASA KEUANGAN</span>
                        <span className="font-bold text-[10px] text-slate-500">KANTOR REGIONAL JAWA BARAT</span>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-sm">LAPORAN PEMINJAMAN ASET</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Report Table Card */}
            <Card className="overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-xs">
                <CardHeader className="print:hidden">
                    <CardTitle className="text-sm">Tabel Hasil Penyaringan Laporan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">ID RSV</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Peminjam</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Divisi</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Aset</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Kategori</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Waktu</th>
                                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {reportData.length > 0 ? (
                                    reportData.map((row, i) => (
                                        <tr key={i} className="text-slate-700 dark:text-slate-350 text-xs font-semibold">
                                            <td className="px-6 py-4 font-bold text-slate-450">#RSV-{row.id}</td>
                                            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-bold">{row.user_name}</td>
                                            <td className="px-6 py-4">{row.division}</td>
                                            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-bold">{row.asset_name}</td>
                                            <td className="px-6 py-4 text-slate-400">{row.category}</td>
                                            <td className="px-6 py-4">{row.start_date} - {row.end_date}</td>
                                            <td className="px-6 py-4">
                                                <Badge status={row.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-semibold">
                                            Tidak ada data laporan yang cocok dengan penyaringan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};
