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
    const reason = body.reason || body.rejection_reason || 'Alasan penolakan tidak ditentukan.';

    const reservation = await prisma.reservation.update({
      where: { id: resId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
      include: { asset: true, user: true },
    });

    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: 'Pengajuan Ditolak',
        message: `Pengajuan peminjaman ${reservation.asset.name} ditolak. Alasan: ${reason}`,
        type: 'reject',
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'reject_reservation',
        description: `Menolak peminjaman ${reservation.asset.name} oleh ${reservation.user.name}. Alasan: ${reason}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Reject error:', error);
    return NextResponse.json({ message: 'Failed to reject reservation' }, { status: 500 });
  }
}
