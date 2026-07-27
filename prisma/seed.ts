import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Next.js Prisma Database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.division.deleteMany();

  // 1. Seed Divisions
  const div1 = await prisma.division.create({ data: { name: 'Divisi Pengawasan' } });
  const div2 = await prisma.division.create({ data: { name: 'Divisi Edukasi dan Perlindungan Konsumen' } });
  const div3 = await prisma.division.create({ data: { name: 'Divisi Perbankan' } });
  const div4 = await prisma.division.create({ data: { name: 'Divisi Hukum' } });
  const div5 = await prisma.division.create({ data: { name: 'Divisi Bidang Umum' } });
  const div6 = await prisma.division.create({ data: { name: 'Kepala OJK' } });

  // 2. Seed Users
  const hashedPassword = await bcrypt.hash('password', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Daffa Taufiq',
      nip: '10001',
      email: 'admin@ojk.go.id',
      password: hashedPassword,
      role: 'super_admin',
      divisionId: div5.id,
    },
  });

  const validator = await prisma.user.create({
    data: {
      name: 'Angga Baihaki',
      nip: '20001',
      email: 'validator@ojk.go.id',
      password: hashedPassword,
      role: 'validator',
      divisionId: div5.id,
    },
  });

  const pegawai1 = await prisma.user.create({
    data: {
      name: 'Ratu Khansa',
      nip: '30001',
      email: 'pegawai1@ojk.go.id',
      password: hashedPassword,
      role: 'pegawai',
      divisionId: div1.id,
    },
  });

  const pegawai2 = await prisma.user.create({
    data: {
      name: 'Bunga Nazwa',
      nip: '30002',
      email: 'pegawai2@ojk.go.id',
      password: hashedPassword,
      role: 'pegawai',
      divisionId: div2.id,
    },
  });

  const pegawai3 = await prisma.user.create({
    data: {
      name: 'Rudi Hermawan',
      nip: '30003',
      email: 'pegawai3@ojk.go.id',
      password: hashedPassword,
      role: 'pegawai',
      divisionId: div3.id,
    },
  });

  const kepala = await prisma.user.create({
    data: {
      name: 'Naufal Hanif Ramadhan D.',
      nip: '2028',
      email: 'kepalaojk@ojk.go.id',
      password: hashedPassword,
      role: 'validator',
      divisionId: div6.id,
    },
  });

  // 3. Asset Categories
  const catVehicle = await prisma.assetCategory.create({ data: { name: 'Kendaraan', slug: 'kendaraan' } });
  const catRoom = await prisma.assetCategory.create({ data: { name: 'Ruangan', slug: 'ruangan' } });

  // 4. Vehicles
  const vehiclesData = [
    { code: 'AST-KND-001', name: 'Toyota Fortuner D 1882 E', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-002', name: 'Toyota Alphard B 1707 NZU', location: 'Basement Lt. 1 / VIP', status: 'available', photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-003', name: 'Toyota Kijang Innova D 1872 E', location: 'Basement Lt. 1', status: 'in_use', photo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-004', name: 'Toyota Kijang Innova D 1870 E', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-005', name: 'Toyota Kijang Innova D 1869 E', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-006', name: 'Toyota Hilux D 8069 D', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-007', name: 'Nissan X Trail D 1868 E', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-008', name: 'Toyota Camry 2.5 HV D 13', location: 'Basement Lt. 1 / Pimpinan', status: 'available', photo: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-009', name: 'Toyota Zenix 2.0 Q HV D 1041 C', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-010', name: 'Toyota Zenix 2.0 G CVT D 1162 F', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-011', name: 'Toyota Zenix 2.0 G CVT D 1056 F', location: 'Basement Lt. 1', status: 'available', photo: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-012', name: 'Isuzu Traga Box B 9455 PQW', location: 'Parkiran Logistik', status: 'available', photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-013', name: 'Isuzu Traga Box B 9545 PQW', location: 'Parkiran Logistik', status: 'available', photo: 'https://images.unsplash.com/photo-1586191582056-a36c64639d6b?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-014', name: 'Isuzu Traga Box B 9543 PQW', location: 'Parkiran Logistik', status: 'available', photo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80' },
    { code: 'AST-KND-015', name: 'Honda CB 150 R D 3044 F', location: 'Parkiran Motor', status: 'available', photo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
  ];

  const vehicleAssets: Record<string, any> = {};
  for (const v of vehiclesData) {
    vehicleAssets[v.code] = await prisma.asset.create({
      data: {
        code: v.code,
        name: v.name,
        categoryId: catVehicle.id,
        location: v.location,
        status: v.status,
        condition: 'good',
        photo: v.photo,
        qrCode: `${v.code}|${v.name}|OJK Jawa Barat`,
      },
    });
  }

  // 5. Rooms
  const room1 = await prisma.asset.create({
    data: {
      code: 'AST-RNG-001',
      name: 'Ruang Rapat Bale Astama',
      categoryId: catRoom.id,
      location: 'Gedung Utama Lt. 2',
      status: 'in_use',
      condition: 'good',
      photo: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=300&auto=format&fit=crop',
      qrCode: 'AST-RNG-001|Ruang Rapat Bale Astama|OJK Jawa Barat',
    },
  });

  const room2 = await prisma.asset.create({
    data: {
      code: 'AST-RNG-002',
      name: 'Ruang Rapat Nakula',
      categoryId: catRoom.id,
      location: 'Gedung Utama Lt. 3',
      status: 'available',
      condition: 'good',
      photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=300&auto=format&fit=crop',
      qrCode: 'AST-RNG-002|Ruang Rapat Nakula|OJK Jawa Barat',
    },
  });

  const room3 = await prisma.asset.create({
    data: {
      code: 'AST-RNG-003',
      name: 'Aula Catur Dharma',
      categoryId: catRoom.id,
      location: 'Gedung Utama Lt. 1',
      status: 'available',
      condition: 'good',
      photo: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=300&auto=format&fit=crop',
      qrCode: 'AST-RNG-003|Aula Catur Dharma|OJK Jawa Barat',
    },
  });

  const room4 = await prisma.asset.create({
    data: {
      code: 'AST-RNG-004',
      name: 'Ruang Rapat Sadewa',
      categoryId: catRoom.id,
      location: 'Gedung Utama Lt. 2',
      status: 'available',
      condition: 'good',
      photo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=300&auto=format&fit=crop',
      qrCode: 'AST-RNG-004|Ruang Rapat Sadewa|OJK Jawa Barat',
    },
  });

  // 6. Reservations
  const now = new Date();

  await prisma.reservation.create({
    data: {
      userId: pegawai1.id,
      assetId: vehicleAssets['AST-KND-003'].id,
      startDate: new Date(now.setHours(8, 0, 0, 0)),
      endDate: new Date(now.setHours(17, 0, 0, 0)),
      purpose: 'Kunjungan Kerja Tim Pengawasan ke OJK Pusat Jakarta',
      destination: 'Kantor Pusat OJK Jakarta',
      driverRequired: true,
      driverName: 'Supriyadi',
      status: 'in_use',
    },
  });

  await prisma.reservation.create({
    data: {
      userId: pegawai2.id,
      assetId: room1.id,
      startDate: new Date(now.setHours(9, 0, 0, 0)),
      endDate: new Date(now.setHours(11, 0, 0, 0)),
      purpose: 'Rapat Koordinasi Edukasi Keuangan Daerah',
      status: 'in_use',
    },
  });

  await prisma.reservation.create({
    data: {
      userId: pegawai3.id,
      assetId: vehicleAssets['AST-KND-002'].id,
      startDate: new Date(now.setHours(13, 0, 0, 0)),
      endDate: new Date(now.setHours(17, 0, 0, 0)),
      purpose: 'Penjemputan Tamu Pimpinan OJK Pusat',
      destination: 'Bandara Kertajati / Stasiun Tegalluar',
      driverRequired: true,
      driverName: 'Ahmad Suhendar',
      status: 'approved',
    },
  });

  await prisma.reservation.create({
    data: {
      userId: pegawai1.id,
      assetId: room2.id,
      startDate: new Date(now.setHours(15, 0, 0, 0)),
      endDate: new Date(now.setHours(17, 0, 0, 0)),
      purpose: 'Video Conference Sosialisasi Kebijakan Baru',
      status: 'pending',
    },
  });

  // 7. Notifications
  await prisma.notification.create({
    data: {
      userId: pegawai1.id,
      title: 'Pengajuan Ruang Rapat Nakula Dikirim',
      message: 'Pengajuan reservasi Anda untuk Ruang Rapat Nakula (15.00 - 17.00) telah dikirim ke Validator.',
      type: 'approval',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: validator.id,
      title: 'Pengajuan Reservasi Baru',
      message: 'Ratu Khansa mengajukan reservasi Ruang Rapat Nakula untuk hari ini pukul 15.00 WIB.',
      type: 'approval',
      isRead: false,
    },
  });

  // 8. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'create_asset',
      description: 'Menambahkan aset baru: Toyota Fortuner D 1882 E (AST-KND-001)',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✓ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
