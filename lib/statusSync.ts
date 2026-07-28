import { prisma } from '@/lib/prisma';

/**
 * Automatically syncs reservation & asset statuses based on the current date & time:
 * 1. Approved/Reserved reservations where now is between startDate & endDate => status becomes 'in_use', asset status becomes 'in_use'.
 * 2. Approved/Reserved/In_use reservations where now > endDate => status becomes 'completed', asset status returns to 'available'.
 */
export async function autoSyncReservationStatuses() {
  try {
    const now = new Date();

    // 1. Mark reservations that have started as 'in_use'
    const startingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['approved', 'reserved'] },
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    for (const res of startingReservations) {
      await prisma.reservation.update({
        where: { id: res.id },
        data: { status: 'in_use' },
      });
      if (res.assetId) {
        await prisma.asset.update({
          where: { id: res.assetId },
          data: { status: 'in_use' },
        });
      }
    }

    // 2. Mark expired reservations as 'completed' & free the asset
    const endingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['approved', 'reserved', 'in_use'] },
        endDate: { lt: now },
      },
    });

    for (const res of endingReservations) {
      await prisma.reservation.update({
        where: { id: res.id },
        data: { status: 'completed' },
      });

      if (res.assetId) {
        // Check if there are any other active reservations for this asset right now
        const otherActive = await prisma.reservation.findFirst({
          where: {
            assetId: res.assetId,
            status: { in: ['approved', 'reserved', 'in_use'] },
            startDate: { lte: now },
            endDate: { gte: now },
          },
        });

        if (!otherActive) {
          await prisma.asset.update({
            where: { id: res.assetId },
            data: { status: 'available' },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error auto syncing reservation statuses:', error);
  }
}
