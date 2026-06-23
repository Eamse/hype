import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  return Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
}

// 암호화 문자열 -> 바이트
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // gcm은 12바이트 IV가 표준
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // gcm의 변조 검증 태그
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

// 복호화 바이트 -> 문자열
export function decrypt(data: string): string {
  const buf = Buffer.from(data, 'base64');

  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
