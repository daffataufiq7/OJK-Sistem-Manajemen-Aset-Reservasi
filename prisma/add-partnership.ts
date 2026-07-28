import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  // Get the Partnership category id
  const partnerCat = await p.assetCategory.upsert({
    where: { slug: 'partnership' },
    update: {},
    create: { name: 'Partnership', slug: 'partnership' },
  });

  console.log('Partnership category id:', partnerCat.id);

  const hotels = [
    {
      code: 'AST-PTN-001',
      name: 'The Trans Luxury Hotel Bandung',
      location: 'Jl. Gatot Subroto No.289, Bandung',
      photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-002',
      name: 'Hotel Savoy Homann Bidakara Bandung',
      location: 'Jl. Asia Afrika No.112, Bandung',
      photo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-003',
      name: 'Grand Hotel Preanger Bandung',
      location: 'Jl. Asia Afrika No.81, Bandung',
      photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-004',
      name: 'Padma Hotel Bandung',
      location: 'Jl. Ranca Bentang No.56-58, Ciumbuleuit, Bandung',
      photo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-005',
      name: 'Hotel Santika Premiere Bandung',
      location: 'Jl. Sumatra No.52, Bandung',
      photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-006',
      name: 'Aryaduta Hotel Bandung',
      location: 'Jl. Sumatera No.51, Bandung',
      photo: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-007',
      name: 'Pullman Ciawi Vimala Hills Resort & Spa',
      location: 'Jl. Raya Puncak KM 70, Ciawi, Bogor',
      photo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'AST-PTN-008',
      name: 'Novotel Bogor Golf Resort & Convention Centre',
      location: 'Jl. Raya Pajajaran, Bogor',
      photo: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const hotel of hotels) {
    const existing = await p.asset.findUnique({ where: { code: hotel.code } });
    if (existing) {
      console.log(`Skipped (already exists): ${hotel.name}`);
      continue;
    }
    await p.asset.create({
      data: {
        code:       hotel.code,
        name:       hotel.name,
        categoryId: partnerCat.id,
        location:   hotel.location,
        status:     'available',
        condition:  'good',
        photo:      hotel.photo,
        qrCode:     `${hotel.code}|${hotel.name}|OJK Jawa Barat`,
      },
    });
    console.log(`✓ Added: ${hotel.name}`);
  }

  console.log('\n✅ Partnership hotels seeded successfully!');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
