// DB 백업 파일 하나를 Cloudflare R2(private 버킷)에 업로드 — deploy/db-backup.sh에서 호출됨.
// 이 파일은 배포된 앱(node_modules 포함)과 같은 디렉터리에서 node로 직접 실행되므로,
// Next.js 런타임 없이도 @aws-sdk/client-s3만 있으면 동작함.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import path from 'path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('사용법: node upload-backup-to-r2.mjs <백업 파일 경로>');
  process.exit(1);
}

const {
  R2_BACKUP_BUCKET,
  R2_BACKUP_ENDPOINT,
  R2_BACKUP_ACCESS_KEY_ID,
  R2_BACKUP_SECRET_ACCESS_KEY,
} = process.env;

if (
  !R2_BACKUP_BUCKET ||
  !R2_BACKUP_ENDPOINT ||
  !R2_BACKUP_ACCESS_KEY_ID ||
  !R2_BACKUP_SECRET_ACCESS_KEY
) {
  console.error('R2_BACKUP_* 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_BACKUP_ENDPOINT,
  credentials: {
    accessKeyId: R2_BACKUP_ACCESS_KEY_ID,
    secretAccessKey: R2_BACKUP_SECRET_ACCESS_KEY,
  },
});

const key = `db-backups/${path.basename(filePath)}`;

await s3Client.send(
  new PutObjectCommand({
    Bucket: R2_BACKUP_BUCKET,
    Key: key,
    Body: readFileSync(filePath),
    ContentType: 'application/sql',
  }),
);

console.log(`R2 업로드 완료: ${key}`);
