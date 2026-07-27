import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
