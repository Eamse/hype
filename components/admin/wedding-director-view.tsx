'use client';

import { useState, useEffect } from 'react';
import { type Product, btnStyle, labelStyle, inputStyle } from './types';

type WeddingPhotographer = {
  id: number;
  number: string;
  name: string;
  instagram: string | null;
  imageUrl: string | null;
};

type LinkedPhotographer = WeddingPhotographer & {
  packages: WeddingPackage[];
};

type WeddingPackage = {
  id: number;
  name: string;
  subtitle: string | null;
  priceSNS: number;
  priceNoSNS: number;
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail: string | null;
  inclusiveItems: string[];
};

export default function WeddingDirectorView({
  product,
  onBack,
}: {
  product: Product;
  onBack: () => void;
}) {
  const [allPhotographers, setAllPhotographers] = useState<
    WeddingPhotographer[]
  >([]);
  const [linked, setLinked] = useState<LinkedPhotographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<
    number | ''
  >('');
  const [activePackagePhotographerId, setActivePackagePhotographerId] =
    useState<number | null>(null);

  async function loadLinked() {
    const res = await fetch(`/api/admin/wedding-directors/${product.id}`);
    const data = await res.json();
    setLinked(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/wedding-photographers').then((r) => r.json()),
      fetch(`/api/admin/wedding-directors/${product.id}`).then((r) => r.json()),
    ])
      .then(([all, linkedData]) => {
        setAllPhotographers(Array.isArray(all) ? all : []);
        setLinked(Array.isArray(linkedData) ? linkedData : []);
      })
      .finally(() => setLoading(false));
  }, [product.id]);

  async function handleLink() {
    if (!selectedPhotographerId) return;
    const res = await fetch(`/api/admin/wedding-directors/${product.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photographerId: selectedPhotographerId }),
    });
    if (!res.ok) {
      alert('연결 실패');
      return;
    }
    await loadLinked();
    setSelectedPhotographerId('');
  }

  async function handleUnlink(photographerId: number) {
    if (!confirm('이 작가를 상품에서 제거할까요?')) return;
    const res = await fetch(
      `/api/admin/wedding-directors/${product.id}/${photographerId}`,
      { method: 'DELETE' },
    );
    if (!res.ok) {
      alert('제거 실패');
      return;
    }
    await loadLinked();
  }

  const unlinkedPhotographers = allPhotographers.filter(
    (p) => !linked.some((l) => l.id === p.id),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <button
          onClick={onBack}
          style={{
            ...btnStyle('transparent', '#000', '#e0d8c8'),
            marginBottom: 16,
          }}
        >
          ← 목록으로
        </button>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#7a5520',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          DIRECTOR 관리
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000' }}>
          {product.title}
        </h2>
      </div>

      {/* 작가 연결 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #000',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#3a1a2a',
            marginBottom: 12,
          }}
        >
          작가 연결
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedPhotographerId}
            onChange={(e) =>
              setSelectedPhotographerId(
                e.target.value ? Number(e.target.value) : '',
              )
            }
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="">작가 선택...</option>
            {unlinkedPhotographers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.number} {p.name}
              </option>
            ))}
          </select>
          <button
            style={btnStyle('#000', '#fff')}
            onClick={handleLink}
            disabled={!selectedPhotographerId}
          >
            연결
          </button>
        </div>
      </div>

      {/* 연결된 작가 목록 */}
      {loading ? (
        <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>
      ) : linked.length === 0 ? (
        <p style={{ fontSize: 13, color: '#000' }}>연결된 작가가 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {linked.map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid #000',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* 작가 행 */}
              <div
                style={{
                  padding: '14px 18px',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{ fontSize: 12, color: '#c9956a', fontWeight: 600 }}
                  >
                    {p.number}
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: '#000' }}
                  >
                    {p.name}
                  </span>
                  {p.instagram && (
                    <span style={{ fontSize: 12, color: '#000' }}>
                      {p.instagram}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={btnStyle('transparent', '#c9956a', '#000')}
                    onClick={() =>
                      setActivePackagePhotographerId(
                        activePackagePhotographerId === p.id ? null : p.id,
                      )
                    }
                  >
                    패키지 관리{' '}
                    {activePackagePhotographerId === p.id ? '▲' : '▼'}
                  </button>
                  <button
                    style={btnStyle('transparent', '#ef4444', '#ef4444')}
                    onClick={() => handleUnlink(p.id)}
                  >
                    연결 해제
                  </button>
                </div>
              </div>

              {/* 패키지 영역 (추후 확장) */}
              {activePackagePhotographerId === p.id && (
                <div
                  style={{
                    padding: '16px 18px',
                    background: '#fff',
                    borderTop: '1px solid #000',
                  }}
                >
                  <p style={{ fontSize: 12, color: '#000' }}>
                    패키지 관리 — 준비 중
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
