<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Division;
use App\Models\AssetCategory;
use App\Models\Asset;
use App\Models\Reservation;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Divisions
        $div1 = Division::create(['name' => 'Divisi Pengawasan']);
        $div2 = Division::create(['name' => 'Divisi Edukasi dan Perlindungan Konsumen']);
        $div3 = Division::create(['name' => 'Divisi Perbankan']);
        $div4 = Division::create(['name' => 'Divisi Hukum']);
        $div5 = Division::create(['name' => 'Divisi Bidang Umum']);

        // 2. Seed Users (Super Admin, Validator, and Pegawai)
        $admin = User::create([
            'name' => 'Budi Santoso',
            'nip' => '10001',
            'email' => 'admin@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'division_id' => $div5->id,
        ]);

        $validator = User::create([
            'name' => 'Hendra Wijaya',
            'nip' => '20001',
            'email' => 'validator@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'validator',
            'division_id' => $div5->id,
        ]);

        $pegawai1 = User::create([
            'name' => 'Andi Wijaya',
            'nip' => '30001',
            'email' => 'pegawai1@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'pegawai',
            'division_id' => $div1->id,
        ]);

        $pegawai2 = User::create([
            'name' => 'Siti Rahma',
            'nip' => '30002',
            'email' => 'pegawai2@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'pegawai',
            'division_id' => $div2->id,
        ]);

        $pegawai3 = User::create([
            'name' => 'Rudi Hermawan',
            'nip' => '30003',
            'email' => 'pegawai3@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'pegawai',
            'division_id' => $div3->id,
        ]);

        // 3. Seed Asset Categories
        $catVehicle = AssetCategory::create(['name' => 'Kendaraan', 'slug' => 'kendaraan']);
        $catRoom = AssetCategory::create(['name' => 'Ruangan', 'slug' => 'ruangan']);
        $catElec = AssetCategory::create(['name' => 'Elektronik', 'slug' => 'elektronik']);
        $catInv = AssetCategory::create(['name' => 'Inventaris', 'slug' => 'inventaris']);

        // 4. Seed Assets
        $asset1 = Asset::create([
            'code' => 'AST-KND-001',
            'name' => 'Toyota Innova B 1234 OJK',
            'category_id' => $catVehicle->id,
            'location' => 'Gedung A Parkir Lt. 1',
            'status' => 'in_use',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-KND-001|Toyota Innova B 1234 OJK|OJK Jawa Barat',
            'maintenance_schedule' => Carbon::now()->addDays(5),
        ]);

        $asset2 = Asset::create([
            'code' => 'AST-KND-002',
            'name' => 'Toyota Avanza B 5678 OJK',
            'category_id' => $catVehicle->id,
            'location' => 'Gedung A Parkir Lt. 1',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-KND-002|Toyota Avanza B 5678 OJK|OJK Jawa Barat',
            'maintenance_schedule' => Carbon::now()->addDays(12),
        ]);

        $asset3 = Asset::create([
            'code' => 'AST-RNG-001',
            'name' => 'Ruang Rapat A',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 2',
            'status' => 'in_use',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-001|Ruang Rapat A|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $asset4 = Asset::create([
            'code' => 'AST-RNG-002',
            'name' => 'Ruang Rapat B',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 2',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-002|Ruang Rapat B|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $asset5 = Asset::create([
            'code' => 'AST-ELC-001',
            'name' => 'Laptop Dell Latitude 5420',
            'category_id' => $catElec->id,
            'location' => 'Gudang IT Lt. 3',
            'status' => 'reserved',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-ELC-001|Laptop Dell Latitude 5420|OJK Jawa Barat',
            'maintenance_schedule' => Carbon::now()->addDays(2),
        ]);

        $asset6 = Asset::create([
            'code' => 'AST-ELC-002',
            'name' => 'Proyektor Epson X500',
            'category_id' => $catElec->id,
            'location' => 'Gudang IT Lt. 3',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-ELC-002|Proyektor Epson X500|OJK Jawa Barat',
            'maintenance_schedule' => Carbon::now()->subDays(1), // Underwent yesterday
        ]);

        $asset7 = Asset::create([
            'code' => 'AST-INV-001',
            'name' => 'Sound System Portable',
            'category_id' => $catInv->id,
            'location' => 'Gudang Umum Lt. 1',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-INV-001|Sound System Portable|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $asset8 = Asset::create([
            'code' => 'AST-INV-002',
            'name' => 'Whiteboard Standing',
            'category_id' => $catInv->id,
            'location' => 'Gudang Umum Lt. 1',
            'status' => 'maintenance',
            'condition' => 'fair',
            'photo' => null,
            'qr_code' => 'AST-INV-002|Whiteboard Standing|OJK Jawa Barat',
            'maintenance_schedule' => Carbon::now()->addDays(1),
        ]);

        // 5. Seed Reservations
        // Booking 1: Innova In Use by Andi (today)
        Reservation::create([
            'user_id' => $pegawai1->id,
            'asset_id' => $asset1->id,
            'start_date' => Carbon::today()->setHour(8)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Kunjungan Kerja Tim Pengawasan ke OJK Pusat Jakarta',
            'destination' => 'Kantor Pusat OJK Jakarta',
            'driver_required' => true,
            'driver_name' => 'Supriyadi',
            'status' => 'in_use',
        ]);

        // Booking 2: Ruang Rapat A In Use by Siti (today)
        Reservation::create([
            'user_id' => $pegawai2->id,
            'asset_id' => $asset3->id,
            'start_date' => Carbon::today()->setHour(9)->setMinute(0),
            'end_date' => Carbon::today()->setHour(11)->setMinute(0),
            'purpose' => 'Rapat Koordinasi Edukasi Keuangan Daerah',
            'status' => 'in_use',
        ]);

        // Booking 3: Dell Laptop Approved (Reserved) by Rudi (today afternoon)
        Reservation::create([
            'user_id' => $pegawai3->id,
            'asset_id' => $asset5->id,
            'start_date' => Carbon::today()->setHour(13)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Pemeriksaan Lapangan dan Remote Kerja Audit',
            'status' => 'approved',
        ]);

        // Booking 4: Ruang Rapat B Pending by Andi (today afternoon)
        Reservation::create([
            'user_id' => $pegawai1->id,
            'asset_id' => $asset4->id,
            'start_date' => Carbon::today()->setHour(15)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Video Conference Sosialisasi Kebijakan Baru',
            'status' => 'pending',
        ]);

        // Booking 5: Proyektor Epson Completed by Siti (yesterday)
        Reservation::create([
            'user_id' => $pegawai2->id,
            'asset_id' => $asset6->id,
            'start_date' => Carbon::yesterday()->setHour(7)->setMinute(0),
            'end_date' => Carbon::yesterday()->setHour(16)->setMinute(0),
            'purpose' => 'Sosialisasi Literasi Keuangan ke UMKM',
            'status' => 'completed',
        ]);

        // Booking 6: Toyota Avanza Rejected by Rudi (yesterday)
        Reservation::create([
            'user_id' => $pegawai3->id,
            'asset_id' => $asset2->id,
            'start_date' => Carbon::yesterday()->setHour(9)->setMinute(0),
            'end_date' => Carbon::yesterday()->setHour(12)->setMinute(0),
            'purpose' => 'Kunjungan Monitoring ke Tasikmalaya',
            'status' => 'rejected',
            'rejection_reason' => 'Unit Avanza sedang masuk jadwal service berkala di bengkel resmi.',
        ]);

        // 6. Seed Notifications
        Notification::create([
            'user_id' => $pegawai1->id,
            'title' => 'Pengajuan Ruang Rapat B Dikirim',
            'message' => 'Pengajuan reservasi Anda untuk Ruang Rapat B (15.00 - 17.00) telah dikirim ke Validator.',
            'type' => 'approval',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $pegawai1->id,
            'title' => 'Pengajuan Toyota Innova Disetujui',
            'message' => 'Reservasi Toyota Innova B 1234 OJK untuk hari ini telah disetujui oleh Hendra Wijaya.',
            'type' => 'approval',
            'is_read' => true,
        ]);

        Notification::create([
            'user_id' => $pegawai3->id,
            'title' => 'Pengajuan Toyota Avanza Ditolak',
            'message' => 'Reservasi Toyota Avanza B 5678 OJK ditolak. Alasan: Unit Avanza sedang masuk jadwal service berkala.',
            'type' => 'reject',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $validator->id,
            'title' => 'Pengajuan Reservasi Baru',
            'message' => 'Andi Wijaya mengajukan reservasi Ruang Rapat B untuk hari ini pukul 15.00 WIB.',
            'type' => 'approval',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $admin->id,
            'title' => 'Aset Memasuki Jadwal Perawatan',
            'message' => 'Whiteboard Standing (AST-INV-002) dijadwalkan untuk maintenance besok.',
            'type' => 'maintenance',
            'is_read' => false,
        ]);

        // 7. Seed Audit Logs
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'create_asset',
            'description' => 'Menambahkan aset baru: Toyota Innova B 1234 OJK (AST-KND-001)',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'create_asset',
            'description' => 'Menambahkan aset baru: Ruang Rapat A (AST-RNG-001)',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $validator->id,
            'action' => 'approve_reservation',
            'description' => 'Menyetujui reservasi Toyota Innova B 1234 OJK oleh Andi Wijaya',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $validator->id,
            'action' => 'reject_reservation',
            'description' => 'Menolak reservasi Toyota Avanza B 5678 OJK oleh Rudi Hermawan',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $pegawai1->id,
            'action' => 'login',
            'description' => 'Pegawai Andi Wijaya berhasil melakukan login sistem.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);
    }
}
