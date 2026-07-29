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

    const existing = await prisma.reservation.findUnique({ where: { id: resId } });
    if (!existing) {
      return NextResponse.json({ message: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    const now = new Date();
    const isCurrentTimeInUse = now >= new Date(existing.startDate) && now <= new Date(existing.endDate);
    const targetStatus = isCurrentTimeInUse ? 'in_use' : 'approved';
    const targetAssetStatus = isCurrentTimeInUse ? 'in_use' : 'reserved';

    const targetAssetId = body.asset_id || body.assetId;
    const updateData: any = { status: targetStatus };
    if (driverName) {
      updateData.driverName = driverName;
    }
    if (targetAssetId && !isNaN(Number(targetAssetId))) {
      updateData.assetId = Number(targetAssetId);
    }

    const reservation = await prisma.reservation.update({
      where: { id: resId },
      data: updateData,
      include: { asset: true, user: true },
    });

    if (reservation.assetId) {
      await prisma.asset.update({
        where: { id: reservation.assetId },
        data: { status: targetAssetStatus },
      });
    }

    const driverInfoMsg = driverName ? ` dengan Driver: ${driverName}` : '';

    try {
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          title: 'Pengajuan Disetujui',
          message: `Pengajuan peminjaman ${reservation.asset?.name || 'Aset'} Anda telah disetujui oleh ${user.name}${driverInfoMsg}.`,
          type: 'approval',
        }
      });
    } catch (notifErr) {
      console.warn('Notification skipped:', notifErr);
    }

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'approve_reservation',
          description: `Menyetujui peminjaman ${reservation.asset?.name || 'Aset'} oleh ${reservation.user?.name || 'User'}${driverInfoMsg}`,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        }
      });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Approve error:', error);
    return NextResponse.json({ message: error?.message || 'Gagal menyetujui peminjaman.' }, { status: 500 });
  }
}
