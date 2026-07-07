'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MagazineDetailView from '@/components/magazine-detail-view';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #e0e0e0',
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
  marginBottom: 6,
};

export default function MagazineWriteForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coverPreviewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );
  const galleryPreviewUrls = useMemo(
    () => galleryFiles.map((f) => URL.createObjectURL(f)),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [coverPreviewUrl, galleryPreviewUrls]);

  async function handlePublish() {
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and content.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/magazine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, published: true }),
      });
      if (!res.ok) {
        alert((await res.json()).error ?? 'Failed to publish.');
        return;
      }
      const magazine = await res.json();

      if (coverFile || galleryFiles.length > 0) {
        const fd = new FormData();
        if (coverFile) fd.append('cover', coverFile);
        galleryFiles.forEach((f) => fd.append('images', f));
        const imgRes = await fetch(`/magazine/${magazine.id}/images`, {
          method: 'POST',
          body: fd,
        });
        if (!imgRes.ok) {
          alert('Post published, but image upload failed. You can add images later.');
        }
      }

      router.push(`/magazine/${magazine.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (preview) {
    return (
      <div>
        <div
          style={{
            position: 'sticky',
            top: 56,
            zIndex: 50,
            backgroundColor: '#fff',
            borderBottom: '1px solid #e8e8e8',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            onClick={() => setPreview(false)}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 13 }}
          >
            Back to Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={submitting}
            style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#191919', color: '#fff', cursor: 'pointer', fontSize: 13 }}
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
        <MagazineDetailView
          magazine={{
            title,
            content,
            imageUrl: coverPreviewUrl,
            createdAt: new Date(),
            images: galleryPreviewUrls.map((url, i) => ({ id: i, url })),
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}>Write Magazine</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Content *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 200, resize: 'vertical' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label style={labelStyle}>Detail Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setPreview(true)}
            disabled={!title.trim() && !content.trim()}
            style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#191919', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
