# OJK Sistem Manajemen Aset & Reservasi

<p align="center">
  <strong>Sistem Manajemen Aset dan Reservasi Terintegrasi untuk Kantor Otoritas Jasa Keuangan (OJK)</strong>
</p>

---

## 📌 Deskripsi Proyek

**OJK Sistem Manajemen Aset & Reservasi** adalah aplikasi web modern yang dirancang khusus untuk mempermudah pengelolaan aset (seperti ruang rapat, kendaraan operasional, proyektor, dan fasilitas kantor lainnya) serta proses reservasi/peminjaman aset di lingkungan kantor OJK. 

Sistem ini dikembangkan menggunakan arsitektur **Single Page Application (SPA)** dengan integrasi **Laravel** sebagai Backend API dan **React + TypeScript + Tailwind CSS** di bagian Frontend untuk menghadirkan pengalaman pengguna yang cepat, responsif, dan interaktif.

---

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif**: Statistik real-time mengenai status reservasi, peminjaman terpopuler, distribusi kategori aset, serta diagram tren aktivitas peminjaman.
- 🏢 **Manajemen Aset**: Fitur CRUD lengkap untuk aset kantor beserta status ketersediaannya (Tersedia, Digunakan, Pemeliharaan).
- 📅 **Kalender Reservasi (FullCalendar)**: Visualisasi jadwal peminjaman aset secara komprehensif untuk menghindari bentrok jadwal (*double booking*).
- 🔑 **Sistem Persetujuan (Role-based Approval)**: Alur kerja persetujuan reservasi oleh admin atau kepala divisi sebelum aset dapat digunakan.
- 🔍 **Log Audit (Audit Logs)**: Pencatatan otomatis setiap tindakan penting dalam sistem untuk menjaga transparansi dan keamanan data.
- 📱 **Kode QR Terintegrasi**: Pembuatan kode QR otomatis untuk setiap reservasi guna mempermudah check-in/validasi penggunaan aset.
- 📋 **Laporan & Riwayat**: Riwayat peminjaman lengkap yang dapat difilter untuk kebutuhan pelaporan internal divisi.

---

## 🛠️ Tech Stack

### Backend (API)
- **Framework**: Laravel 11
- **Database**: MySQL / PostgreSQL (didukung oleh Eloquent ORM)
- **Autentikasi**: Laravel Sanctum (Token-based API Authentication)
- **Arsitektur**: Repository Pattern & Service Layer untuk memisahkan logika bisnis dengan controller.

### Frontend (Single Page Application)
- **Library**: React 18 & TypeScript
- **Styling**: Tailwind CSS v4.0 (Modern, utility-first CSS framework)
- **State Management & Data Fetching**: TanStack React Query v5
- **Routing**: React Router DOM v6
- **Schedules & Calendars**: FullCalendar React Integration
- **Charts & Visualizations**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Panduan Instalasi & Penggunaan

### Prasyarat (*Prerequisites*)
Pastikan komputer Anda sudah terinstal:
- PHP >= 8.2
- Composer
- Node.js >= 18 & NPM
- Database server (MySQL / MariaDB)

### Langkah-langkah Setup

1. **Clone Repositori**
   ```bash
   git clone https://github.com/daffataufiq7/OJK-Sistem-Manajemen-Aset-Reservasi.git
   cd OJK-Sistem-Manajemen-Aset-Reservasi
   ```

2. **Setup Backend (Laravel)**
   - Instal dependensi PHP:
     ```bash
     composer install
     ```
   - Salin file konfigurasi lingkungan:
     ```bash
     cp .env.example .env
     ```
   - Konfigurasikan database pada file `.env`:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=nama_database_anda
     DB_USERNAME=username_database
     DB_PASSWORD=password_database
     ```
   - Generate application key:
     ```bash
     php artisan key:generate
     ```
   - Jalankan migrasi dan seeder database untuk data awal:
     ```bash
     php artisan migrate --seed
     ```

3. **Setup Frontend (React & Vite)**
   - Instal dependensi JavaScript:
     ```bash
     npm install
     ```

### Menjalankan Server Lokal

Untuk menjalankan aplikasi secara lokal dalam mode pengembangan, jalankan kedua perintah berikut:

- **Jalankan Laravel Backend**:
  ```bash
  php artisan serve
  ```
  *Backend secara default akan berjalan di `http://127.0.0.1:8000`*

- **Jalankan Vite Development Server**:
  ```bash
  npm run dev
  ```
  *Frontend akan berjalan di `http://localhost:5173` (atau port lain yang tersedia)*

---

## 📂 Struktur Folder Utama

```
OJK-Sistem-Manajemen-Aset-Reservasi/
├── app/
│   ├── Http/Controllers/API/   # Controller yang menangani request API frontend
│   ├── Models/                 # Definsi database model
│   ├── Repositories/           # Layer abstraksi database (Repository Pattern)
│   └── Services/               # Layer logika bisnis utama (Service Layer)
├── config/                     # Konfigurasi Laravel
├── database/
│   ├── migrations/             # Struktur skema tabel database
│   └── seeders/                # Pengisian data awal (dummy data)
├── resources/
│   ├── js/
│   │   ├── components/         # Komponen reusable React (UI, Layout, DataTable, dll.)
│   │   ├── context/            # AuthContext untuk manajemen login state
│   │   ├── pages/              # Halaman-halaman aplikasi (Dashboard, Assets, Calendar, dll.)
│   │   ├── types/              # Definisi TypeScript Interfaces
│   │   └── app.tsx             # Entrypoint aplikasi frontend & React Router
│   └── views/
│       └── app.blade.php       # Halaman HTML utama penampung SPA
├── routes/
│   ├── api.php                 # Rute endpoint API
│   └── web.php                 # Rute SPA fallback
└── vite.config.js              # Konfigurasi bundler Vite
```

---

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan internal Otoritas Jasa Keuangan (OJK).
