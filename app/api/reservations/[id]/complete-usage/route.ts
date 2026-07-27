import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const resId = Number(id);

    const reservation = await prisma.reservation.update({
      where: { id: resId },
      data: { status: 'completed' },
      include: { asset: true },
    });

    if (reservation.assetId) {
      await prisma.asset.update({
        where: { id: reservation.assetId },
        data: { status: 'available' },
      });
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'complete_usage',
          description: `Menyelesaikan penggunaan aset ${reservation.asset?.name || 'Aset'}`,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        }
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr);
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Complete usage error:', error);
    return NextResponse.json({ message: 'Gagal menyelesaikan peminjaman aset.' }, { status: 500 });
  }
}
