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
        $div6 = Division::create(['name' => 'Kepala OJK']);

        // 2. Seed Users (Super Admin, Validator, and Pegawai)
        $admin = User::create([
            'name' => 'Daffa Taufiq',
            'nip' => '10001',
            'email' => 'admin@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'division_id' => $div5->id,
        ]);

        $validator = User::create([
            'name' => 'Angga Baihaki',
            'nip' => '20001',
            'email' => 'validator@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'validator',
            'division_id' => $div5->id,
        ]);

        $pegawai1 = User::create([
            'name' => 'Ratu Khansa',
            'nip' => '30001',
            'email' => 'pegawai1@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'pegawai',
            'division_id' => $div1->id,
        ]);

        $pegawai2 = User::create([
            'name' => 'Bunga Nazwa',
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

        $kepala = User::create([
            'name' => 'Naufal Hanif Ramadhan D.',
            'nip' => '2028',
            'email' => 'kepalaojk@ojk.go.id',
            'password' => Hash::make('password'),
            'role' => 'validator',
            'division_id' => $div6->id,
        ]);

        // 3. Seed Asset Categories (Only Kendaraan and Ruangan)
        $catVehicle = AssetCategory::create(['name' => 'Kendaraan', 'slug' => 'kendaraan']);
        $catRoom = AssetCategory::create(['name' => 'Ruangan', 'slug' => 'ruangan']);

        // 4. Seed Vehicles (15 Official Units)
        $vehiclesData = [
            ['code' => 'AST-KND-001', 'name' => 'Toyota Fortuner D 1882 E', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-002', 'name' => 'Toyota Alphard B 1707 NZU', 'location' => 'Basement Lt. 1 / VIP', 'status' => 'available'],
            ['code' => 'AST-KND-003', 'name' => 'Toyota Kijang Innova D 1872 E', 'location' => 'Basement Lt. 1', 'status' => 'in_use'],
            ['code' => 'AST-KND-004', 'name' => 'Toyota Kijang Innova D 1870 E', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-005', 'name' => 'Toyota Kijang Innova D 1869 E', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-006', 'name' => 'Toyota Hilux D 8069 D', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-007', 'name' => 'Nissan X Trail D 1868 E', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-008', 'name' => 'Toyota Camry 2.5 HV D 13', 'location' => 'Basement Lt. 1 / Pimpinan', 'status' => 'available'],
            ['code' => 'AST-KND-009', 'name' => 'Toyota Zenix 2.0 Q HV D 1041 C', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-010', 'name' => 'Toyota Zenix 2.0 G CVT D 1162 F', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-011', 'name' => 'Toyota Zenix 2.0 G CVT D 1056 F', 'location' => 'Basement Lt. 1', 'status' => 'available'],
            ['code' => 'AST-KND-012', 'name' => 'Isuzu Traga Box B 9455 PQW', 'location' => 'Parkiran Logistik', 'status' => 'available'],
            ['code' => 'AST-KND-013', 'name' => 'Isuzu Traga Box B 9545 PQW', 'location' => 'Parkiran Logistik', 'status' => 'available'],
            ['code' => 'AST-KND-014', 'name' => 'Isuzu Traga Box B 9543 PQW', 'location' => 'Parkiran Logistik', 'status' => 'available'],
            ['code' => 'AST-KND-015', 'name' => 'Honda CB 150 R D 3044 F', 'location' => 'Parkiran Motor', 'status' => 'available'],
        ];

        $vehicleAssets = [];
        foreach ($vehiclesData as $v) {
            $vehicleAssets[$v['code']] = Asset::create([
                'code' => $v['code'],
                'name' => $v['name'],
                'category_id' => $catVehicle->id,
                'location' => $v['location'],
                'status' => $v['status'],
                'condition' => 'good',
                'photo' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300&auto=format&fit=crop',
                'qr_code' => "{$v['code']}|{$v['name']}|OJK Jawa Barat",
                'maintenance_schedule' => Carbon::now()->addDays(rand(10, 30)),
            ]);
        }

        // 5. Seed Rooms
        $room1 = Asset::create([
            'code' => 'AST-RNG-001',
            'name' => 'Ruang Rapat Bale Astama',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 2',
            'status' => 'in_use',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-001|Ruang Rapat Bale Astama|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $room2 = Asset::create([
            'code' => 'AST-RNG-002',
            'name' => 'Ruang Rapat Nakula',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 3',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-002|Ruang Rapat Nakula|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $room3 = Asset::create([
            'code' => 'AST-RNG-003',
            'name' => 'Aula Catur Dharma',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 1',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-003|Aula Catur Dharma|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        $room4 = Asset::create([
            'code' => 'AST-RNG-004',
            'name' => 'Ruang Rapat Sadewa',
            'category_id' => $catRoom->id,
            'location' => 'Gedung Utama Lt. 2',
            'status' => 'available',
            'condition' => 'good',
            'photo' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=300&auto=format&fit=crop',
            'qr_code' => 'AST-RNG-004|Ruang Rapat Sadewa|OJK Jawa Barat',
            'maintenance_schedule' => null,
        ]);

        // 6. Seed Reservations
        // Booking 1: Toyota Kijang Innova D 1872 E In Use by Ratu (today)
        Reservation::create([
            'user_id' => $pegawai1->id,
            'asset_id' => $vehicleAssets['AST-KND-003']->id,
            'start_date' => Carbon::today()->setHour(8)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Kunjungan Kerja Tim Pengawasan ke OJK Pusat Jakarta',
            'destination' => 'Kantor Pusat OJK Jakarta',
            'driver_required' => true,
            'driver_name' => 'Supriyadi',
            'status' => 'in_use',
        ]);

        // Booking 2: Ruang Rapat Bale Astama In Use by Bunga (today)
        Reservation::create([
            'user_id' => $pegawai2->id,
            'asset_id' => $room1->id,
            'start_date' => Carbon::today()->setHour(9)->setMinute(0),
            'end_date' => Carbon::today()->setHour(11)->setMinute(0),
            'purpose' => 'Rapat Koordinasi Edukasi Keuangan Daerah',
            'status' => 'in_use',
        ]);

        // Booking 3: Toyota Alphard B 1707 NZU Approved (Reserved) by Rudi (today afternoon)
        Reservation::create([
            'user_id' => $pegawai3->id,
            'asset_id' => $vehicleAssets['AST-KND-002']->id,
            'start_date' => Carbon::today()->setHour(13)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Penjemputan Tamu Pimpinan OJK Pusat',
            'destination' => 'Bandara Kertajati / Stasiun Tegalluar',
            'driver_required' => true,
            'driver_name' => 'Ahmad Suhendar',
            'status' => 'approved',
        ]);

        // Booking 4: Ruang Rapat Nakula Pending by Ratu (today afternoon)
        Reservation::create([
            'user_id' => $pegawai1->id,
            'asset_id' => $room2->id,
            'start_date' => Carbon::today()->setHour(15)->setMinute(0),
            'end_date' => Carbon::today()->setHour(17)->setMinute(0),
            'purpose' => 'Video Conference Sosialisasi Kebijakan Baru',
            'status' => 'pending',
        ]);

        // Booking 5: Toyota Fortuner D 1882 E Completed by Bunga (yesterday)
        Reservation::create([
            'user_id' => $pegawai2->id,
            'asset_id' => $vehicleAssets['AST-KND-001']->id,
            'start_date' => Carbon::yesterday()->setHour(7)->setMinute(0),
            'end_date' => Carbon::yesterday()->setHour(16)->setMinute(0),
            'purpose' => 'Sosialisasi Literasi Keuangan ke UMKM',
            'destination' => 'Kantor Bupati Cirebon',
            'driver_required' => true,
            'driver_name' => 'Deden',
            'status' => 'completed',
        ]);

        // Booking 6: Nissan X Trail D 1868 E Rejected by Rudi (yesterday)
        Reservation::create([
            'user_id' => $pegawai3->id,
            'asset_id' => $vehicleAssets['AST-KND-007']->id,
            'start_date' => Carbon::yesterday()->setHour(9)->setMinute(0),
            'end_date' => Carbon::yesterday()->setHour(12)->setMinute(0),
            'purpose' => 'Kunjungan Monitoring ke Tasikmalaya',
            'status' => 'rejected',
            'rejection_reason' => 'Unit Nissan X Trail sedang masuk jadwal service berkala di bengkel resmi.',
        ]);

        // 7. Seed Notifications
        Notification::create([
            'user_id' => $pegawai1->id,
            'title' => 'Pengajuan Ruang Rapat Nakula Dikirim',
            'message' => 'Pengajuan reservasi Anda untuk Ruang Rapat Nakula (15.00 - 17.00) telah dikirim ke Validator.',
            'type' => 'approval',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $pegawai1->id,
            'title' => 'Pengajuan Toyota Kijang Innova Disetujui',
            'message' => 'Reservasi Toyota Kijang Innova D 1872 E untuk hari ini telah disetujui oleh Angga Baihaki.',
            'type' => 'approval',
            'is_read' => true,
        ]);

        Notification::create([
            'user_id' => $pegawai3->id,
            'title' => 'Pengajuan Nissan X Trail Ditolak',
            'message' => 'Reservasi Nissan X Trail D 1868 E ditolak. Alasan: Unit sedang masuk jadwal service berkala.',
            'type' => 'reject',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $validator->id,
            'title' => 'Pengajuan Reservasi Baru',
            'message' => 'Ratu Khansa mengajukan reservasi Ruang Rapat Nakula untuk hari ini pukul 15.00 WIB.',
            'type' => 'approval',
            'is_read' => false,
        ]);

        // 8. Seed Audit Logs
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'create_asset',
            'description' => 'Menambahkan aset baru: Toyota Fortuner D 1882 E (AST-KND-001)',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'create_asset',
            'description' => 'Menambahkan aset baru: Ruang Rapat Bale Astama (AST-RNG-001)',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $validator->id,
            'action' => 'approve_reservation',
            'description' => 'Menyetujui reservasi Toyota Kijang Innova D 1872 E oleh Ratu Khansa',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $validator->id,
            'action' => 'reject_reservation',
            'description' => 'Menolak reservasi Nissan X Trail D 1868 E oleh Rudi Hermawan',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);

        AuditLog::create([
            'user_id' => $pegawai1->id,
            'action' => 'login',
            'description' => 'Pegawai Ratu Khansa berhasil melakukan login sistem.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);
    }
}
