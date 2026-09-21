import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'HYPE WEDDING <onboarding@resend.dev>';

let client: Resend | null = null;
function getClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!client) client = new Resend(process.env.RESEND_API_KEY);
    return client;
}

export async function sendEmail(to: string, subject: string, html: string) {
    const resend = getClient();
    if (!resend) {
        console.warn(`[resend] RESEND_API_KEY not set, skipping email to ${to}: ${subject}`);
        return;
    }
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
        console.error('[resend] send failed:', error);
        throw new Error('Failed to send email');
    }
}
