import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const ALLOWED_PRODUCT_TYPES = new Set(['wedding', 'snap']);
const ALLOWED_LOCATIONS = new Set(['jeju', 'seoul']);

//리뷰 목록
export async function GET(request: NextRequest) {
  const brand = request.nextUrl.searchParams.get('brand'); // 'wedding' | 'sanp' | null
}
