import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      include: { division: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Users GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, nip, email, password, role, division_id, divisionId } = body;

    const divId = division_id || divisionId;
    const hashedPassword = await bcrypt.hash(password || 'password', 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        nip,
        email,
        password: hashedPassword,
        role: role || 'pegawai',
        divisionId: divId ? Number(divId) : null,
      },
      include: { division: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create_user',
        description: `Menambahkan user baru: ${name} (${nip})`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('User POST error:', error);
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}
