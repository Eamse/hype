'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { btnStyle } from './types';

const MAX_HERO = 10;

export default function HeroPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 목록 불러오기
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/images', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load images');
        return r.json();
      })
      .then((d: Record<string, unknown>) => {
        const hero = d['hero'];
        setImages(Array.isArray(hero) ? (hero as string[]) : []);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError('Failed to load images.');
      });
    return () => controller.abort();
  }, []);

  // 파일 선택 시 업로드
  async function handleFiles(files: FileList) {
    const remaining = MAX_HERO - images.length;
    if (remaining <= 0) {
      setError('Maximum 10 images reached.');
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setError(null);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append('key', 'hero');
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
        uploaded.push((data as { imageUrl: string }).imageUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  // 개별 이미지 삭제
  async function handleDelete(index: number) {
    if (!confirm('Delete this image?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/images?key=hero&index=${index}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setImages((prev) => prev.filter((_, i) => i !== index));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        Hero Images
      </h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Up to {MAX_HERO} images · shown as swipe carousel on main page
      </p>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13,
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      {/* 이미지 그리드 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {Array.from({ length: MAX_HERO }).map((_, i) => {
          const url = images[i];
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                width: 120,
                aspectRatio: '3/4',
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                border: '1.5px dashed #ddd',
                flexShrink: 0,
              }}
            >
              {url && typeof url === 'string' ? (
                <>
                  <Image
                    src={url}
                    alt={`hero-${i}`}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleDelete(i)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    ×
                  </button>
                </>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ccc',
                    fontSize: 11,
                  }}
                >
                  {i < images.length || uploading ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: '2px solid #e0e0e0',
                        borderTopColor: '#191919',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  ) : (
                    'Empty'
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 업로드 버튼 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_HERO}
          style={btnStyle('#191919', '#fff')}
        >
          {uploading ? 'Uploading...' : '+ Add Images'}
        </button>
        <span style={{ fontSize: 12, color: '#aaa' }}>
          {images.length} / {MAX_HERO} · JPG, PNG, WEBP, GIF (max 50 MB)
        </span>
      </div>
    </div>
  );
}
