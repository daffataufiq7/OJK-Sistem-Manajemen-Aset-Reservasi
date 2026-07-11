import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import { Card, CardContent, Dialog, Badge, Button, toast } from '../components/UI';
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText, Info } from 'lucide-react';

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
        notes: string | null;
    };
}

export const CalendarView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/calendar/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching calendar events', error);
            toast.error('Gagal mengambil data jadwal kalender.');
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <svg className="animate-spin h-8 w-8 text-ojk-red" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-500 font-semibold">Memuat kalender reservasi...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    Kalender Jadwal Reservasi
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Pantau agenda penggunaan aset kantor secara realtime. Klik event untuk info detail.
                </p>
            </div>

            {/* Legend indicators */}
            <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-5 py-3 rounded-2xl shadow-xs text-[10px] font-extrabold text-slate-500">
                <span className="text-slate-400 mr-2">LEGENDA STATUS:</span>
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

            {/* Calendar Card */}
            <Card className="p-6">
                <CardContent className="p-0">
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
                        locale={idLocale}
                        height="auto"
                        dayMaxEvents={true}
                        editable={false}
                        selectable={false}
                    />
                </CardContent>
            </Card>

            {/* Event Detail Dialog Popover */}
            <Dialog
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Informasi Reservasi Aset"
                size="md"
            >
                {selectedEvent && (
                    <div className="space-y-5">
                        
                        {/* Title Asset Info */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center gap-3">
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {selectedEvent.extendedProps.asset_name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                    {selectedEvent.extendedProps.asset_code} &bull; {selectedEvent.extendedProps.category}
                                </span>
                            </div>
                            <Badge status={selectedEvent.extendedProps.status} className="scale-90 shrink-0" />
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
                            
                            <div className="flex items-start gap-2.5">
                                <User className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Peminjam</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedEvent.extendedProps.applicant}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold">{selectedEvent.extendedProps.division}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CalendarIcon className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Waktu Mulai</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-bold">
                                        {new Date(selectedEvent.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">
                                        {new Date(selectedEvent.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Waktu Selesai</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-bold">
                                        {new Date(selectedEvent.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">
                                        {new Date(selectedEvent.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 sm:col-span-2">
                                <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">Keperluan / Agenda</span>
                                    <p className="text-slate-850 dark:text-slate-350 leading-relaxed font-semibold">
                                        {selectedEvent.extendedProps.purpose}
                                    </p>
                                </div>
                            </div>

                            {selectedEvent.extendedProps.notes && (
                                <div className="flex items-start gap-2.5 sm:col-span-2">
                                    <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-medium">Catatan Tambahan</span>
                                        <p className="text-slate-550 dark:text-slate-400 font-semibold">{selectedEvent.extendedProps.notes}</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                            <Button variant="primary" onClick={() => setModalOpen(false)} className="px-5 py-2">
                                Tutup
                            </Button>
                        </div>

                    </div>
                )}
            </Dialog>

        </div>
    );
};
