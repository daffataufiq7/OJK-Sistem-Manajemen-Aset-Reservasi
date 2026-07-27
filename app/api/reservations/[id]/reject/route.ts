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
    const reason = body.reason || body.rejection_reason || body.rejectionReason || 'Alasan penolakan tidak ditentukan.';

    const reservation = await prisma.reservation.update({
      where: { id: resId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
      include: { asset: true, user: true },
    });

    if (reservation.assetId) {
      await prisma.asset.update({
        where: { id: reservation.assetId },
        data: { status: 'available' },
      });
    }

    try {
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          title: 'Pengajuan Ditolak',
          message: `Pengajuan peminjaman ${reservation.asset?.name || 'Aset'} ditolak. Alasan: ${reason}`,
          type: 'reject',
        }
      });
    } catch (notifErr) {
      console.warn('Notification skipped:', notifErr);
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'reject_reservation',
          description: `Menolak peminjaman ${reservation.asset?.name || 'Aset'} oleh ${reservation.user?.name || 'User'}. Alasan: ${reason}`,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        }
      });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Reject error:', error);
    return NextResponse.json({ message: error?.message || 'Gagal menolak peminjaman.' }, { status: 500 });
  }
}
