import 'dotenv/config';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';
import { getDriveClient } from './sheets-client';
const ROOT_FOLDER_ID = '1CWbWAU1PdywRYKJTX--Ux8x4O5ix3lBv';
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
type DriveFile = {
    id: string;
    name: string;
    mimeType: string;
};
async function listChildren(drive: Awaited<ReturnType<typeof getDriveClient>>, folderId: string) {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        pageSize: 1000,
        orderBy: 'name',
    });
    return (res.data.files ?? []) as DriveFile[];
}
async function downloadFile(drive: Awaited<ReturnType<typeof getDriveClient>>, fileId: string) {
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
    return Buffer.from(res.data as ArrayBuffer);
}
function parseStudioFolderName(name: string): {
    location: string;
    number: number;
} | null {
    const match = name.trim().match(/^(Jeju|Seoul)\s*0*(\d+)/i);
    if (!match)
        return null;
    const location = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    return { location, number: Number(match[2]) };
}
async function main() {
    if (!R2_PUBLIC_BASE_URL) {
        throw new Error('R2_PUBLIC_BASE_URL이 설정되어 있지 않습니다');
    }
    const drive = await getDriveClient();
    const locationFolders = (await listChildren(drive, ROOT_FOLDER_ID)).filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
    for (const locationFolder of locationFolders) {
        const studioFolders = (await listChildren(drive, locationFolder.id)).filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
        for (const studioFolder of studioFolders) {
            const parsed = parseStudioFolderName(studioFolder.name);
            if (!parsed) {
                console.warn(`⚠️  폴더명 파싱 실패, 건너뜀: ${studioFolder.name}`);
                continue;
            }
            const directors = await prisma.director.findMany({
                where: { location: parsed.location },
            });
            const matchedDirectors = directors.filter((d) => {
                const prefix = `#${parsed.number}`;
                return d.number === prefix || d.number.startsWith(`${prefix}-`);
            });
            if (matchedDirectors.length === 0) {
                console.warn(`⚠️  DB에서 매칭되는 작가 없음: ${parsed.location} #${parsed.number} (${studioFolder.name})`);
                continue;
            }
            const packages = await prisma.package.findMany({
                where: { directorId: { in: matchedDirectors.map((d) => d.id) } },
            });
            if (packages.length === 0) {
                console.warn(`⚠️  ${studioFolder.name} — 매칭된 작가에 패키지가 없음`);
                continue;
            }
            const imageFiles = (await listChildren(drive, studioFolder.id)).filter((f) => f.mimeType.startsWith('image/'));
            if (imageFiles.length === 0) {
                console.warn(`⚠️  ${studioFolder.name} — 이미지 없음`);
                continue;
            }
            console.log(`\n📁 ${studioFolder.name} → 패키지 ${packages.length}개, 사진 ${imageFiles.length}장`);
            const uploaded: {
                webUrl: string;
                originalUrl: string;
                thumbUrl: string;
            }[] = [];
            let index = 0;
            for (const file of imageFiles) {
                index += 1;
                console.log(`  ⬇️  (${index}/${imageFiles.length}) ${file.name}`);
                const original = await downloadFile(drive, file.id);
                const webBuffer = await sharp(original, { limitInputPixels: 300000000 })
                    .resize(1600)
                    .webp({ quality: 82 })
                    .toBuffer();
                const originalBuffer = await sharp(original, { limitInputPixels: 300000000 })
                    .resize(3840)
                    .webp({ quality: 92 })
                    .toBuffer();
                const thumbBuffer = await sharp(original, { limitInputPixels: 300000000 })
                    .resize(640)
                    .webp({ quality: 75 })
                    .toBuffer();
                const key = `package_${parsed.location.toLowerCase()}_${parsed.number}_${crypto.randomUUID()}`;
                const webKey = `${key}_web.webp`;
                const originalKey = `${key}_original.webp`;
                const thumbKey = `${key}_thumb.webp`;
                await uploadToR2(webKey, webBuffer);
                await uploadToR2(originalKey, originalBuffer);
                await uploadToR2(thumbKey, thumbBuffer);
                uploaded.push({
                    webUrl: `${R2_PUBLIC_BASE_URL}/${webKey}`,
                    originalUrl: `${R2_PUBLIC_BASE_URL}/${originalKey}`,
                    thumbUrl: `${R2_PUBLIC_BASE_URL}/${thumbKey}`,
                });
            }
            for (const pkg of packages) {
                await prisma.packageImage.deleteMany({ where: { packageId: pkg.id } });
                await prisma.packageImage.createMany({
                    data: uploaded.map((img, order) => ({
                        packageId: pkg.id,
                        webUrl: img.webUrl,
                        originalUrl: img.originalUrl,
                        thumbUrl: img.thumbUrl,
                        order,
                    })),
                });
                console.log(`  ✅ package #${pkg.id} (${pkg.name}) — ${uploaded.length}장 반영`);
            }
        }
    }
    console.log('\n🎉 전체 동기화 완료');
}
main()
    .catch((err) => {
    console.error('❌ 실패:', err.message);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
