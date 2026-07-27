import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user || !['super_admin', 'validator'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const resId = Number(id);
    const body = await request.json().catch(() => ({}));
    const driverName = body.driver_name || body.driverName || null;

    const updateData: any = { status: 'approved' };
    if (driverName) {
      updateData.driverName = driverName;
    }

    const reservation = await prisma.reservation.update({
      where: { id: resId },
      data: updateData,
      include: { asset: true, user: true },
    });

    const driverInfoMsg = driverName ? ` dengan Driver: ${driverName}` : '';

    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: 'Pengajuan Disetujui',
        message: `Pengajuan peminjaman ${reservation.asset.name} Anda telah disetujui oleh ${user.name}${driverInfoMsg}.`,
        type: 'approval',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'approve_reservation',
        description: `Menyetujui peminjaman ${reservation.asset.name} oleh ${reservation.user.name}${driverInfoMsg}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Approve error:', error);
    return NextResponse.json({ message: 'Failed to approve reservation' }, { status: 500 });
  }
}
