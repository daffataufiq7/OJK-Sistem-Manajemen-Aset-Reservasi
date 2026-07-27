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

    await prisma.asset.update({
      where: { id: reservation.assetId },
      data: { status: 'available' },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'complete_usage',
        description: `Menyelesaikan penggunaan aset ${reservation.asset.name}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Complete usage error:', error);
    return NextResponse.json({ message: 'Failed to complete usage' }, { status: 500 });
  }
}
