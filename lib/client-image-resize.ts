'use client';
export async function resizeImageFile(file: File, maxDimension = 3840, quality = 0.92): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif')
        return file;
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap)
        return file;
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
    if (!ctx)
        return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob)
        return file;
    const newName = file.name.replace(/\.\w+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
}
export async function resizeImageFiles(files: File[], maxDimension = 3840): Promise<File[]> {
    return Promise.all(files.map((f) => resizeImageFile(f, maxDimension)));
}
