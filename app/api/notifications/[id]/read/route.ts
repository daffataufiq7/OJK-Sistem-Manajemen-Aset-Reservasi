import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const notifId = Number(id);

    await prisma.notification.updateMany({
      where: {
        id: notifId,
        userId: user.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Notification mark read error:', error);
    return NextResponse.json({ message: 'Failed to mark notification read' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params });
}
