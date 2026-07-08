'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MagazineDetailView from '@/components/magazine-detail-view';
import TiptapEditor from '@/components/tiptap-editor';

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

type ExistingImage = { id: number; url: string };

export default function MagazineWriteForm({
  magazineId,
  initialTitle = '',
  initialContent = '',
  initialImageUrl = null,
  initialImages = [],
  initialPublished = true,
}: {
  magazineId?: number;
  initialTitle?: string;
  initialContent?: string;
  initialImageUrl?: string | null;
  initialImages?: ExistingImage[];
  initialPublished?: boolean;
}) {
  const router = useRouter();
  const isEdit = magazineId !== undefined;

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [published, setPublished] = useState(initialPublished);
  const existingImageUrl = initialImageUrl;
  const [existingImages, setExistingImages] = useState(initialImages);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

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

  async function handleDeleteExistingImage(imageId: number) {
    if (!magazineId) return;
    setDeletingImageId(imageId);
    try {
      const res = await fetch(
        `/magazine/${magazineId}/images?imageId=${imageId}`,
        {
          method: 'DELETE',
        },
      );
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert('Failed to delete image.');
      }
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and content.');
      return;
    }

    setSubmitting(true);
    try {
      let id = magazineId;

      if (isEdit) {
        const res = await fetch(`/api/magazine/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, published }),
        });
        if (!res.ok) {
          alert((await res.json()).error ?? 'Failed to save.');
          return;
        }
      } else {
        const res = await fetch('/api/magazine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, published }),
        });
        if (!res.ok) {
          alert((await res.json()).error ?? 'Failed to save.');
          return;
        }
        const magazine = await res.json();
        id = magazine.id;
      }

      if (coverFile || galleryFiles.length > 0) {
        const fd = new FormData();
        if (coverFile) fd.append('cover', coverFile);
        galleryFiles.forEach((f) => fd.append('images', f));
        const imgRes = await fetch(`/magazine/${id}/images`, {
          method: 'POST',
          body: fd,
        });
        if (!imgRes.ok) {
          alert('Saved, but image upload failed. You can try again.');
        }
      }

      router.push(`/magazine/${id}`);
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
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #e0e0e0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Back to Edit
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#191919',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {submitting ? 'Saving...' : published ? 'Publish' : 'Save Draft'}
          </button>
        </div>
        <MagazineDetailView
          magazine={{
            title,
            content,
            imageUrl: coverPreviewUrl ?? existingImageUrl,
            createdAt: new Date(),
            images: [
              ...existingImages,
              ...galleryPreviewUrls.map((url, i) => ({ id: `new-${i}`, url })),
            ],
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 20px 80px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}>
        {isEdit ? 'Edit Magazine' : 'Write Magazine'}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Content *</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div>
          <label style={labelStyle}>Cover Image</label>
          {existingImageUrl && !coverFile && (
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 6px' }}>
              Current cover set. Choose a new file to replace it.
            </p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            style={{ ...inputStyle, padding: '8px 10px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Detail Images</label>
          {existingImages.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 10,
              }}
            >
              {existingImages.map((img) => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <img
                    src={img.url}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    disabled={deletingImageId === img.id}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
            style={{ ...inputStyle, padding: '8px 10px' }}
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#333',
          }}
        >
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (visible to everyone)
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setPreview(true)}
            disabled={!title.trim() && !content.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#191919',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {submitting ? 'Saving...' : published ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
