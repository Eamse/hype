/**
 * 이미지 업로드 보안 검증 유틸리티
 * - MIME 타입 화이트리스트
 * - Magic Bytes 검증 (MIME 스푸핑 방지)
 * - 파일 크기 제한
 */

import sharp from 'sharp';

export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * 파일 실제 내용의 매직 바이트를 검사해 MIME 타입 스푸핑을 방지
 * 확장자나 Content-Type 헤더만 믿으면 .exe를 .jpg로 위장 업로드 가능
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  if (mimeType === 'image/jpeg') {
    // FF D8 FF
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    // 89 50 4E 47 0D 0A 1A 0A
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/webp') {
    // RIFF....WEBP
    return (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    );
  }
  if (mimeType === 'image/gif') {
    // GIF87a or GIF89a
    const sig = buffer.toString('ascii', 0, 6);
    return sig === 'GIF87a' || sig === 'GIF89a';
  }
  return false;
}

/**
 * sharp 처리 시 Decompression Bomb 방지 옵션
 * limitInputPixels: 4000만 픽셀 초과 이미지는 에러 발생 (~6300x6300 이상)
 */
export const SHARP_OPTIONS = { limitInputPixels: 40_000_000 } as const;

/** 리사이즈/화질 기본값 — 여기 숫자만 바꾸면 프로젝트 전체 업로드 압축 정도가 바뀜.
 * 예전엔 웨딩 사진 화질 유지를 위해 3840/92(파일당 최대 10MB 안팎)로 잡았는데,
 * 약한 VPS에서 페이지당 사진이 많을 때 너무 무거워져서 낮춤 — 히어로 이미지처럼
 * 화면을 꽉 채우는 대표 사진만 /api/images에서 HERO_RESIZE_WIDTH/QUALITY로 별도 지정 */
export const DEFAULT_RESIZE_WIDTH = 1920;
export const DEFAULT_WEBP_QUALITY = 78;

/** 히어로 등 풀스크린으로 크게 보여지는 대표 사진 전용 고화질 옵션 */
export const HERO_RESIZE_WIDTH = 3840;
export const HERO_WEBP_QUALITY = 90;

export class ImageProcessingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ImageProcessingError';
    this.status = status;
  }
}

/**
 * 이미지 업로드 검증 + 압축 공통 처리
 * MIME → 용량 → 매직바이트 검증 후 sharp로 리사이즈/webp 변환까지 한 번에
 */
export async function validateAndCompressImage(
  file: File,
  options: { resize?: number; quality?: number } = {},
): Promise<Buffer> {
  const resize = options.resize ?? DEFAULT_RESIZE_WIDTH;
  const quality = options.quality ?? DEFAULT_WEBP_QUALITY;

  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new ImageProcessingError('Only JPG, PNG, WEBP, GIF files are allowed');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageProcessingError(
      `File size must not exceed ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateMagicBytes(buffer, file.type)) {
    throw new ImageProcessingError('Invalid image file');
  }

  try {
    return await sharp(buffer, SHARP_OPTIONS)
      .resize(resize)
      .webp({ quality })
      .toBuffer();
  } catch (e) {
    console.error('[validateAndCompressImage] sharp processing failed:', e);
    throw new ImageProcessingError('Image processing failed');
  }
}
