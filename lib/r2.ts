import {
  DeleteObjectCommand,
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } =
  process.env;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
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

  let key = urlOrKey;
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_BASE_URL ?? '';
  if (R2_PUBLIC_URL && key.startsWith(R2_PUBLIC_URL)) {
    key = key.slice(R2_PUBLIC_URL.length).replace(/^\//, '');
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

export { s3Client };
