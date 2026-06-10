import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

// 이미지 등록
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  const saved: { id: number; url: string; order: number }[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Date.now()로 파일명 중복 방지
    const filename = `magazine_detail_${idNum}_${Date.now()}.png`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filePath, buffer);
    const url = `/uploads/${filename}`;

    const image = await prisma.magazineImage.create({
      data: { magazineId: idNum, url, order: 0 },
    });
    saved.push(image);
  }

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const imageId = parseId(searchParams.get('imageId') ?? '');
  if (imageId === null) {
    return NextResponse.json({ error: 'Invalid imageId' }, { status: 400 });
  }

  try {
    const image = await prisma.magazineImage.findUniqueOrThrow({
      where: { id: imageId, magazineId: idNum },
    });

    // DB에서 삭제 (idNum 추가 검증)
    await prisma.magazineImage.delete({
      where: { id: imageId, magazineId: idNum },
    });

    // 디스크에서 파일 삭제
    const filepath = path.join(process.cwd(), 'public', image.url);
    await import('fs/promises').then((fs) =>
      fs.unlink(filepath).catch(() => {}),
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code: unknown }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    console.error('[DELETE /api/admin/magazine/:id/images]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
