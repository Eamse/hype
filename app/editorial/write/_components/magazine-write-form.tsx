'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MagazineDetailView from '@/components/magazine-detail-view';
import TiptapEditor, {
  type TiptapEditorHandle,
} from '@/components/tiptap-editor';
import { resizeImageFile } from '@/lib/client-image-resize';
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #000',
  fontSize: 14,
};
const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1.5px solid #dc2626',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#000',
  marginBottom: 6,
};
type ExistingImage = {
  id: number;
  url: string;
};
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
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ title?: boolean; content?: boolean }>(
    {},
  );
  const [published, setPublished] = useState(initialPublished);
  const existingImageUrl = initialImageUrl;
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverCleared, setCoverCleared] = useState(false);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragContentIdx, setDragContentIdx] = useState<number | null>(null);
  const coverPreviewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );
  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);
  function moveContentImage(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= contentImages.length) return;
    editorRef.current?.moveImage(idx, to);
  }
  function removeContentImage(idx: number) {
    editorRef.current?.removeImage(idx);
  }
  function handleContentDrop(targetIdx: number) {
    if (dragContentIdx === null || dragContentIdx === targetIdx) {
      setDragContentIdx(null);
      return;
    }
    editorRef.current?.moveImage(dragContentIdx, targetIdx);
    setDragContentIdx(null);
  }
  function handleCancel() {
    if (
      (title.trim() || content.trim()) &&
      !window.confirm('Discard changes and leave this page?')
    ) {
      return;
    }
    router.push(isEdit ? `/editorial/${magazineId}` : '/editorial');
  }
  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setErrors({ title: !title.trim(), content: !content.trim() });
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
          body: JSON.stringify({
            title,
            content,
            published,
            ...(coverCleared && !coverFile && { imageUrl: null }),
          }),
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
      if (coverFile) {
        const fd = new FormData();
        fd.append('cover', coverFile);
        const imgRes = await fetch(`/editorial/${id}/images`, {
          method: 'POST',
          body: fd,
        });
        if (!imgRes.ok) {
          alert('Saved, but cover image upload failed. You can try again.');
        }
      }
      router.push(`/editorial/${id}`);
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
            borderBottom: '1px solid #000',
            padding: '12px 20px',
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              padding: '0 60px 0',
            }}
          >
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #000',
                background: '#fff',
                color: '#e03131',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPreview(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #000',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#000',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {submitting
                  ? 'Saving...'
                  : published
                    ? 'Publish'
                    : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
        <MagazineDetailView
          magazine={{
            title,
            content,
            imageUrl: coverPreviewUrl ?? existingImageUrl,
            createdAt: new Date(),
            images: initialImages,
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
            style={errors.title ? errorInputStyle : inputStyle}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: false }));
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Content *</label>
          <div
            style={{
              border: errors.content ? '1.5px solid #dc2626' : 'none',
              borderRadius: 6,
            }}
          >
            <TiptapEditor
              ref={editorRef}
              content={content}
              onChange={(v) => {
                setContent(v);
                setErrors((prev) => ({ ...prev, content: false }));
              }}
              onImagesChange={setContentImages}
            />
          </div>
        </div>

        {contentImages.length > 0 && (
          <div>
            <label style={labelStyle}>Images in Content</label>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>
              {contentImages.length} image(s) in this article. Drag or use the
              arrows to reorder, × to remove.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {contentImages.map((url, idx) => (
                <div
                  key={url + idx}
                  draggable
                  onDragStart={() => setDragContentIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleContentDrop(idx)}
                  style={{ position: 'relative', cursor: 'grab' }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid #000',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeContentImage(idx)}
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
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => moveContentImage(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '1px solid #000',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: 10,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveContentImage(idx, 1)}
                      disabled={idx === contentImages.length - 1}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '1px solid #000',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: 10,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label style={labelStyle}>Cover Image</label>
          {(coverPreviewUrl || (existingImageUrl && !coverCleared)) && (
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>
              {coverFile
                ? `Uploaded: ${coverFile.name}`
                : 'Current cover image'}
            </p>
          )}
          {(coverPreviewUrl || (existingImageUrl && !coverCleared)) && (
            <div style={{ position: 'relative', width: 120, marginBottom: 8 }}>
              <img
                src={coverPreviewUrl ?? existingImageUrl ?? ''}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid #000',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (coverFile) setCoverFile(null);
                  else setCoverCleared(true);
                }}
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
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              setCoverFile(file ? await resizeImageFile(file) : null);
              if (file) setCoverCleared(false);
              e.target.value = '';
            }}
            style={{ ...inputStyle, padding: '8px 10px' }}
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#000',
          }}
        >
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (visible to everyone)
        </label>

        <div
          style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              border: '1px solid #000',
              background: '#fff',
              color: '#e03131',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPreview(true)}
              disabled={!title.trim() && !content.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid #000',
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
                background: '#000',
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
    </div>
  );
}
