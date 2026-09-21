import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import { generateToken } from '@/lib/tokens';

const VERIFICATION_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes
const RESET_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

// 헷갈리기 쉬운 문자(0/O, 1/I/L) 제외한 대문자+숫자 조합, 복붙하기 편하게 사람이 타이핑하지 않아도 되는 길이로.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function generateCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
}

function emailWrapper(title: string, bodyHtml: string): string {
    return `
    <div style="background: #f6f6f6; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="padding: 28px 32px; border-bottom: 1px solid #eee; text-align: center;">
          <span style="font-size: 15px; font-weight: 800; letter-spacing: 2px; color: #000;">HYPE WEDDING</span>
        </div>
        <div style="padding: 32px;">
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #111;">${title}</h1>
          ${bodyHtml}
        </div>
        <div style="padding: 20px 32px; background: #fafafa; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; margin: 0; line-height: 1.6;">
            This is an automated message from HYPE WEDDING. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendVerificationEmail(email: string) {
    const code = generateCode();
    await prisma.emailVerification.upsert({
        where: { email },
        create: {
            email,
            token: code,
            verified: false,
            expires: new Date(Date.now() + VERIFICATION_EXPIRES_MS),
        },
        update: {
            token: code,
            verified: false,
            expires: new Date(Date.now() + VERIFICATION_EXPIRES_MS),
        },
    });
    await sendEmail(
        email,
        `${code} is your verification code — HYPE WEDDING`,
        emailWrapper(
            'Verify your email',
            `<p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 20px;">
         Thanks for signing up! Enter the code below to verify your email and continue creating your account.
       </p>
       <div style="background: #f6f6f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
         <span style="font-size: 30px; font-weight: 800; letter-spacing: 8px; color: #000; font-family: monospace;">${code}</span>
       </div>
       <p style="font-size: 13px; color: #999; margin: 0;">This code expires in 15 minutes.</p>`,
        ),
    );
}

export async function sendPasswordResetEmail(email: string, userId: string, siteUrl: string) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
        data: {
            userId,
            token,
            expires: new Date(Date.now() + RESET_EXPIRES_MS),
        },
    });
    const link = `${siteUrl}/reset-password?token=${token}`;
    await sendEmail(
        email,
        'Reset your password — HYPE WEDDING',
        emailWrapper(
            'Reset your password',
            `<p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px;">
         We received a request to reset the password for your HYPE WEDDING account. Click the button below to choose a new one.
       </p>
       <a href="${link}" style="display: inline-block; padding: 13px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Reset Password</a>
       <p style="font-size: 13px; color: #999; margin: 20px 0 0;">This link expires in 1 hour.</p>`,
        ),
    );
}
