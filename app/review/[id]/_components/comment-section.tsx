'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import BulkActions from '@/components/admin/bulk-actions';

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #000',
  fontSize: 13,
};

export default function CommentSection({
  reviewId,
  initialComments,
}: {
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

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 로그인 유저 본인/관리자가 비밀번호 없이 지울 수 있는(=일괄삭제 가능한) 댓글만 선택 대상
  const manageableIds = useMemo(() => {
    const ids: number[] = [];
    function walk(nodes: CommentNode[]) {
      for (const node of nodes) {
        const canManage =
          !node.deletedAt && (session?.user?.id === node.userId || isModerator);
        if (canManage) ids.push(node.id);
        walk(node.replies);
      }
    }
    walk(comments);
    return ids;
  }, [comments, session, isModerator]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === manageableIds.length && manageableIds.length > 0
        ? new Set()
        : new Set(manageableIds),
    );
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

    if (!body.content.trim()) {
      alert('Please enter a comment.');
      return;
    }
    if (!session && (!body.authorName.trim() || !body.password.trim())) {
      alert('Please enter your name and password.');
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
      } else {
        setContent('');
        setGuestName('');
        setGuestPassword('');
      }
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(comment: CommentNode) {
    const isOwner = session?.user?.id === comment.userId;
    let password: string | null = null;

    if (!isOwner && !isModerator) {
      password = window.prompt(
        'Please enter the password you used when posting.',
      );
      if (password === null) return;
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
    await Promise.all(
      [...selectedIds].map((id) =>
        fetch(`/api/reviews/${reviewId}/comments/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: null }),
        }),
      ),
    );
    setSelectedIds(new Set());
    await loadComments();
  }

  function renderComment(comment: CommentNode, depth: number) {
    const canManage =
      session?.user?.id === comment.userId || isModerator || !comment.userId;

    return (
      <div key={comment.id} style={{ marginLeft: depth * 24, marginTop: 12 }}>
        <div
          style={{
            border: '1px solid #000',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            gap: 8,
          }}
        >
          {!comment.deletedAt && manageableIds.includes(comment.id) && (
            <input
              type="checkbox"
              checked={selectedIds.has(comment.id)}
              onChange={() => toggleSelect(comment.id)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {comment.deletedAt ? (
              <p style={{ fontSize: 13, color: '#000', margin: 0 }}>
                This comment has been deleted
              </p>
            ) : (
              <>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#000',
                    margin: '0 0 4px',
                  }}
                >
                  {comment.authorName}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#000',
                    margin: '0 0 8px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {comment.content}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id,
                      )
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '##000',
                    }}
                  >
                    Reply
                  </button>
                  {canManage && (
                    <button
                      onClick={() => handleDelete(comment)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: '#ef4444',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {replyingTo === comment.id && (
          <div
            style={{
              marginLeft: 24,
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply"
            />
            {!session && (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  style={inputStyle}
                  value={replyGuestName}
                  onChange={(e) => setReplyGuestName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  style={inputStyle}
                  type="password"
                  value={replyGuestPassword}
                  onChange={(e) => setReplyGuestPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
            )}
            <button
              onClick={() => handleSubmit(comment.id)}
              disabled={submitting}
              style={{
                alignSelf: 'flex-end',
                padding: '6px 14px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </div>
        )}

        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #000' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
        Comments
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginBottom: 24,
        }}
      >
        <textarea
          style={{ ...inputStyle, minHeight: 70 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment"
        />
        {!session && (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              style={inputStyle}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Name"
            />
            <input
              style={inputStyle}
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
        )}
        <button
          onClick={() => handleSubmit(null)}
          disabled={submitting}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 16px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {comments.length === 0 ? (
        <p style={{ fontSize: 13, color: '#000' }}>Be the first to comment.</p>
      ) : (
        <>
          {manageableIds.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <BulkActions
                total={manageableIds.length}
                selectedCount={selectedIds.size}
                allSelected={selectedIds.size === manageableIds.length}
                onToggleAll={toggleAll}
                onDeleteSelected={handleBulkDelete}
              />
            </div>
          )}
          {comments.map((c) => renderComment(c, 0))}
        </>
      )}
    </div>
  );
}
