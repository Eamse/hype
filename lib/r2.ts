import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } =
  process.env;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('R2 environment variables are not configured');
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

let R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  ''
).trim();

if (R2_PUBLIC_URL) {
  if (!R2_PUBLIC_URL.startsWith('http')) {
    R2_PUBLIC_URL = `https://${R2_PUBLIC_URL}`;
  }
  R2_PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, '');
}

export const uploadToR2 = async (urlOrKey: string, buffer: Buffer) => {
  if (!urlOrKey) return;

  let key = urlOrKey;
  if (key.startsWith('/')) key = key.slice(1);

  const commend = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
  });
  try {
    await s3Client.send(commend);
  } catch (error) {
    throw error;
  }
};

export const deleteFileFromR2 = async (urlOrKey: string) => {
  if (!urlOrKey) return;

  // R2_PUBLIC_BASE_URL이 커스텀 도메인으로 바뀐 뒤에도, 예전 r2.dev 호스트로
  // 저장된 기존 파일들의 URL을 그대로 지울 수 있도록 호스트 종류에 상관없이
  // pathname만 key로 사용
  let key = urlOrKey;
  if (key.startsWith('http')) {
    try {
      key = new URL(key).pathname.replace(/^\//, '');
    } catch {
      // URL 파싱 실패 시 원본 그대로 시도
    }
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

export { s3Client };
