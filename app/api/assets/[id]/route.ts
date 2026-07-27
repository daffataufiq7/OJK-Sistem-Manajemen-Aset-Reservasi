import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user || !['super_admin', 'validator'].includes(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, status, condition, photo } = body;

    const updatedAsset = await prisma.asset.update({
      where: { id: Number(id) },
      data: {
        name,
        location,
        status,
        condition,
        photo,
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update_asset',
        description: `Mengubah data aset: ${updatedAsset.name} (${updatedAsset.code})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(updatedAsset);
  } catch (error: any) {
    console.error('Asset PUT error:', error);
    return NextResponse.json({ message: 'Failed to update asset' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const deletedAsset = await prisma.asset.delete({
      where: { id: Number(id) },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete_asset',
        description: `Menghapus aset: ${deletedAsset.name} (${deletedAsset.code})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    console.error('Asset DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete asset' }, { status: 500 });
  }
}
