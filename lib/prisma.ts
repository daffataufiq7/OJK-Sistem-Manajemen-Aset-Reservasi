import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.startsWith('file:')) {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      dbUrl = `file:${dbPath}`;
    } else {
      dbUrl = 'file:./prisma/dev.db';
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
