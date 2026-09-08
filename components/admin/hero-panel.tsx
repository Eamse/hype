'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { resizeImageFile } from '@/lib/client-image-resize';

const MAX_HERO = 6;

export default function HeroPanel({ brand }: { brand: 'wedding' | 'snap' }) {
  const heroKey = brand === 'wedding' ? 'hero_wedding' : 'hero_snap';
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
        const hero = d[heroKey];
        setImages(Array.isArray(hero) ? (hero as string[]) : []);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError('Failed to load images.');
      });
    return () => controller.abort();
  }, [heroKey]);

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
        const resized = await resizeImageFile(file);
        const fd = new FormData();
        fd.append('key', heroKey);
        fd.append('image', resized);
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
      const res = await fetch(`/api/images?key=${heroKey}&index=${index}`, {
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
      {/* 섹션 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: '1px solid #000',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: '2px',
              color: '#7a5520',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {brand === 'wedding' ? 'HYPE WEDDING' : 'HYPE SNAP'}
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#000',
              letterSpacing: '-0.3px',
            }}
          >
            Hero Images
          </h2>
          <p style={{ fontSize: 12, color: '#000', marginTop: 4 }}>
            Up to {MAX_HERO} images · shown as swipe carousel on main page
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            color: '#7a5520',
            fontWeight: 600,
            background: '#faf7f0',
            border: '1px solid #000',
            borderRadius: 20,
            padding: '4px 14px',
          }}
        >
          {images.length} / {MAX_HERO}
        </span>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
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
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: MAX_HERO }).map((_, i) => {
          const url = images[i];
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: url ? '1.5px solid #000' : '1.5px dashed #ddd5c5',
                boxShadow: url ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {url && typeof url === 'string' ? (
                <>
                  {URL.canParse(url) && (
                    <Image
                      src={url}
                      alt={`hero-${i}`}
                      fill
                      sizes="200px"
                      quality={20}
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                  <button
                    onClick={() => handleDelete(i)}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: 'none',
                      backdropFilter: 'blur(4px)',
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: '#000',
                  }}
                >
                  {i < images.length || uploading ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: '2px solid #000',
                        borderTopColor: '#c9a96e',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  ) : (
                    <>
                      <span style={{ fontSize: 18, opacity: 0.3 }}>+</span>
                      <span style={{ fontSize: 10, letterSpacing: '0.5px' }}>
                        Empty
                      </span>
                    </>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_HERO}
          style={{
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #c9a96e, #b8965a)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(201,169,110,0.3)',
          }}
        >
          {uploading ? 'Uploading...' : '+ Add Images'}
        </button>
        <span style={{ fontSize: 12, color: '#000' }}>
          JPG, PNG, WEBP, GIF · max 10 MB
        </span>
      </div>
    </div>
  );
}
