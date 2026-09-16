'use client';
import { useState } from 'react';
import ReviewForm, {
  type EditReviewData,
} from '@/app/review/write/_components/review-form';

export default function ReviewEditButton({
  editReview,
}: {
  editReview: EditReviewData;
}) {
  const [open, setOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(
    null,
  );

  async function handleEditClick() {
    if (editReview.requiresPassword) {
      const password = window.prompt(
        'Please enter the password you used when posting.',
      );
      if (password === null) return;
      const res = await fetch(
        `/api/reviews/${editReview.id}/verify-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        },
      );
      const data = await res.json();
      if (!data.valid) {
        alert('Incorrect password.');
        return;
      }
      setVerifiedPassword(password);
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleEditClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          color: '#666',
          padding: 0,
        }}
      >
        Edit
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '40px 20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              border: '1px solid #dadce0',
              borderRadius: 8,
              padding: 24,
              width: '100%',
              maxWidth: 640,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  margin: 0,
                  color: '#202124',
                }}
              >
                Edit Review
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#5f6368',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <ReviewForm
              editReview={
                verifiedPassword
                  ? { ...editReview, verifiedPassword }
                  : editReview
              }
              onEditSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
