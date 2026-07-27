'use client';

import React from 'react';
import { Card } from '@/components/UI';
import { Building2, Sparkles } from 'lucide-react';

export default function PartnershipPage() {
    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="space-y-1">
                <h2 className="text-xl xl:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-amber-500" />
                    Partnership & Kolaborasi Instansi
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-450 font-semibold">
                    Portal kerjasama dan pengolahan aset bersama antar instansi pemerintah dan mitra strategis.
                </p>
            </div>

            <Card className="p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Fitur Modul Partnership OJK</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Modul ini memfasilitasi pinjam pakai sarana dan prasarana antar instansi sektor jasa keuangan Jawa Barat secara terintegrasi.
                </p>
            </Card>
        </div>
    );
}
