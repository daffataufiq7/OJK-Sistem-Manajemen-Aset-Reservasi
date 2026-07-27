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
      data: { status: 'cancelled' },
      include: { asset: true },
    });

    await prisma.asset.update({
      where: { id: reservation.assetId },
      data: { status: 'available' },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'cancel_reservation',
        description: `Membatalkan reservasi ${reservation.asset.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Cancel reservation error:', error);
    return NextResponse.json({ message: 'Failed to cancel reservation' }, { status: 500 });
  }
}
