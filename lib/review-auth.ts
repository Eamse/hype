import bcrypt from 'bcryptjs';
export async function canModifyReview(owned: {
    userId: string | null;
    password: string | null;
}, session: {
    user?: {
        id?: string | null;
        role?: string | null;
    };
} | null, password: unknown): Promise<boolean> {
    if (session?.user?.role === 'master')
        return true;
    if (owned.userId) {
        return owned.userId === session?.user?.id;
    }
    if (typeof password !== 'string' || !owned.password)
        return false;
    return bcrypt.compare(password, owned.password);
}
