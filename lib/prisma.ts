import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let dbUrl = process.env.DATABASE_URL;

  // On Vercel (or any production serverless container), copy bundled dev.db to /tmp/dev.db 
  // because /var/task is read-only while /tmp is fully writable!
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const tmpDbPath = '/tmp/dev.db';

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
        }
      }
      if (fs.existsSync(tmpDbPath)) {
        dbUrl = `file:${tmpDbPath}`;
      }
    } catch (err) {
      console.error('Failed to prepare writable database in /tmp:', err);
    }
  }

  if (!dbUrl || dbUrl.startsWith('file:')) {
    if (!dbUrl || dbUrl === 'file:./dev.db' || dbUrl === 'file:./prisma/dev.db') {
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(dbPath)) {
        dbUrl = `file:${dbPath}`;
      } else {
        dbUrl = 'file:./prisma/dev.db';
      }
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
