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
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

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

    setNewForm({
      title: '',
      brand: '',
      price: '',
      description: '',
      inclusions: [],
    });
    setNewImage(null);
    setNewImagePreview(null);
    setAdding(false);
    load();
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
        <button
          onClick={() => {
            setAdding(true);
            setAddError(null);
          }}
          style={btnStyle('#191919', '#fff')}
        >
          {isSlides ? '+ Add Slide' : '+ Add Product'}
        </button>
      </div>

      {/* 추가 폼 */}
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
            <label style={labelStyle}>Image (optional)</label>
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              isSlide={isSlides}
              onUpdated={() => load()}
              onDeleted={() => handleDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
