import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (user.role === 'pegawai') {
      where.userId = user.id;
    }
    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, nip: true, division: true } },
        asset: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reservations);
  } catch (error: any) {
    console.error('Reservations GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      asset_id, assetId,
      start_date, startDate,
      end_date, endDate,
      purpose, destination,
      driver_required, driverRequired,
      driver_name, driverName
    } = body;

    const targetAssetId = Number(asset_id || assetId);
    const start = new Date(start_date || startDate);
    const end = new Date(end_date || endDate);

    // Conflict Check
    const conflict = await prisma.reservation.findFirst({
      where: {
        assetId: targetAssetId,
        status: { in: ['approved', 'reserved', 'in_use', 'pending'] },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({
        message: 'Aset ini sudah diajukan/dipinjam pada rentang waktu yang sama.'
      }, { status: 422 });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        assetId: targetAssetId,
        startDate: start,
        endDate: end,
        purpose,
        destination,
        driverRequired: Boolean(driver_required || driverRequired),
        driverName: driver_name || driverName || null,
        status: 'pending',
      },
      include: {
        asset: true,
        user: true,
      }
    });

    // Create Notification for Validators
    const validators = await prisma.user.findMany({
      where: { role: { in: ['super_admin', 'validator'] } }
    });

    for (const val of validators) {
      await prisma.notification.create({
        data: {
          userId: val.id,
          title: 'Pengajuan Reservasi Baru',
          message: `${user.name} mengajukan peminjaman ${newReservation.asset.name}.`,
          type: 'approval',
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create_reservation',
        description: `Mengajukan peminjaman ${newReservation.asset.name} untuk ${purpose}`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error: any) {
    console.error('Reservation POST error:', error);
    return NextResponse.json({ message: 'Failed to create reservation' }, { status: 500 });
  }
}
