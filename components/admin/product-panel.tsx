'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  type Product,
  btnStyle,
  labelStyle,
  inputStyle,
  isProductArray,
} from './types';
import ProductRow from './product-row';
import { INCLUSIONS } from './types';

export default function ProductPanel({
  section,
}: {
  section:
    | 'Meet our Photographers in Jeju'
    | 'Meet our Photographer in Seoul'
    | 'Casual Photoshoot in Jeju'
    | 'Casual Photoshoot in Seoul';
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    inclusions: [] as string[],
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newDetailImages, setNewDetailImages] = useState<File[]>([]);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const addImgRef = useRef<HTMLInputElement>(null);
  const addDetailImgRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  // 편집 모달
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    brand: '',
    price: '',
    description: '',
    inclusions: [] as string[],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editSaveError, setEditSaveError] = useState<string | null>(null);
  const [editDetailUploading, setEditDetailUploading] = useState(false);
  const editDetailImgRef = useRef<HTMLInputElement>(null);

  const LABELS: Record<string, string> = {
    'Meet our Photographers in Jeju': 'Meet our Photographers in Jeju',
    'Meet our Photographer in Seoul': 'Meet our Photographer in Seoul',
    'Casual Photoshoot in Jeju': 'Casual Photoshoot in Jeju',
    'Casual Photoshoot in Seoul': 'Casual Photoshoot in Seoul',
  };
  const label = LABELS[section] ?? section;
  const isSlides = false;

  function load() {
    setRefreshKey((k) => k + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products?section=${section}`, { signal: controller.signal })
      .then((res) => {
        setLoadError(null);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!isProductArray(data)) throw new Error('Invalid response format');
        setProducts(data);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setLoadError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [section, refreshKey]);

  useEffect(() => {
    if (editingProduct) {
      const updated = products.find((p) => p.id === editingProduct.id);
      // eslint-disable-next-line
      if (updated) setEditingProduct(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  async function handleAdd() {
    if (!newForm.title.trim()) return;
    if (!isSlides && (!newForm.brand.trim() || !newForm.price)) return;

    const price = isSlides ? 0 : Number(newForm.price);
    if (!isSlides && (!Number.isFinite(price) || price < 0)) {
      setAddError('Please enter a valid price.');
      return;
    }

    setAddError(null);

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section,
        title: newForm.title.trim(),
        brand: isSlides ? '-' : newForm.brand.trim(),
        price,
        description: newForm.description,
        inclusions: newForm.inclusions,
      }),
    });

    if (!res.ok) {
      const data: unknown = await res.json();
      const msg =
        typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error: unknown }).error)
          : 'Failed to add item';
      setAddError(msg);
      return;
    }

    const created = (await res.json()) as { id: number };

    if (newImage) {
      const fd = new FormData();
      fd.append('key', `product_${created.id}`);
      fd.append('image', newImage);
      const imgRes = await fetch('/api/images', { method: 'POST', body: fd });
      if (imgRes.ok) {
        const imgData = (await imgRes.json()) as { imageUrl: string };
        await fetch(`/api/products/${created.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: imgData.imageUrl }),
        });
      }
    }
    for (const file of newDetailImages) {
      const fd = new FormData();
      fd.append('image', file);
      await fetch(`/api/products/${created.id}/images`, {
        method: 'POST',
        body: fd,
      });
    }

    setNewForm({
      title: '',
      brand: '',
      price: '',
      description: '',
      inclusions: [],
    });
    setNewImage(null);
    setNewImagePreview(null);
    setNewDetailImages([]);
    setAdding(false);
    load();
  }

  async function handleEditSave() {
    if (!editingProduct) return;
    if (!editForm.title.trim()) {
      setEditSaveError('Title is required.');
      return;
    }
    if (!isSlides) {
      const priceNum = Number(editForm.price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setEditSaveError('Invalid price.');
        return;
      }
    }
    setEditSaving(true);
    setEditSaveError(null);
    try {
      const body: Record<string, unknown> = {
        title: editForm.title.trim(),
        description: editForm.description,
        inclusions: editForm.inclusions,
      };
      if (!isSlides) {
        body.brand = editForm.brand.trim();
        body.price = Number(editForm.price);
      }
      const res = await fetch(`/api/products/${editingProduct.id}`, {
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
      setEditingProduct(null);
      load();
    } catch (e) {
      setEditSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleEditDetailImgUpload(file: File) {
    if (!editingProduct) return;
    setEditDetailUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await fetch(`/api/products/${editingProduct.id}/images`, {
        method: 'POST',
        body: fd,
      });
      load();
    } catch {
    } finally {
      setEditDetailUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      load();
    } else {
      alert('Failed to delete item. Please try again.');
    }
  }

  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title.toLocaleLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: '1px solid #ede8de',
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
            PRODUCTS
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-0.3px',
            }}
          >
            {label}
          </h2>
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {products.length} {isSlides ? 'slides' : 'products'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setAdding(true);
              setAddError(null);
            }}
            style={btnStyle('#191919', '#fff')}
          >
            {isSlides ? '+ Add Slide' : '+ Add Product'}
          </button>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            style={btnStyle('#191919', '#191919')}
          >
            {isExpanded ? '▲ 전체 접기' : '▼ 전체 펼치기'}
          </button>
        </div>
      </div>

      {/* 추가 폼 */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="제목 or 브랜드 검색"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 14,
          border: '1px solid black',
          borderRadius: 8,
          outline: 'none',
          marginBottom: 20,
          boxSizing: 'border-box',
        }}
      />
      {adding && (
        <div
          style={{
            background: '#fdfcfa',
            border: '1px solid #e8d9b8',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 2px 12px rgba(201,169,110,0.08)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#7a5520',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {isSlides ? 'New Slide' : 'New Product'}
          </p>
          {addError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 12,
                color: '#dc2626',
              }}
            >
              {addError}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isSlides ? '1fr' : '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <div>
              <label style={labelStyle}>
                {isSlides ? 'Slide Caption' : 'Title'}
              </label>
              <input
                value={newForm.title}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder={isSlides ? 'e.g. Spring 2025' : 'Product title'}
                style={inputStyle}
              />
            </div>
            {!isSlides && (
              <>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input
                    value={newForm.brand}
                    onChange={(e) =>
                      setNewForm((p) => ({ ...p, brand: e.target.value }))
                    }
                    placeholder="Brand name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Price (₩)</label>
                  <input
                    value={newForm.price}
                    onChange={(e) =>
                      setNewForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="500000"
                    type="number"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={newForm.description}
              onChange={(e) =>
                setNewForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe this product"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {!isSlides && (
            <div>
              <label style={labelStyle}>Inclusions</label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#555',
                }}
              >
                <input
                  type="checkbox"
                  checked={newForm.inclusions.length === INCLUSIONS.length}
                  onChange={(e) =>
                    setNewForm((p) => ({
                      ...p,
                      inclusions: e.target.checked ? [...INCLUSIONS] : [],
                    }))
                  }
                ></input>
                전체선택
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {INCLUSIONS.map((item) => (
                  <label
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newForm.inclusions.includes(item)}
                      onChange={(e) =>
                        setNewForm((p) => ({
                          ...p,
                          inclusions: e.target.checked
                            ? [...p.inclusions, item]
                            : p.inclusions.filter((i) => i !== item),
                        }))
                      }
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 이미지 선택 */}
          <div>
            <label style={labelStyle}>Image</label>
            <input
              ref={addImgRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setNewImage(f);
                  setNewImagePreview(URL.createObjectURL(f));
                }
                e.target.value = '';
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => addImgRef.current?.click()}
                style={btnStyle('transparent', '#555', '#ddd')}
              >
                {newImagePreview ? 'Change Image' : '+ Select Image'}
              </button>
              {newImagePreview && (
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
                    src={newImagePreview}
                    alt="preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              {newImagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setNewImage(null);
                    setNewImagePreview(null);
                  }}
                  style={{
                    fontSize: 11,
                    color: '#aaa',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {/* 상세 이미지 선택 */}
          <div>
            <label style={labelStyle}>Detail Images (optional)</label>
            <input
              ref={addDetailImgRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = e.target.files;
                if (files) setNewDetailImages(Array.from(files));
                e.target.value = '';
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => addDetailImgRef.current?.click()}
                style={btnStyle('transparent', '#555', '#ddd')}
              >
                {newDetailImages.length > 0
                  ? `${newDetailImages.length} files selected`
                  : '+ Select Detail Images'}
              </button>
            </div>
          </div>
          {/* 썸네일 이미지 선택 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={btnStyle('#191919', '#fff')}>
              Save
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setAddError(null);
                setNewForm({
                  title: '',
                  brand: '',
                  price: '',
                  description: '',
                  inclusions: [],
                });
                setNewImage(null);
                setNewImagePreview(null);
                setNewDetailImages([]);
              }}
              style={btnStyle('transparent', '#555', '#ddd')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 리스트 */}
      {loading ? (
        <div style={{ color: '#aaa', fontSize: 13, padding: '24px 0' }}>
          Loading...
        </div>
      ) : loadError ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '16px 20px',
            fontSize: 13,
            color: '#dc2626',
          }}
        >
          {loadError}
          <button
            onClick={() => load()}
            style={{
              marginLeft: 12,
              fontSize: 12,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#dc2626',
            }}
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            padding: '48px 0',
            textAlign: 'center',
            color: '#bbb',
            fontSize: 13,
          }}
        >
          {isSlides
            ? 'No slides yet. Click "+ Add Slide" to get started.'
            : 'No products yet. Click "+ Add Product" to get started.'}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: 16,
          }}
        >
          {filteredProducts.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              isSlide={isSlides}
              isExpanded={isExpanded}
              onUpdated={() => load()}
              onDeleted={() => handleDelete(p.id)}
              onEdit={() => {
                setEditingProduct(p);
                setEditForm({
                  title: p.title,
                  brand: p.brand,
                  price: String(p.price),
                  description: p.description ?? '',
                  inclusions: p.inclusions,
                });
                setEditSaveError(null);
              }}
            />
          ))}
        </div>
      )}

      {/* 편집 모달 */}
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
              padding: 32,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7a5520',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Edit Product
            </p>

            {editSaveError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#dc2626',
                }}
              >
                {editSaveError}
              </div>
            )}

            <div>
              <label style={labelStyle}>Title</label>
              <input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Title"
                style={inputStyle}
              />
            </div>

            {!isSlides && (
              <>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input
                    value={editForm.brand}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, brand: e.target.value }))
                    }
                    placeholder="Brand"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Price (₩)</label>
                  <input
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="Price"
                    type="number"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {!isSlides && (
              <div>
                <label style={labelStyle}>Inclusions</label>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  {INCLUSIONS.map((item) => (
                    <label
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editForm.inclusions.includes(item)}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            inclusions: e.target.checked
                              ? [...p.inclusions, item]
                              : p.inclusions.filter((i) => i !== item),
                          }))
                        }
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Detail Images</label>
              {editingProduct.images.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {editingProduct.images.map((img) => (
                    <div
                      key={img.id}
                      style={{ position: 'relative', width: 80, height: 80 }}
                    >
                      <Image
                        src={img.url}
                        alt="detail"
                        fill
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                      />
                      <button
                        onClick={async () => {
                          const productId = editingProduct?.id;
                          if (!productId) return;
                          await fetch(
                            `/api/products/${productId}/images?imageId=${img.id}`,
                            { method: 'DELETE' },
                          );
                          load();
                        }}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={editDetailImgRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach((f) =>
                      handleEditDetailImgUpload(f),
                    );
                  }
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => editDetailImgRef.current?.click()}
                disabled={editDetailUploading}
                style={btnStyle('transparent', '#555', '#ddd')}
              >
                {editDetailUploading ? 'Uploading...' : '+ Add Detail Images'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                style={btnStyle('#191919', '#fff')}
              >
                {editSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setEditSaveError(null);
                }}
                disabled={editSaving}
                style={btnStyle('transparent', '#555', '#ddd')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
