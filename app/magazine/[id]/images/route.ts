import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

// 문자열을 숫자로 변환하는 함수
function parseId(id: string): number | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return null;
}

// 이미지 등록
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const idNum = parseId(id);
  if (idNum === null) {
    return NextResponse.json({ error: 'invaild id' }, { status: 400 });
  }

  const formData = await request.formData();
  const files = formData.getAll('image') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }
  const saved: { id: number; url: string; order: number }[] = [];
  // files 배열 안에서 file을 하나씩 꺼냄
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
    return NextResponse.json({ error: 'invaild id' }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const imageId = parseId(searchParams.get('imageId') ?? '');
  if (imageId === null) {
    return NextResponse.json({ error: 'invaild id' }, { status: 400 });
  }
  try {
    const image = await prisma.magazineImage.findFirstOrThrow({
      where: { id: imageId, magazineId: idNum },
    });
    // DB에서 삭제
    await prisma.magazineImage.delete({
      // idNum 추가 검증 (안 넣어도 되는데 검증 목적임)
      where: { id: imageId, magazineId: idNum },
    });

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
    console.error('[DELETE/api/admin/magazine/:id/images]', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
