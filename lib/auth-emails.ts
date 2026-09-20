import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import { generateToken } from '@/lib/tokens';

const VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

function emailWrapper(title: string, bodyHtml: string): string {
    return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="font-size: 12px; color: #999; margin-top: 32px;">HYPE WEDDING</p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, siteUrl: string) {
    const token = generateToken();
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires: new Date(Date.now() + VERIFICATION_EXPIRES_MS),
        },
    });
    const link = `${siteUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail(
        email,
        'Verify your email — HYPE WEDDING',
        emailWrapper(
            'Verify your email',
            `<p style="font-size: 14px; color: #333; line-height: 1.6;">Please confirm your email address to finish setting up your account.</p>
       <a href="${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Verify Email</a>
       <p style="font-size: 12px; color: #999; margin-top: 16px;">This link expires in 24 hours.</p>`,
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
            `<p style="font-size: 14px; color: #333; line-height: 1.6;">We received a request to reset your password. Click below to set a new one.</p>
       <a href="${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Reset Password</a>
       <p style="font-size: 12px; color: #999; margin-top: 16px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
        ),
    );
}
