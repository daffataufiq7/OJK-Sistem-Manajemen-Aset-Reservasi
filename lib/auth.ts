import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ojk_simar_secret_jwt_key_2026_super_secure'
);

export async function createToken(payload: { userId: number; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: number; role: string };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(request?: Request) {
  let token: string | null = null;

  if (request) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('ojk_token')?.value || null;
    } catch (e) {
      // Ignore if called outside request context
    }
  }

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { division: true },
  });

  return user;
}
