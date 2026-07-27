import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const divisions = await prisma.division.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(divisions);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch divisions' }, { status: 500 });
  }
}
