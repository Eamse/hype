import { NextResponse } from 'next/server';

// ProductPartner is removed — partners are now managed per-package via PackagePartner
// See /api/admin/packages/[id]/partners

export async function GET() {
  return NextResponse.json({ error: 'Deprecated. Use /api/admin/packages/[id]/partners' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use /api/admin/packages/[id]/partners' }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Deprecated. Use /api/admin/packages/[id]/partners' }, { status: 410 });
}
