import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id') || searchParams.get('assetId');
    const startDateStr = searchParams.get('start_date') || searchParams.get('startDate');
    const endDateStr = searchParams.get('end_date') || searchParams.get('endDate');

    if (!assetId || !startDateStr || !endDateStr) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const conflict = await prisma.reservation.findFirst({
      where: {
        assetId: Number(assetId),
        status: { in: ['approved', 'reserved', 'in_use', 'pending'] },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } }
        ]
      },
      include: { user: { select: { name: true } } }
    });

    return NextResponse.json({
      has_conflict: !!conflict,
      conflict_with: conflict ? {
        id: conflict.id,
        user_name: conflict.user.name,
        start_date: conflict.startDate,
        end_date: conflict.endDate,
        status: conflict.status
      } : null
    });
  } catch (error: any) {
    console.error('Check conflict error:', error);
    return NextResponse.json({ message: 'Failed to check conflict' }, { status: 500 });
  }
}
