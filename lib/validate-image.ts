import sharp from 'sharp';
export const ALLOWED_IMAGE_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 12)
        return false;
    if (mimeType === 'image/jpeg') {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mimeType === 'image/png') {
        return (buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47);
    }
    if (mimeType === 'image/webp') {
        return (buffer.toString('ascii', 0, 4) === 'RIFF' &&
            buffer.toString('ascii', 8, 12) === 'WEBP');
    }
    if (mimeType === 'image/gif') {
        const sig = buffer.toString('ascii', 0, 6);
        return sig === 'GIF87a' || sig === 'GIF89a';
    }
    return false;
}
export const SHARP_OPTIONS = { limitInputPixels: 40000000 } as const;
export const DEFAULT_RESIZE_WIDTH = 1920;
export const DEFAULT_WEBP_QUALITY = 78;
export const HERO_RESIZE_WIDTH = 3840;
export const HERO_WEBP_QUALITY = 90;
export const THUMBNAIL_RESIZE_WIDTH = 640;
export const THUMBNAIL_WEBP_QUALITY = 75;
export class ImageProcessingError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = 'ImageProcessingError';
        this.status = status;
    }
}
export async function validateAndCompressImage(file: File, options: {
    resize?: number;
    quality?: number;
} = {}): Promise<Buffer> {
    const resize = options.resize ?? DEFAULT_RESIZE_WIDTH;
    const quality = options.quality ?? DEFAULT_WEBP_QUALITY;
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
        throw new ImageProcessingError('Only JPG, PNG, WEBP, GIF files are allowed');
    }
    if (file.size > MAX_IMAGE_SIZE) {
        throw new ImageProcessingError(`File size must not exceed ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
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
    }
    catch (e) {
        console.error('[validateAndCompressImage] sharp processing failed:', e);
        throw new ImageProcessingError('Image processing failed');
    }
}
