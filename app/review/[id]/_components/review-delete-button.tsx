'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
export default function ReviewDeleteButton({ reviewId, authorUserId, }: {
    reviewId: number;
    authorUserId: string | null;
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
        if (!window.confirm('Delete this review? This cannot be undone.'))
            return;
        let password: string | null = null;
        if (!isOwner && !isModerator) {
            password = window.prompt('Please enter the password you used when posting.');
            if (password === null)
                return;
        }
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
    return (<button onClick={handleDelete} disabled={deleting} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: '#ef4444',
            padding: 0,
        }}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>);
}
