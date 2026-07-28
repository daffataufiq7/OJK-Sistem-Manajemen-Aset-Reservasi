import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const cat = await p.assetCategory.upsert({
    where: { slug: 'partnership' },
    update: {},
    create: { name: 'Partnership', slug: 'partnership' },
  });
  console.log('Category ensured:', cat.name, 'id:', cat.id);
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
