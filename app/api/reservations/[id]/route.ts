import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const reservationId = Number(rawId);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: { select: { name: true, email: true, nip: true, division: true } },
        asset: { include: { category: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json({ message: 'Reservasi tidak ditemukan.' }, { status: 404 });
    }

    if (user.role === 'pegawai' && reservation.userId !== user.id) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Reservation GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  if (!['super_admin', 'validator'].includes(user.role)) {
    return NextResponse.json({ message: 'Akses ditolak. Hanya Validator atau Admin yang dapat memperbarui.' }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const reservationId = Number(rawId);
    const body = await request.json();

    const { status, rejection_reason, rejectionReason, notes, driver_name, driverName } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { asset: true },
    });

    if (!reservation) {
      return NextResponse.json({ message: 'Reservasi tidak ditemukan.' }, { status: 404 });
    }

    const newStatus = status || reservation.status;
    const newRejectionReason = rejection_reason !== undefined ? rejection_reason : (rejectionReason !== undefined ? rejectionReason : reservation.rejectionReason);
    const newDriverName = driver_name !== undefined ? driver_name : (driverName !== undefined ? driverName : reservation.driverName);

    // Update Asset Status if reservation status changes
    if (reservation.status !== newStatus && reservation.asset) {
      let assetStatus = reservation.asset.status;
      if (['approved', 'reserved'].includes(newStatus)) {
        assetStatus = 'reserved';
      } else if (newStatus === 'in_use') {
        assetStatus = 'in_use';
      } else if (['completed', 'cancelled', 'rejected'].includes(newStatus)) {
        assetStatus = 'available';
      }

      await prisma.asset.update({
        where: { id: reservation.assetId },
        data: { status: assetStatus },
      });
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: newStatus,
        rejectionReason: newStatus === 'rejected' ? newRejectionReason : null,
        driverName: newDriverName,
      },
      include: {
        user: { select: { name: true, email: true, nip: true, division: true } },
        asset: { include: { category: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update_reservation',
        description: `Memperbarui status reservasi ID: #${reservationId} menjadi ${newStatus}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Reservation PUT error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  if (!['super_admin', 'validator'].includes(user.role)) {
    return NextResponse.json({ message: 'Akses ditolak. Hanya Validator atau Admin yang dapat menghapus.' }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const reservationId = Number(rawId);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { asset: true },
    });

    if (!reservation) {
      return NextResponse.json({ message: 'Reservasi tidak ditemukan.' }, { status: 404 });
    }

    // Reset asset status if it was active
    if (reservation.asset && ['pending', 'approved', 'reserved', 'in_use'].includes(reservation.status)) {
      await prisma.asset.update({
        where: { id: reservation.assetId },
        data: { status: 'available' },
      });
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete_reservation',
        description: `Menghapus permanen reservasi ID: #${reservationId}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({ message: 'Reservasi berhasil dihapus.' });
  } catch (error: any) {
    console.error('Reservation DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete reservation' }, { status: 500 });
  }
}
