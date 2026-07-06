'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { type Product, btnStyle, labelStyle, inputStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';
import ProductRow from './product-row';

type Director = { id: number; number: string; name: string; instagram: string | null };

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

async function uploadDetailImages(files: File[], productId: number): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImage(files[i], `product_detail_${productId}_${Date.now()}_${i}`);
    await fetch('/api/admin/product-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, url }),
    });
  }
}

function DirectorPicker({ directors, selected, onChange }: { directors: Director[]; selected: number[]; onChange: (ids: number[]) => void }) {
  if (directors.length === 0) return <p style={{ fontSize: 12, color: '#999' }}>등록된 작가가 없습니다.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {directors.map((d) => (
        <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={selected.includes(d.id)}
            onChange={() => onChange(selected.includes(d.id) ? selected.filter((x) => x !== d.id) : [...selected, d.id])}
          />
          <span style={{ color: '#c9a96e', fontWeight: 600, fontSize: 11 }}>{d.number}</span>
          {d.name}
          {d.instagram && <span style={{ fontSize: 11, color: '#aaa' }}>{d.instagram}</span>}
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
  const [editDirIds, setEditDirIds] = useState<number[]>([]);
  const [editDetailFiles, setEditDetailFiles] = useState<File[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const editDetailRef = useRef<HTMLInputElement>(null);

  const { selectedIds, toggleSelect, toggleAll, clearSelection } = useSelection(products);

  async function loadProducts() {
    const results = await Promise.all(
      LOCATIONS.map(({ value }) =>
        fetch(`/api/products?section=${encodeURIComponent(sectionFor(category, value))}`).then((r) => r.json()),
      ),
    );
    setProducts(results.flatMap((d) => (Array.isArray(d) ? d : [])));
  }

  useEffect(() => {
    Promise.all([
      loadProducts(),
      fetch('/api/admin/wedding-photographers').then((r) => r.json()).then((d) => setDirectors(Array.isArray(d) ? d : [])),
    ]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function handleMove(group: Product[], index: number, direction: 'up' | 'down') {
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

  async function handleBulkDelete() {
    await Promise.all([...selectedIds].map((id) => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })));
    await loadProducts();
    clearSelection();
  }

  function buildTitle(ids: number[]) {
    return directors.filter((d) => ids.includes(d.id)).map((d) => d.name).join(' & ') || '(미등록)';
  }

  async function handleAdd() {
    if (!newLocation) { alert('지역을 선택해주세요.'); return; }
    if (newDirIds.length === 0) { alert('작가를 선택해주세요.'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionFor(category, newLocation), title: buildTitle(newDirIds) }),
      });
      if (!res.ok) { alert((await res.json()).error); return; }
      const product = await res.json();

      if (thumbFile) {
        const url = await uploadImage(thumbFile, `product_thumb_${product.id}_${Date.now()}`);
        await fetch(`/api/admin/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        });
      }
      if (detailFiles.length > 0) await uploadDetailImages(detailFiles, product.id);
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
    const data = await fetch(`/api/admin/wedding-directors/${product.id}`).then((r) => r.json());
    setEditDirIds(Array.isArray(data) ? data.map((d: Director) => d.id) : []);
  }

  async function handleEditSave() {
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: buildTitle(editDirIds) }),
      });
      if (editDetailFiles.length > 0) await uploadDetailImages(editDetailFiles, editingProduct.id);
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
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p style={{ fontSize: 10, letterSpacing: '2px', color: '#7a5520', fontWeight: 600, marginBottom: 6 }}>PRODUCTS</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{category}</h2>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={btnStyle('#191919', '#fff')} onClick={() => setIsAdding(true)}>+ 상품 추가</button>
        <button style={btnStyle('#fff', '#191919', '#ddd')} onClick={() => setIsExpanded((v) => !v)}>
          {isExpanded ? '▲ 전체 접기' : '▼ 전체 펼치기'}
        </button>
      </div>

      {/* 추가 폼 */}
      {isAdding && (
        <div style={{ background: '#fdfcfa', border: '1px solid #ede8de', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a' }}>새 상품 등록</p>

          <div>
            <label style={labelStyle}>지역 *</label>
            <select style={inputStyle} value={newLocation}
              onChange={(e) => setNewLocation(e.target.value as typeof newLocation)}>
              <option value="">선택</option>
              {LOCATIONS.map((loc) => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>썸네일 이미지</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" style={btnStyle('transparent', '#555', '#ddd')} onClick={() => addThumbRef.current?.click()}>파일 선택</button>
              {thumbPreview && (
                <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 6, overflow: 'hidden' }}>
                  <Image src={thumbPreview} alt="thumb" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <input ref={addThumbRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); } e.target.value = ''; }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>상세 이미지</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" style={btnStyle('transparent', '#555', '#ddd')} onClick={() => addDetailRef.current?.click()}>파일 선택</button>
              {detailFiles.length > 0 && <span style={{ fontSize: 12, color: '#666' }}>{detailFiles.length}개 선택됨</span>}
              <input ref={addDetailRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={(e) => { setDetailFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>연결 작가</label>
            <DirectorPicker directors={directors} selected={newDirIds} onChange={setNewDirIds} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnStyle('#191919', '#fff')} onClick={handleAdd} disabled={adding}>{adding ? '등록 중...' : '등록'}</button>
            <button style={btnStyle('#fff', '#666', '#ddd')} onClick={() => { setIsAdding(false); setNewLocation(''); setThumbFile(null); setThumbPreview(null); setDetailFiles([]); setNewDirIds([]); }}>취소</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <p style={{ fontSize: 13, color: '#999' }}>불러오는 중...</p>}
        {!loading && products.length === 0 && <p style={{ fontSize: 13, color: '#999' }}>등록된 상품이 없습니다.</p>}

        <BulkActions
          total={products.length}
          selectedCount={selectedIds.size}
          allSelected={selectedIds.size === products.length && products.length > 0}
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDelete}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {LOCATIONS.map((loc) => {
            const group = products.filter((p) => p.section === sectionFor(category, loc.value));
            return (
              <div key={loc.value} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7a5520', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {loc.label} ({group.length})
                </p>
                {group.length === 0 && <p style={{ fontSize: 12, color: '#999' }}>등록된 상품이 없습니다.</p>}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gridTemplateRows: `repeat(${Math.ceil(group.length / 2)}, auto)`,
                  gridAutoFlow: 'column',
                  gap: 16,
                }}>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#7a5520', letterSpacing: '2px' }}>상품 수정</p>

            <div>
              <label style={labelStyle}>상세 이미지 추가</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" style={btnStyle('transparent', '#555', '#ddd')} onClick={() => editDetailRef.current?.click()}>파일 선택</button>
                {editDetailFiles.length > 0 && <span style={{ fontSize: 12, color: '#666' }}>{editDetailFiles.length}개 선택됨</span>}
                <input ref={editDetailRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={(e) => { setEditDetailFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }}
                />
              </div>
              {editingProduct.images.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {editingProduct.images.map((img) => (
                    <div key={img.id} style={{ position: 'relative', width: 48, height: 48 }}>
                      <Image src={img.url} alt="" fill style={{ objectFit: 'cover', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>연결 작가</label>
              <DirectorPicker directors={directors} selected={editDirIds} onChange={setEditDirIds} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnStyle('#191919', '#fff')} onClick={handleEditSave} disabled={editSaving}>{editSaving ? '저장 중...' : '저장'}</button>
              <button style={btnStyle('#fff', '#666', '#ddd')} onClick={() => setEditingProduct(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
