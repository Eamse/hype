type SessionLike = { user?: { role?: string | null } | null } | null;

export function isMagazineMaster(session: SessionLike): boolean {
  return session?.user?.role === 'master';
}
