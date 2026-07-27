import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Notification mark-all-read error:', error);
    return NextResponse.json({ message: 'Failed to mark all notifications read' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
