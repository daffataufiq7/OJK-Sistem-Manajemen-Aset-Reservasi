import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category) {
      where.category = { slug: category };
    }
    if (status) {
      where.status = status;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: { category: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Assets GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || !['super_admin', 'validator'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { code, name, category_id, categoryId, location, status, condition, photo } = body;

    const catId = category_id || categoryId;

    const newAsset = await prisma.asset.create({
      data: {
        code,
        name,
        categoryId: Number(catId),
        location,
        status: status || 'available',
        condition: condition || 'good',
        photo,
        qrCode: `${code}|${name}|OJK Jawa Barat`,
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create_asset',
        description: `Menambahkan aset baru: ${name} (${code})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    console.error('Asset POST error:', error);
    return NextResponse.json({ message: 'Failed to create asset' }, { status: 500 });
  }
}
