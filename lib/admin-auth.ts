import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function getAdminId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.id === 'string' ? payload.id : null;
  } catch {
    return null;
  }
}
