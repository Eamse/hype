'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import Image from 'next/image';
import { type Product, btnStyle } from './types';
import { resizeImageFile } from '@/lib/client-image-resize';

export default function ProductRow({
  product,
  position,
  isExpanded,
  isSelected,
  onToggleSelect,
  onEdit,
  onDeleted,
  onUpdated,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  product: Product;
  position?: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const [imgHover, setImgHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgSaved, setImgSaved] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => setLocalExpanded(isExpanded));
  }, [isExpanded]);

  async function handleImgUpload(file: File) {
    setUploading(true);
    setImgError(null);
    try {
      const resized = await resizeImageFile(file);
      const fd = new FormData();
      fd.append('key', `product_thumb_${product.id}_${Date.now()}`);
      fd.append('image', resized);
      const res = await fetch('/api/images', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: data.imageUrl }),
      });
      setImgSaved(true);
      setTimeout(() => setImgSaved(false), 2000);
      onUpdated();
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #000', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      {/* 이미지 영역 (펼쳐진 상태) */}
      {localExpanded && (
        <div
          style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#fff', cursor: 'pointer' }}
          onClick={() => imgInputRef.current?.click()}
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.title} fill sizes="300px" quality={20} style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#000' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: 10, letterSpacing: '1px' }}>No Image</span>
            </div>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #000', borderTopColor: '#acacac', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
          {imgHover && !uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, color: '#fff', fontSize: 12, fontWeight: 600 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              클릭하여 이미지 변경
            </div>
          )}
          {imgSaved && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
              ✓
            </div>
          )}
          <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImgUpload(f); e.target.value = ''; }}
          />
        </div>
      )}

      {/* 정보 영역 */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        {/* 체크박스 */}
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} style={{ flexShrink: 0, marginTop: 2 }} />

        {/* 텍스트 + 버튼 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#000', lineHeight: 1.4 }}>
            {position != null && <span style={{ color: '#acacac', marginRight: 6 }}>{position}번</span>}
            {product.title}
          </p>
          {imgError && <p style={{ fontSize: 11, color: '#5c5c5c' }}>{imgError}</p>}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button onClick={onEdit} style={btnStyle('transparent', '#000', '#d9d9d9')}>수정</button>
            <button onClick={onDeleted} style={btnStyle('transparent', '#777777', '#e7e7e7')}>삭제</button>
          </div>
        </div>

        {/* 순서 이동 + 펼치기 버튼 + 접힌 상태 썸네일 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {(onMoveUp || onMoveDown) && (
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 4, cursor: canMoveUp ? 'pointer' : 'default', fontSize: 11, color: canMoveUp ? '#000' : '#bbb', padding: '2px 6px' }}
              >
                ▲
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 4, cursor: canMoveDown ? 'pointer' : 'default', fontSize: 11, color: canMoveDown ? '#000' : '#bbb', padding: '2px 6px' }}
              >
                ▼
              </button>
            </div>
          )}
          <button
            onClick={() => setLocalExpanded((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#000', padding: '2px 4px' }}
          >
            {localExpanded ? '▲접기' : '▼펼치기'}
          </button>
          {!localExpanded && product.imageUrl && (
            <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, overflow: 'hidden' }}>
              <Image src={product.imageUrl} alt={product.title} fill sizes="60px" quality={20} style={{ objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
