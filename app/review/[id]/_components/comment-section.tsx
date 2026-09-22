'use client';
import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import BulkActions from '@/components/admin/bulk-actions';
import { isStrongGuestPassword, GUEST_PASSWORD_HINT } from '@/lib/guest-password';
import { promptGuestPassword } from '@/lib/guest-password-prompt';
type CommentNode = {
    id: number;
    content: string;
    authorName: string;
    userId: string | null;
    parentId: number | null;
    deletedAt: string | null;
    createdAt: string;
    replies: CommentNode[];
};
function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
function countAll(nodes: CommentNode[]): number {
    return nodes.reduce((sum, n) => sum + (n.deletedAt ? 0 : 1) + countAll(n.replies), 0);
}
const inputClass = 'w-full rounded-lg border border-[#ddd] px-3 py-2 text-[13px] outline-none transition-colors focus:border-[#2D5A45]';
const inputErrorClass = 'w-full rounded-lg border border-red-400 px-3 py-2 text-[13px] outline-none transition-colors focus:border-red-500';
export default function CommentSection({ reviewId, initialComments, }: {
    reviewId: number;
    initialComments: CommentNode[];
}) {
    const { data: session } = useSession();
    const isModerator = session?.user?.role === 'master';
    const [comments, setComments] = useState<CommentNode[]>(initialComments);
    const [content, setContent] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPassword, setGuestPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyGuestName, setReplyGuestName] = useState('');
    const [replyGuestPassword, setReplyGuestPassword] = useState('');
    const [errors, setErrors] = useState<{
        content?: boolean;
        guestName?: boolean;
        guestPassword?: boolean;
        replyContent?: boolean;
        replyGuestName?: boolean;
        replyGuestPassword?: boolean;
    }>({});
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editPassword, setEditPassword] = useState<string | null>(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const totalCount = useMemo(() => countAll(comments), [comments]);
    const manageableIds = useMemo(() => {
        const ids: number[] = [];
        function walk(nodes: CommentNode[]) {
            for (const node of nodes) {
                const canManage = !node.deletedAt && (session?.user?.id === node.userId || isModerator);
                if (canManage)
                    ids.push(node.id);
                walk(node.replies);
            }
        }
        walk(comments);
        return ids;
    }, [comments, session, isModerator]);
    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const toggleAll = useCallback(() => {
        setSelectedIds((prev) => prev.size === manageableIds.length && manageableIds.length > 0
            ? new Set()
            : new Set(manageableIds));
    }, [manageableIds]);
    async function loadComments() {
        const res = await fetch(`/api/reviews/${reviewId}/comments`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
    }
    async function handleSubmit(parentId: number | null) {
        const body = parentId
            ? {
                content: replyContent,
                parentId,
                authorName: replyGuestName,
                password: replyGuestPassword,
            }
            : { content, authorName: guestName, password: guestPassword };
        const contentKey = parentId ? 'replyContent' : 'content';
        const nameKey = parentId ? 'replyGuestName' : 'guestName';
        const passwordKey = parentId ? 'replyGuestPassword' : 'guestPassword';
        if (!body.content.trim()) {
            setErrors((prev) => ({ ...prev, [contentKey]: true }));
            alert('Please enter a comment.');
            return;
        }
        if (!session && (!body.authorName.trim() || !isStrongGuestPassword(body.password))) {
            setErrors((prev) => ({
                ...prev,
                [nameKey]: !body.authorName.trim(),
                [passwordKey]: !isStrongGuestPassword(body.password),
            }));
            alert(
                !body.authorName.trim()
                    ? 'Please enter your name and password.'
                    : GUEST_PASSWORD_HINT,
            );
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                alert((await res.json()).error ?? 'Failed to post.');
                return;
            }
            if (parentId) {
                setReplyContent('');
                setReplyGuestName('');
                setReplyGuestPassword('');
                setReplyingTo(null);
            }
            else {
                setContent('');
                setGuestName('');
                setGuestPassword('');
            }
            await loadComments();
        }
        finally {
            setSubmitting(false);
        }
    }
    function startEdit(comment: CommentNode) {
        const isOwner = session?.user?.id === comment.userId;
        let password: string | null = null;
        if (!isOwner && !isModerator) {
            password = promptGuestPassword();
            if (password === null)
                return;
        }
        setEditingId(comment.id);
        setEditContent(comment.content);
        setEditPassword(password);
        setReplyingTo(null);
    }
    function cancelEdit() {
        setEditingId(null);
        setEditContent('');
        setEditPassword(null);
    }
    async function handleSaveEdit(comment: CommentNode) {
        if (!editContent.trim()) {
            alert('Please enter a comment.');
            return;
        }
        setEditSubmitting(true);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/comments/${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent, password: editPassword }),
            });
            if (!res.ok) {
                alert('Failed to update. Please check your password.');
                return;
            }
            setEditingId(null);
            setEditPassword(null);
            await loadComments();
        }
        finally {
            setEditSubmitting(false);
        }
    }
    async function handleDelete(comment: CommentNode) {
        const isOwner = session?.user?.id === comment.userId;
        let password: string | null = null;
        if (!isOwner && !isModerator) {
            password = promptGuestPassword();
            if (password === null)
                return;
        }
        const res = await fetch(`/api/reviews/${reviewId}/comments/${comment.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        if (!res.ok) {
            alert('Failed to delete. Please check your password.');
            return;
        }
        await loadComments();
    }
    async function handleBulkDelete() {
        const results = await Promise.all([...selectedIds].map(async (id) => {
            try {
                const res = await fetch(`/api/reviews/${reviewId}/comments/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: null }),
                });
                return res.ok;
            }
            catch {
                return false;
            }
        }));
        const failedCount = results.filter((ok) => !ok).length;
        setSelectedIds(new Set());
        await loadComments();
        if (failedCount > 0) {
            alert(`${failedCount} comment(s) failed to delete. Please try again.`);
        }
    }
    function renderComment(comment: CommentNode, depth: number) {
        const canManage = session?.user?.id === comment.userId || isModerator || !comment.userId;
        if (comment.deletedAt) {
            return (<div key={comment.id} style={{ marginLeft: depth * 24, marginTop: 12 }}>
          <div className="rounded-xl border border-dashed border-[#e2e2e2] bg-[#fafafa] px-4 py-3 text-[13px] italic text-[#aaa]">
            This comment has been deleted
          </div>
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>);
        }
        return (<div key={comment.id} style={{ marginLeft: depth * 24, marginTop: 12 }}>
        <div className="flex items-start gap-3 rounded-xl border border-[#eee] bg-white p-4">
          {manageableIds.includes(comment.id) && (<input type="checkbox" checked={selectedIds.has(comment.id)} onChange={() => toggleSelect(comment.id)} style={{ marginTop: 4, flexShrink: 0 }}/>)}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-[12px] font-bold text-white">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[13px] font-bold text-[#111]">
                {comment.authorName}
              </span>
              <span className="text-[11px] text-[#999]">
                {formatDateTime(comment.createdAt)}
              </span>
            </p>
            {editingId === comment.id ? (<div className="mb-2 flex flex-col gap-2">
                <textarea className={inputClass} style={{ minHeight: 60 }} value={editContent} onChange={(e) => setEditContent(e.target.value)}/>
                <div className="flex gap-2 self-end">
                  <button onClick={cancelEdit} className="cursor-pointer whitespace-nowrap rounded-lg border border-[#ddd] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#e03131]">
                    Cancel
                  </button>
                  <button onClick={() => handleSaveEdit(comment)} disabled={editSubmitting} className="cursor-pointer whitespace-nowrap rounded-lg border-none bg-[#0D0D0D] px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50">
                    {editSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>) : (<p className="mb-2 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#333]">
                {comment.content}
              </p>)}
            {editingId !== comment.id && (<div className="flex gap-4">
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="cursor-pointer border-none bg-none p-0 text-[12px] font-semibold text-[#2D5A45] hover:underline">
                Reply
              </button>
              {canManage && (<button onClick={() => startEdit(comment)} className="cursor-pointer border-none bg-none p-0 text-[12px] font-semibold text-[#666] hover:underline">
                  Edit
                </button>)}
              {canManage && (<button onClick={() => handleDelete(comment)} className="cursor-pointer border-none bg-none p-0 text-[12px] font-semibold text-[#ef4444] hover:underline">
                  Delete
                </button>)}
            </div>)}
          </div>
        </div>

        {replyingTo === comment.id && (<div className="flex flex-col gap-2 rounded-xl border border-dashed border-[#ddd] bg-[#fafafa] p-3" style={{ marginLeft: 24, marginTop: 8 }}>
            <textarea className={errors.replyContent ? inputErrorClass : inputClass} style={{ minHeight: 60 }} value={replyContent} onChange={(e) => { setReplyContent(e.target.value); setErrors((prev) => ({ ...prev, replyContent: false })); }} placeholder="Write a reply"/>
            {!session && (<div className="flex gap-2">
                <input className={errors.replyGuestName ? inputErrorClass : inputClass} value={replyGuestName} onChange={(e) => { setReplyGuestName(e.target.value); setErrors((prev) => ({ ...prev, replyGuestName: false })); }} placeholder="Name"/>
                <input className={errors.replyGuestPassword ? inputErrorClass : inputClass} type="password" value={replyGuestPassword} onChange={(e) => { setReplyGuestPassword(e.target.value); setErrors((prev) => ({ ...prev, replyGuestPassword: false })); }} placeholder="Password"/>
              </div>)}
            <button onClick={() => handleSubmit(comment.id)} disabled={submitting} className="cursor-pointer self-end whitespace-nowrap rounded-lg border-none bg-[#0D0D0D] px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50">
              Submit
            </button>
          </div>)}

        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
      </div>);
    }
    return (<div className="mt-10 border-t border-[#eee] pt-8">
      <h2 className="mb-4 text-[16px] font-bold text-[#111]">
        Comments
        <span className="ml-1.5 font-normal text-[#999]">({totalCount})</span>
      </h2>

      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[#eee] bg-[#fafafa] p-4">
        <textarea className={`${errors.content ? inputErrorClass : inputClass} bg-white`} style={{ minHeight: 70 }} value={content} onChange={(e) => { setContent(e.target.value); setErrors((prev) => ({ ...prev, content: false })); }} placeholder="Write a comment"/>
        {!session && (<div className="flex gap-2">
            <input className={`${errors.guestName ? inputErrorClass : inputClass} bg-white`} value={guestName} onChange={(e) => { setGuestName(e.target.value); setErrors((prev) => ({ ...prev, guestName: false })); }} placeholder="Name"/>
            <input className={`${errors.guestPassword ? inputErrorClass : inputClass} bg-white`} type="password" value={guestPassword} onChange={(e) => { setGuestPassword(e.target.value); setErrors((prev) => ({ ...prev, guestPassword: false })); }} placeholder="Password"/>
          </div>)}
        <button onClick={() => handleSubmit(null)} disabled={submitting} className="cursor-pointer self-end whitespace-nowrap rounded-lg border-none bg-[#0D0D0D] px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50">
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {comments.length === 0 ? (<p className="text-[13px] text-[#999]">Be the first to comment.</p>) : (<>
          {manageableIds.length > 0 && (<div style={{ marginBottom: 12 }}>
              <BulkActions total={manageableIds.length} selectedCount={selectedIds.size} allSelected={selectedIds.size === manageableIds.length} onToggleAll={toggleAll} onDeleteSelected={handleBulkDelete}/>
            </div>)}
          {comments.map((c) => renderComment(c, 0))}
        </>)}
    </div>);
}
