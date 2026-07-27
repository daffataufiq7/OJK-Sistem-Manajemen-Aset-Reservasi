import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['approved', 'reserved', 'in_use', 'completed'] }
      },
      include: {
        asset: true,
        user: true,
      }
    });

    const events = reservations.map((res) => ({
      id: String(res.id),
      title: `${res.asset.name} - ${res.user.name}`,
      start: res.startDate.toISOString(),
      end: res.endDate.toISOString(),
      extendedProps: {
        status: res.status,
        purpose: res.purpose,
        asset_name: res.asset.name,
        user_name: res.user.name,
        location: res.asset.location,
      }
    }));

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Calendar events error:', error);
    return NextResponse.json({ message: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
