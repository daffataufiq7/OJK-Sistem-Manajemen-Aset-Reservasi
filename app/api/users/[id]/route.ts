import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const userId = Number(rawId);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { division: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error: any) {
    console.error('User GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const userId = Number(rawId);
    const body = await request.json();

    const { name, nip, email, password, role, division_id, divisionId } = body;
    const divId = division_id !== undefined ? division_id : divisionId;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (nip) updateData.nip = nip;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (divId !== undefined) updateData.divisionId = divId ? Number(divId) : null;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { division: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update_user',
        description: `Memperbarui data user: ${updatedUser.name} (${updatedUser.nip})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('User PUT error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id: rawId } = await params;
    const targetUserId = Number(rawId);

    if (targetUserId === user.id) {
      return NextResponse.json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 422 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete_user',
        description: `Menghapus user: ${targetUser.name} (${targetUser.nip})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({ message: 'User berhasil dihapus.' });
  } catch (error: any) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
