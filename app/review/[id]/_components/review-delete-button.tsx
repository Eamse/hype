'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReviewEditButton from './review-edit-button';
import type { EditReviewData } from '@/app/review/write/_components/review-form';
export default function ReviewDeleteButton({ reviewId, authorUserId, editReview, }: {
    reviewId: number;
    authorUserId: string | null;
    editReview: Omit<EditReviewData, 'requiresPassword'>;
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const isOwner = !!session?.user?.id && session.user.id === authorUserId;
    const isModerator = session?.user?.role === 'master';
    const canManage = isOwner || isModerator || !authorUserId;
    if (!canManage)
        return null;
    async function handleDelete() {
        let password: string | null = null;
        if (!isOwner && !isModerator) {
            password = window.prompt('Please enter the password you used when posting.');
            if (password === null)
                return;
        }
        if (!window.confirm('Delete this review? This cannot be undone.'))
            return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                alert('Failed to delete. Please check your password.');
                return;
            }
            router.push('/review');
            router.refresh();
        }
        finally {
            setDeleting(false);
        }
    }
    return (<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ReviewEditButton editReview={{ ...editReview, requiresPassword: !isOwner && !isModerator }}/>
      <button onClick={handleDelete} disabled={deleting} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: '#ef4444',
            padding: 0,
        }}>
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>);
}
