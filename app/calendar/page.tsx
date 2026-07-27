'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, toast } from '@/components/UI';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-ojk-red" />
                    Kalender Agenda & Ketersediaan Aset
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Pantau pemakaian kendaraan dinas dan ruang rapat secara visual dan terorganisir.
                </p>
            </div>

            <Card className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat jadwal...</div>
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
                        height="auto"
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false
                        }}
                    />
                )}
            </Card>
        </div>
    );
}
