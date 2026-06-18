import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

interface AdminPayload {
  id: string;
  role: string;
}

async function getAdminAuth(request: NextRequest): Promise<AdminPayload | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const id = typeof payload.id === 'string' ? payload.id : null;
    const role = typeof payload.role === 'string' ? payload.role : null;
    if (!id || !role) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export async function getAdminId(request: NextRequest): Promise<string | null> {
  const auth = await getAdminAuth(request);
  return auth?.id ?? null;
}

/** master role만 통과 */
export async function requireMaster(request: NextRequest): Promise<string | null> {
  const auth = await getAdminAuth(request);
  if (!auth || auth.role !== 'master') return null;
  return auth.id;
}
