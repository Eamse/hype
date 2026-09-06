'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { type Product, btnStyle, labelStyle, inputStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';
import ProductRow from './product-row';
import { resizeImageFile, resizeImageFiles } from '@/lib/client-image-resize';

type Director = {
  id: number;
  number: string;
  name: string;
  instagram: string | null;
};

type Category = 'Photographers' | 'Casual Photoshoot';

const LOCATIONS: { label: string; value: 'Jeju' | 'Seoul' }[] = [
  { label: '제주', value: 'Jeju' },
  { label: '서울', value: 'Seoul' },
];

async function uploadImage(file: File, key: string): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  fd.append('key', key);
  const res = await fetch('/api/images', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? '업로드 실패');
  return data.imageUrl as string;
}

// 어드민 화면에 잠깐 보여주는 미리보기용 — 실제 업로드 파일과 별개로,
// 화질은 신경 안 쓰고 최대한 작게(160px) 만들어서 화면이 안 느려지게 함
async function makeTinyPreview(file: File): Promise<string> {
  const tiny = await resizeImageFile(file, 160, 0.5);
  return URL.createObjectURL(tiny);
}

async function uploadDetailImages(
  files: File[],
  productId: number,
): Promise<void> {
  for (const file of files) {
    const fd = new FormData();
    fd.append('image', file);

    await fetch(`/api/products/${productId}/images`, {
      method: 'POST',
      body: fd,
    });
  }
}

function SectionHeader({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a96e, #b8965a)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {index}
      </span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#000', margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: '#8a8a8a', margin: '2px 0 0' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// 파일 선택 버튼 + 안내 문구를 하나로 묶은 업로드 컨트롤 — 실제 <input type="file">은
// 부모가 ref로 따로 렌더링하고, 여긴 그 ref를 클릭 트리거하는 역할만 함
function UploadDropzone({
  onClick,
  hint,
}: {
  onClick: () => void;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '14px 16px',
        borderRadius: 10,
        border: '1.5px dashed #d8c39a',
        background: '#fbf8f2',
        color: '#7a5520',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M12 16V4M12 4l-4 4M12 4l4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          클릭해서 이미지 선택
        </span>
        <span style={{ fontSize: 11, color: '#a08a5f' }}>{hint}</span>
      </span>
    </button>
  );
}

function DirectorPicker({
  directors,
  selected,
  onChange,
}: {
  directors: Director[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  if (directors.length === 0)
    return (
      <p style={{ fontSize: 12, color: '#000' }}>등록된 작가가 없습니다.</p>
    );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {directors.map((d) => (
        <label
          key={d.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(d.id)}
            onChange={() =>
              onChange(
                selected.includes(d.id)
                  ? selected.filter((x) => x !== d.id)
                  : [...selected, d.id],
              )
            }
          />
          <span style={{ color: '#c9a96e', fontWeight: 600, fontSize: 11 }}>
            {d.number}
          </span>
          {d.name}
          {d.instagram && (
            <span style={{ fontSize: 11, color: '#000' }}>{d.instagram}</span>
          )}
        </label>
      ))}
    </div>
  );
}

function sectionFor(category: Category, location: 'Jeju' | 'Seoul') {
  return `${category} in ${location}`;
}

export default function ProductPanel({ category }: { category: Category }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 추가 폼
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState<'' | 'Jeju' | 'Seoul'>('');
  const [newDirIds, setNewDirIds] = useState<number[]>([]);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [adding, setAdding] = useState(false);
  const addThumbRef = useRef<HTMLInputElement>(null);
  const addDetailRef = useRef<HTMLInputElement>(null);
  // 수정 모달
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const {
    selectedIds: selectedImageIds,
    toggleSelect: toggleSelectImage,
    toggleAll: toggleAllImages,
    clearSelection: clearImageSelection,
  } = useSelection(editingProduct?.images ?? []);
  const [editDirIds, setEditDirIds] = useState<number[]>([]);
  const [editDetailFiles, setEditDetailFiles] = useState<File[]>([]);
  const [editDetailPreviewUrls, setEditDetailPreviewUrls] = useState<string[]>(
    [],
  );
  const [editThumbFile, setEditThumbFile] = useState<File | null>(null);
  const [editThumbPreviewUrl, setEditThumbPreviewUrl] = useState<string | null>(
    null,
  );
  const [editSaving, setEditSaving] = useState(false);
  const editDetailRef = useRef<HTMLInputElement>(null);
  const editThumbRef = useRef<HTMLInputElement>(null);

  const { selectedIds, toggleSelect, toggleAll, clearSelection } =
    useSelection(products);

  async function loadProducts() {
    const results = await Promise.all(
      LOCATIONS.map(({ value }) =>
        fetch(
          `/api/products?section=${encodeURIComponent(sectionFor(category, value))}`,
        ).then((r) => r.json()),
      ),
    );
    setProducts(results.flatMap((d) => (Array.isArray(d) ? d : [])));
  }

  useEffect(() => {
    Promise.all([
      loadProducts(),
      fetch('/api/admin/wedding-photographers')
        .then((r) => r.json())
        .then((d) => setDirectors(Array.isArray(d) ? d : [])),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // 저장 전 상세 이미지 미리보기 — 원본 대신 작은 미리보기로 다시 만들어서
  // 화면에 많이 깔려도 안 느려지게 함
  useEffect(() => {
    let cancelled = false;
    Promise.all(editDetailFiles.map(makeTinyPreview)).then((urls) => {
      if (!cancelled) setEditDetailPreviewUrls(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [editDetailFiles]);

  // 저장 전 썸네일 미리보기도 동일하게 작은 버전으로
  useEffect(() => {
    if (!editThumbFile) {
      setEditThumbPreviewUrl(null);
      return;
    }
    let cancelled = false;
    makeTinyPreview(editThumbFile).then((url) => {
      if (!cancelled) setEditThumbPreviewUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [editThumbFile]);

  async function handleMove(
    group: Product[],
    index: number,
    direction: 'up' | 'down',
  ) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= group.length) return;
    const a = group[index];
    const b = group[targetIndex];
    await Promise.all([
      fetch(`/api/admin/products/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/products/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await loadProducts();
  }

  async function detailImageHandleMove(
    images: { id: number; url: string; order: number }[],
    index: number,
    direction: 'up' | 'down',
  ) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    if (!editingProduct) return;
    const a = images[index];
    const b = images[targetIndex];
    await Promise.all([
      fetch(`/api/products/${editingProduct.id}/images?imageId=${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/products/${editingProduct.id}/images?imageId=${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images
        .map((img) => {
          if (img.id === a.id) return { ...img, order: b.order };
          if (img.id === b.id) return { ...img, order: a.order };
          return img;
        })
        .sort((x, y) => x.order - y.order),
    });
  }

  async function handleBulkDelete() {
    await Promise.all(
      [...selectedIds].map((id) =>
        fetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
      ),
    );
    await loadProducts();
    clearSelection();
  }

  function buildTitle(ids: number[]) {
    return (
      directors
        .filter((d) => ids.includes(d.id))
        .map((d) => d.name)
        .join(' & ') || '(미등록)'
    );
  }

  async function handleAdd() {
    if (!newLocation) {
      alert('지역을 선택해주세요.');
      return;
    }
    if (newDirIds.length === 0) {
      alert('작가를 선택해주세요.');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionFor(category, newLocation),
          title: buildTitle(newDirIds),
        }),
      });
      if (!res.ok) {
        alert((await res.json()).error);
        return;
      }
      const product = await res.json();

      if (thumbFile) {
        const url = await uploadImage(
          thumbFile,
          `product_thumb_${product.id}_${Date.now()}`,
        );
        await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        });
      }
      if (detailFiles.length > 0)
        await uploadDetailImages(detailFiles, product.id);
      if (newDirIds.length > 0) {
        await fetch(`/api/admin/products/${product.id}/directors`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ directorIds: newDirIds }),
        });
      }

      await loadProducts();
      setIsAdding(false);
      setNewLocation('');
      setNewDirIds([]);
      setThumbFile(null);
      setThumbPreview(null);
      setDetailFiles([]);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('이 상품을 삭제할까요?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function openEdit(product: Product) {
    setEditingProduct(product);
    setEditDetailFiles([]);
    setEditThumbFile(null);
    const data = await fetch(`/api/admin/wedding-directors/${product.id}`).then(
      (r) => r.json(),
    );
    setEditDirIds(Array.isArray(data) ? data.map((d: Director) => d.id) : []);
  }

  async function handleEditSave() {
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      if (editThumbFile) {
        const url = await uploadImage(
          editThumbFile,
          `product_thumb_${editingProduct.id}_${Date.now()}`,
        );
        await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        });
      }
      await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: buildTitle(editDirIds) }),
      });
      if (editDetailFiles.length > 0)
        await uploadDetailImages(editDetailFiles, editingProduct.id);
      await fetch(`/api/admin/products/${editingProduct.id}/directors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directorIds: editDirIds }),
      });
      await loadProducts();
      setEditingProduct(null);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #000' }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#7a5520',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          PRODUCTS
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000' }}>
          {category}
        </h2>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          style={btnStyle('#000', '#fff')}
          onClick={() => setIsAdding(true)}
        >
          + 상품 추가
        </button>
        <button
          style={btnStyle('#fff', '#000', '#000')}
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? '▲ 전체 접기' : '▼ 전체 펼치기'}
        </button>
      </div>

      {/* 추가 폼 */}
      {isAdding && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #000',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a' }}>
            새 상품 등록
          </p>

          <div>
            <label style={labelStyle}>지역 *</label>
            <select
              style={inputStyle}
              value={newLocation}
              onChange={(e) =>
                setNewLocation(e.target.value as typeof newLocation)
              }
            >
              <option value="">선택</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>썸네일 이미지</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                style={btnStyle('transparent', '#000', '#000')}
                onClick={() => addThumbRef.current?.click()}
              >
                파일 선택
              </button>
              {thumbPreview && (
                <div
                  style={{
                    position: 'relative',
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={thumbPreview}
                    alt="thumb"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <input
                ref={addThumbRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const [resized, preview] = await Promise.all([
                      resizeImageFile(f),
                      makeTinyPreview(f),
                    ]);
                    setThumbFile(resized);
                    setThumbPreview(preview);
                  }
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>상세 이미지</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                style={btnStyle('transparent', '#000', '#000')}
                onClick={() => addDetailRef.current?.click()}
              >
                파일 선택
              </button>
              {detailFiles.length > 0 && (
                <span style={{ fontSize: 12, color: '#000' }}>
                  {detailFiles.length}개 선택됨
                </span>
              )}
              <input
                ref={addDetailRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={async (e) => {
                  setDetailFiles(
                    await resizeImageFiles(Array.from(e.target.files ?? [])),
                  );
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>연결 작가</label>
            <DirectorPicker
              directors={directors}
              selected={newDirIds}
              onChange={setNewDirIds}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={btnStyle('#000', '#fff')}
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? '등록 중...' : '등록'}
            </button>
            <button
              style={btnStyle('#fff', '#000', '#000')}
              onClick={() => {
                setIsAdding(false);
                setNewLocation('');
                setThumbFile(null);
                setThumbPreview(null);
                setDetailFiles([]);
                setNewDirIds([]);
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>
        )}
        {!loading && products.length === 0 && (
          <p style={{ fontSize: 13, color: '#000' }}>등록된 상품이 없습니다.</p>
        )}

        <BulkActions
          total={products.length}
          selectedCount={selectedIds.size}
          allSelected={
            selectedIds.size === products.length && products.length > 0
          }
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDelete}
        />

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
        >
          {LOCATIONS.map((loc) => {
            const group = products.filter(
              (p) => p.section === sectionFor(category, loc.value),
            );
            return (
              <div
                key={loc.value}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#7a5520',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  {loc.label} ({group.length})
                </p>
                {group.length === 0 && (
                  <p style={{ fontSize: 12, color: '#000' }}>
                    등록된 상품이 없습니다.
                  </p>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridTemplateRows: `repeat(${Math.ceil(group.length / 2)}, auto)`,
                    gridAutoFlow: 'column',
                    gap: 16,
                  }}
                >
                  {group.map((p, i) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      position={i + 1}
                      isExpanded={isExpanded}
                      isSelected={selectedIds.has(p.id)}
                      onToggleSelect={() => toggleSelect(p.id)}
                      onEdit={() => openEdit(p)}
                      onDeleted={() => handleDelete(p.id)}
                      onUpdated={loadProducts}
                      onMoveUp={() => handleMove(group, i, 'up')}
                      onMoveDown={() => handleMove(group, i, 'down')}
                      canMoveUp={i > 0}
                      canMoveDown={i < group.length - 1}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 수정 모달 */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProduct(null);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 32px',
                borderBottom: '1px solid #EEEEEE',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#7a5520',
                  letterSpacing: '2px',
                }}
              >
                상품 수정
              </p>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="닫기"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: '#000',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                overflowY: 'auto',
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div
                style={{
                  border: '1px solid #EEEEEE',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <SectionHeader
                  index="01"
                  title="썸네일 이미지"
                  description="목록/카드에 노출되는 대표 이미지 1장"
                />
                <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                  <div style={{ flex: 1 }}>
                    <UploadDropzone
                      onClick={() => editThumbRef.current?.click()}
                      hint={
                        editThumbFile
                          ? '새 파일로 교체됩니다 (저장 시 반영)'
                          : '1장 · JPG, PNG'
                      }
                    />
                    <input
                      ref={editThumbRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setEditThumbFile(await resizeImageFile(f));
                        e.target.value = '';
                      }}
                    />
                    {editThumbFile && (
                      <button
                        type="button"
                        onClick={() => setEditThumbFile(null)}
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#8a8a8a',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        선택 취소
                      </button>
                    )}
                  </div>
                  {(editThumbFile || editingProduct.imageUrl) && (
                    <div
                      style={{
                        flexShrink: 0,
                        position: 'relative',
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '1px solid #EEEEEE',
                      }}
                    >
                      {editThumbFile && editThumbPreviewUrl ? (
                        <img
                          src={editThumbPreviewUrl}
                          alt="thumb"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Image
                          src={editingProduct.imageUrl as string}
                          alt="thumb"
                          fill
                          quality={30}
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #EEEEEE',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <SectionHeader
                  index="02"
                  title="상세 이미지"
                  description="상품 상세 페이지 갤러리에 노출되는 사진들 (여러 장, 순서 변경 가능)"
                />
                <div style={{ marginTop: 14 }}>
                  <UploadDropzone
                    onClick={() => editDetailRef.current?.click()}
                    hint={
                      editDetailFiles.length > 0
                        ? `${editDetailFiles.length}개 선택됨 · 저장 시 기존 사진 뒤에 추가됩니다`
                        : '여러 장 선택 가능 · JPG, PNG'
                    }
                  />
                  <input
                    ref={editDetailRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      setEditDetailFiles(
                        await resizeImageFiles(
                          Array.from(e.target.files ?? []),
                        ),
                      );
                      e.target.value = '';
                    }}
                  />
                </div>
                {editDetailFiles.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      marginTop: 12,
                      padding: 10,
                      borderRadius: 10,
                      background: '#FAFAFA',
                    }}
                  >
                    {editDetailFiles.map((_file, idx) => (
                      <div
                        key={idx}
                        style={{ position: 'relative', width: 78, height: 78 }}
                      >
                        <img
                          src={editDetailPreviewUrls[idx] ?? ''}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditDetailFiles(
                              editDetailFiles.filter((_, i) => i !== idx),
                            )
                          }
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: 'none',
                            background: '#000',
                            color: '#fff',
                            fontSize: 11,
                            lineHeight: '18px',
                            cursor: 'pointer',
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
                            disabled={idx === 0}
                            onClick={() => {
                              const next = [...editDetailFiles];
                              [next[idx - 1], next[idx]] = [
                                next[idx],
                                next[idx - 1],
                              ];
                              setEditDetailFiles(next);
                            }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: 'none',
                              background: '#000',
                              color: '#fff',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={idx === editDetailFiles.length - 1}
                            onClick={() => {
                              const next = [...editDetailFiles];
                              [next[idx + 1], next[idx]] = [
                                next[idx],
                                next[idx + 1],
                              ];
                              setEditDetailFiles(next);
                            }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: 'none',
                              background: '#000',
                              color: '#fff',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {editingProduct.images.length > 0 && (
                  <p
                    style={{
                      marginTop: 20,
                      marginBottom: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#8a8a8a',
                      letterSpacing: '0.5px',
                    }}
                  >
                    등록된 사진 {editingProduct.images.length}장
                  </p>
                )}
                <BulkActions
                  total={editingProduct.images.length}
                  selectedCount={selectedImageIds.size}
                  allSelected={
                    selectedImageIds.size === editingProduct.images.length &&
                    editingProduct.images.length > 0
                  }
                  onToggleAll={toggleAllImages}
                  onDeleteSelected={async () => {
                    await Promise.all(
                      [...selectedImageIds].map((imageId) =>
                        fetch(
                          `/api/products/${editingProduct.id}/images?imageId=${imageId}`,
                          { method: 'DELETE' },
                        ),
                      ),
                    );
                    setEditingProduct({
                      ...editingProduct,
                      images: editingProduct.images.filter(
                        (i) => !selectedImageIds.has(i.id),
                      ),
                    });
                    clearImageSelection();
                  }}
                />
                {editingProduct.images.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 20,
                      flexWrap: 'wrap',
                      marginTop: 8,
                    }}
                  >
                    {editingProduct.images.map((img, idx) => (
                      <div
                        onClick={() => setPreviewUrl(img.url)}
                        key={img.id}
                        style={{
                          position: 'relative',
                          width: 120,
                          height: 120,
                          cursor: 'pointer',
                          border: '1px solid black',
                        }}
                      >
                        <Image
                          src={img.thumbUrl ?? img.url}
                          alt=""
                          fill
                          quality={30}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 2,
                            zIndex: 1,
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              detailImageHandleMove(
                                editingProduct.images,
                                idx,
                                'up',
                              );
                            }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: 'none',
                              background: '#000',
                              color: '#fff',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              detailImageHandleMove(
                                editingProduct.images,
                                idx,
                                'down',
                              );
                            }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: 'none',
                              background: '#000',
                              color: '#fff',
                              fontSize: 10,
                              cursor: 'pointer',
                            }}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(
                              `/api/products/${editingProduct.id}/images?imageId=${img.id}`,
                              { method: 'DELETE' },
                            );
                            setEditingProduct({
                              ...editingProduct,
                              images: editingProduct.images.filter(
                                (i) => i.id !== img.id,
                              ),
                            });
                          }}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: 'none',
                            background: '#000',
                            color: '#fff',
                            fontSize: 11,
                            lineHeight: '18px',
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                        <input
                          type="checkbox"
                          checked={selectedImageIds.has(img.id)}
                          onChange={() => toggleSelectImage(img.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            zIndex: 1,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {previewUrl && (
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0,0,0,0.8)',
                      zIndex: 2000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setPreviewUrl(null)}
                  >
                    <img
                      src={previewUrl}
                      alt=""
                      style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  border: '1px solid #EEEEEE',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <SectionHeader
                  index="03"
                  title="연결 작가"
                  description="이 상품에 소속된 작가를 선택하세요"
                />
                <div style={{ marginTop: 14 }}>
                  <DirectorPicker
                    directors={directors}
                    selected={editDirIds}
                    onChange={setEditDirIds}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '20px 32px',
                borderTop: '1px solid #EEEEEE',
              }}
            >
              <button
                style={btnStyle('#000', '#fff')}
                onClick={handleEditSave}
                disabled={editSaving}
              >
                {editSaving ? '저장 중...' : '저장'}
              </button>
              <button
                style={btnStyle('#fff', '#000', '#000')}
                onClick={() => setEditingProduct(null)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
