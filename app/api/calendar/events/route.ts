import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const whereCondition: any = {
      status: { in: ['approved', 'reserved', 'in_use', 'completed', 'pending'] }
    };

    // Pegawai only sees their own calendar reservations
    if (user.role === 'pegawai') {
      whereCondition.userId = user.id;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereCondition,
      include: {
        asset: {
          include: { category: true }
        },
        user: {
          include: { division: true }
        },
      },
      orderBy: { startDate: 'asc' }
    });

    const events = reservations.map((res) => {
      let color = '#EAB308'; // Pending (Yellow)
      if (res.status === 'approved' || res.status === 'reserved') {
        color = '#3B82F6'; // Approved (Blue)
      } else if (res.status === 'in_use') {
        color = '#F97316'; // In Use (Orange)
      } else if (res.status === 'completed') {
        color = '#10B981'; // Completed (Green)
      }

      return {
        id: String(res.id),
        title: `${res.asset.name} (${res.user.name})`,
        start: res.startDate.toISOString(),
        end: res.endDate.toISOString(),
        color,
        textColor: '#FFFFFF',
        extendedProps: {
          asset_name: res.asset.name,
          asset_code: res.asset.code,
          category: res.asset.category?.name || 'Aset',
          applicant: res.user.name,
          division: res.user.division?.name || '-',
          purpose: res.purpose,
          status: res.status,
          driver_name: res.driverName || null,
          location: res.asset.location,
        }
      };
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Calendar events error:', error);
    return NextResponse.json({ message: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
