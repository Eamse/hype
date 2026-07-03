/**
 * 이미지 업로드 보안 검증 유틸리티
 * - MIME 타입 화이트리스트
 * - Magic Bytes 검증 (MIME 스푸핑 방지)
 * - 파일 크기 제한
 */

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
