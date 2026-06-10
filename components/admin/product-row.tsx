'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { type Product, btnStyle, inputStyle } from './types';

export default function ProductRow({
  product,
  isSlide,
  onUpdated,
  onDeleted,
}: {
  product: Product;
  isSlide?: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: product.title,
    brand: product.brand,
    price: String(product.price),
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgSaved, setImgSaved] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  async function handleSave() {
    if (!form.title.trim()) {
      setSaveError('Title is required.');
      return;
    }
    if (!isSlide) {
      const priceNum = Number(form.price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setSaveError('Invalid price.');
        return;
      }
    }

    setSaving(true);
    setSaveError(null);
    try {
      const body: Record<string, unknown> = { title: form.title.trim() };
      if (!isSlide) {
        body.brand = form.brand.trim();
        body.price = Number(form.price);
      }
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data: unknown = await res.json();
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Save failed';
        throw new Error(msg);
      }
      setEditing(false);
      onUpdated();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleImgUpload(file: File) {
    setUploading(true);
    setImgError(null);
    try {
      const key = `product_${product.id}`;
      const fd = new FormData();
      fd.append('key', key);
      fd.append('image', file);
      const res = await fetch('/api/images', { method: 'POST', body: fd });
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Upload failed';
        throw new Error(msg);
      }
      const imageUrl = (data as { imageUrl: string }).imageUrl;
      const patchRes = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      if (!patchRes.ok) throw new Error('Failed to link image');
      setImgSaved(true);
      setTimeout(() => setImgSaved(false), 2000);
      onUpdated();
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleImgDelete() {
    setImgError(null);
    try {
      await fetch(`/api/images?key=product_${product.id}&index=0`, {
        method: 'DELETE',
      });
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: null }),
      });
      if (!res.ok) throw new Error('Failed to remove image');
      onUpdated();
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Failed to remove image');
    }
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
    setForm({
      title: product.title,
      brand: product.brand,
      price: String(product.price),
    });
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 이미지 */}
        <div
          style={{
            position: 'relative',
            width: 72,
            height: 72,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            flexShrink: 0,
            border: '1px solid #eee',
            cursor: 'pointer',
          }}
          onClick={() => imgInputRef.current?.click()}
          title="Click to change image"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="72px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ccc',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
          {uploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid #ddd',
                  borderTopColor: '#191919',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            </div>
          )}
          {imgSaved && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(34,197,94,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
              }}
            >
              ✓
            </div>
          )}
          <input
            ref={imgInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImgUpload(f);
              e.target.value = '';
            }}
          />
        </div>

        {/* 정보 */}
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {saveError && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '6px 10px',
                    borderRadius: 5,
                  }}
                >
                  {saveError}
                </div>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isSlide ? '1fr' : '1fr 1fr 1fr',
                  gap: 8,
                }}
              >
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder={isSlide ? 'Slide Caption' : 'Title'}
                  style={inputStyle}
                />
                {!isSlide && (
                  <>
                    <input
                      value={form.brand}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, brand: e.target.value }))
                      }
                      placeholder="Brand"
                      style={inputStyle}
                    />
                    <input
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="Price"
                      type="number"
                      min="0"
                      style={inputStyle}
                    />
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={btnStyle('#191919', '#fff')}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  style={btnStyle('transparent', '#555', '#ddd')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#191919',
                  marginBottom: 2,
                }}
              >
                {product.title}
              </p>
              {!isSlide && (
                <>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>
                    {product.brand}
                  </p>
                  <p
                    style={{ fontSize: 13, fontWeight: 700, color: '#191919' }}
                  >
                    ₩{product.price.toLocaleString()}
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {/* 액션 */}
        {!editing && (
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => {
                setEditing(true);
                setSaveError(null);
              }}
              style={btnStyle('transparent', '#191919', '#191919')}
            >
              Edit
            </button>
            {product.imageUrl && (
              <button
                onClick={handleImgDelete}
                style={btnStyle('transparent', '#888', '#ddd')}
              >
                Remove Img
              </button>
            )}
            <button
              onClick={onDeleted}
              style={btnStyle('transparent', '#ef4444', '#ef4444')}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 이미지 에러 */}
      {imgError && (
        <div
          style={{
            fontSize: 11,
            color: '#dc2626',
            background: '#fef2f2',
            padding: '6px 10px',
            borderRadius: 5,
          }}
        >
          {imgError}
        </div>
      )}
    </div>
  );
}
