'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { type Product, btnStyle } from './types';

export default function ProductRow({
  product,
  isSlide,
  onUpdated,
  onDeleted,
  onEdit,
  isExpanded,
}: {
  product: Product;
  isSlide?: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
  onEdit: () => void;
  isExpanded: boolean;
}) {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const [imgHover, setImgHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgSaved, setImgSaved] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

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

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ede8de',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 이미지 영역 - 클릭하면 썸네일 변경 */}
      {localExpanded && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3/4',
            backgroundColor: '#f5f2ec',
            cursor: 'pointer',
          }}
          onClick={() => imgInputRef.current?.click()}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="240px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: '#ccc',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: 10, letterSpacing: '1px' }}>
                No Image
              </span>
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
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid #e8d9b8',
                  borderTopColor: '#c9a96e',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            </div>
          )}
          {imgHover && !uploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              클릭하여 이미지 변경
            </div>
          )}
          {imgSaved && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(201,169,110,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
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
      )}

      {/* 정보 영역 */}
      <div
        style={{
          padding: '14px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          gap: 12,
        }}
      >
        {/* 왼쪽: 텍스트 + 버튼 */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1a1a1a',
              lineHeight: 1.4,
            }}
          >
            {product.title}
          </p>
          {!isSlide && (
            <>
              <p style={{ fontSize: 11, color: '#aaa' }}>{product.brand}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#c9a96e' }}>
                ₩{product.price.toLocaleString()}
              </p>
            </>
          )}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 8,
              alignItems: 'center',
            }}
          >
            <button
              onClick={onEdit}
              style={btnStyle('transparent', '#888', '#e0d8c8')}
            >
              Edit
            </button>
            {product.imageUrl && (
              <button
                onClick={handleImgDelete}
                style={btnStyle('transparent', '#888', '#e0d8c8')}
              >
                Remove Img
              </button>
            )}
            <button
              onClick={onDeleted}
              style={{ ...btnStyle('transparent', '#ef4444', '#ef4444') }}
            >
              Delete
            </button>
          </div>
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

        {/* 오른쪽: 펼치기 버튼 + 썸네일 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setLocalExpanded((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              color: '#aaa',
              padding: '2px 4px',
            }}
          >
            {localExpanded ? '▲접기' : '▼펼치기'}
          </button>
          {!localExpanded && product.imageUrl && (
            <div
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
