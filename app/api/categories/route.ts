import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.assetCategory.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}
