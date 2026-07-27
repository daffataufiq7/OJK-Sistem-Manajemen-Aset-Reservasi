import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser(request);

  if (user) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'logout',
        description: `Pegawai ${user.name} berhasil logout dari sistem.`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });
  }

  const response = NextResponse.json({ message: 'Logout berhasil.' });
  response.cookies.delete('ojk_token');
  return response;
}
