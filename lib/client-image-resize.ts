'use client';

// 업로드 전 브라우저에서 canvas로 미리 리사이징 — 업로드 속도와 서버 부하를 줄임
// 서버(sharp)에서도 동일하게 다시 검증/압축하므로 여긴 "1차 축소" 역할만 함
// 웨딩 사진 특성상 고화질 유지가 중요해서 해상도/화질을 낮게 잡지 않음 (최대 10MB 안팎까지 허용)
export async function resizeImageFile(
  file: File,
  maxDimension = 3840,
  quality = 0.92,
): Promise<File> {
  // gif 등 애니메이션은 리사이징하면 프레임이 깨지므로 원본 그대로 통과
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close?.();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.\w+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}

export async function resizeImageFiles(files: File[], maxDimension = 3840): Promise<File[]> {
  return Promise.all(files.map((f) => resizeImageFile(f, maxDimension)));
}
