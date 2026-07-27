import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SIMA-R OJK | Sistem Manajemen Aset & Reservasi OJK Jawa Barat',
  description: 'Portal Layanan Digital Internal Manajemen Aset & Reservasi Kantor OJK Regional Jawa Barat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#F4F6F9] dark:bg-[#090D16] text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
