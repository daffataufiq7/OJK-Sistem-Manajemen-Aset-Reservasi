'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, Dialog, Badge, Button, toast } from '@/components/UI';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    User, 
    FileText, 
    Info, 
    PlusCircle,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface EventDetail {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
        asset_name: string;
        asset_code: string;
        category: string;
        applicant: string;
        division: string;
        purpose: string;
        status: string;
        driver_name?: string | null;
        location?: string;
    };
}

export default function CalendarPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/calendar/events');
            if (res.ok) {
                setEvents(await res.json());
            }
        } catch (error) {
            console.error('Calendar events fetch error', error);
            toast.error('Gagal memuat jadwal kalender.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEventClick = (info: any) => {
        const event = info.event;
        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            extendedProps: event.extendedProps as any
        });
        setModalOpen(true);
    };

    return (
        <div className="p-6 md:p-8 space-y-6 font-sans pb-12">
            
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-ojk-red">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        Kalender Agenda & Reservasi Aset
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold pl-0.5">
                        {user?.role === 'pegawai' 
                            ? 'Pantau jadwal reservasi milik Anda secara visual dan terorganisir.'
                            : 'Pantau seluruh penggunaan kendaraan dinas & ruang rapat kantor OJK Jawa Barat.'}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchEvents}
                        className="rounded-xl flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button 
                        onClick={() => router.push('/reservations')} 
                        className="bg-ojk-red text-white hover:bg-red-700 flex items-center gap-2 rounded-xl text-xs py-2.5 px-4 font-bold shadow-xs"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Buat Reservasi Baru
                    </Button>
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-xs text-[11px] font-bold text-slate-500">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">LEGENDA STATUS:</span>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span>
                    <span>Menunggu (Pending)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                    <span>Disetujui / Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                    <span>Sedang Dipakai (In Use)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                    <span>Selesai (Completed)</span>
                </div>
            </div>

            {/* Empty State Banner when no reservations exist for user */}
            {!loading && events.length === 0 && (
                <div className="p-6 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="p-3 rounded-2xl bg-amber-500/15 shrink-0 mx-auto sm:mx-0">
                            <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Belum Ada Agenda Reservasi</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                {user?.role === 'pegawai' 
                                    ? 'Kalender reservasi Anda saat ini masih kosong. Silakan ajukan permohonan baru untuk meminjam kendaraan atau ruang rapat.'
                                    : 'Belum ada data reservasi aktif pada kalender sistem.'}
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => router.push('/reservations')}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs px-4 py-2 font-bold shrink-0 shadow-2xs"
                    >
                        + Ajukan Reservasi
                    </Button>
                </div>
            )}

            {/* Calendar Container */}
            <Card className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-ojk-red" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Memuat kalender reservasi...
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        dayMaxEvents={true}
                        editable={false}
                        selectable={false}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false
                        }}
                    />
                )}
            </Card>

            {/* Event Detail Dialog */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Informasi Detail Reservasi"
                size="md"
            >
                {selectedEvent && (
                    <div className="space-y-4 font-sans text-xs">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex justify-between items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    {selectedEvent.extendedProps.asset_name}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400 font-mono mt-0.5">
                                    {selectedEvent.extendedProps.asset_code} &bull; {selectedEvent.extendedProps.category}
                                </span>
                            </div>
                            <Badge status={selectedEvent.extendedProps.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waktu Mulai</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                    {new Date(selectedEvent.start).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                                </span>
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waktu Selesai</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                    {new Date(selectedEvent.end).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-semibold">Pemohon (Pegawai):</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.extendedProps.applicant}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/60 pt-2">
                                <span className="text-slate-400 font-semibold">Divisi / Satker:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEvent.extendedProps.division}</span>
                            </div>
                            {selectedEvent.extendedProps.driver_name && (
                                <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/60 pt-2">
                                    <span className="text-slate-400 font-semibold">Pengemudi / Driver:</span>
                                    <span className="font-bold text-ojk-red">{selectedEvent.extendedProps.driver_name}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200/50 dark:border-slate-700/60 pt-2 space-y-0.5">
                                <span className="text-slate-400 font-semibold block">Keperluan / Goal:</span>
                                <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                                    {selectedEvent.extendedProps.purpose}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setModalOpen(false)} className="rounded-xl">
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
