import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { autoSyncReservationStatuses } from '@/lib/statusSync';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    await autoSyncReservationStatuses();

    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'available' } });
    const inUseAssets = await prisma.asset.count({ where: { status: 'in_use' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'maintenance' } });

    const totalReservations = await prisma.reservation.count();
    const pendingReservations = await prisma.reservation.count({ where: { status: 'pending' } });
    const approvedReservations = await prisma.reservation.count({ where: { status: 'approved' } });
    const activeReservations = await prisma.reservation.count({ where: { status: 'in_use' } });

    const recentReservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        asset: { select: { name: true, code: true, location: true } }
      }
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json({
      stats: {
        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        totalReservations,
        pendingReservations,
        approvedReservations,
        activeReservations,
      },
      recentReservations,
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
