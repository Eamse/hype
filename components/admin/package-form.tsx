'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { inputStyle, labelStyle, btnStyle } from './types';
import PackagePreview from './package-preview';
import {
  toggleId,
  type PkgForm,
  type Inclusion,
  type Addon,
  type Partner,
  type PackageImage,
} from './wedding-photographer-types';
import { resizeImageFile } from '@/lib/client-image-resize';

// ── Package Form ──────────────────────────────────────────────────────────────
export default function PackageForm({
  form,
  onChange,
  allInclusions,
  allAddons,
  allPartners,
  onSave,
  onCancel,
  saving,
  hideButtons = false,
  packageId,
  initialImages = [],
}: {
  form: PkgForm;
  onChange: (f: PkgForm) => void;
  allInclusions: Inclusion[];
  allAddons: Addon[];
  allPartners: Partner[];
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  hideButtons?: boolean;
  // 기존 패키지 수정일 때만 전달됨 — 새 패키지 작성 중엔 id가 없어 썸네일 업로드 불가
  packageId?: number;
  // 유저페이지 갤러리가 실제로 읽는 건 Package.images라서, 상세 이미지는
  // Product가 아니라 여기(Package) 단위로 관리해야 화면에 반영됨
  initialImages?: PackageImage[];
}) {
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);

  const detailInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PackageImage[]>(initialImages);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);

  async function handleDetailUpload(files: File[]) {
    if (!packageId || files.length === 0) return;
    setImagesUploading(true);
    setImagesError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch(`/api/packages/${packageId}/images`, {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? '업로드 실패');
        setImages((prev) => [...prev, data]);
      }
    } catch (e) {
      setImagesError(e instanceof Error ? e.message : '업로드 실패');
    } finally {
      setImagesUploading(false);
    }
  }

  async function handleDetailDelete(imageId: number) {
    if (!packageId) return;
    await fetch(`/api/packages/${packageId}/images?imageId=${imageId}`, {
      method: 'DELETE',
    });
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function handleDetailMove(index: number, direction: 'up' | 'down') {
    if (!packageId) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const a = images[index];
    const b = images[targetIndex];
    await Promise.all([
      fetch(`/api/packages/${packageId}/images?imageId=${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/packages/${packageId}/images?imageId=${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    setImages((prev) =>
      prev
        .map((img) => {
          if (img.id === a.id) return { ...img, order: b.order };
          if (img.id === b.id) return { ...img, order: a.order };
          return img;
        })
        .sort((x, y) => x.order - y.order),
    );
  }

  async function handleThumbUpload(file: File) {
    if (!packageId) return;
    setThumbUploading(true);
    setThumbError(null);
    try {
      const resized = await resizeImageFile(file);
      const fd = new FormData();
      fd.append('key', `package_thumb_${packageId}_${Date.now()}`);
      fd.append('image', resized);
      const res = await fetch('/api/images', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      await fetch(`/api/admin/packages/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: data.imageUrl }),
      });
      onChange({ ...form, thumbnailUrl: data.imageUrl });
    } catch (e) {
      setThumbError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setThumbUploading(false);
    }
  }
  const hmuList = allPartners.filter((p) => p.role === 'hmu');
  const dressList = allPartners.filter((p) => p.role === 'dress');
  const suitList = allPartners.filter((p) => p.role === 'suit');
  const bouquetList = allPartners.filter((p) => p.role === 'bouquet');
  const [showPreview, setShowPreview] = useState(false);

  const partnerRows = [
    form.hmuId
      ? {
          role: 'Hair & Makeup',
          name: allPartners.find((p) => p.id === form.hmuId)?.name ?? '',
        }
      : null,
    form.dressId
      ? {
          role: 'Dress',
          name: allPartners.find((p) => p.id === form.dressId)?.name ?? '',
        }
      : null,
    form.suitId
      ? {
          role: 'Suit',
          name: allPartners.find((p) => p.id === form.suitId)?.name ?? '',
        }
      : null,
    form.bouquetId
      ? {
          role: 'Bouquet',
          name: allPartners.find((p) => p.id === form.bouquetId)?.name ?? '',
        }
      : null,
  ].filter(Boolean) as { role: string; name: string }[];

  const sectionTitle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: '#c9a96e',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #000',
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}
      >
        <button
          type="button"
          style={btnStyle('#fff', '#3a1a2a', '#000')}
          onClick={() => setShowPreview(true)}
        >
          미리보기
        </button>
      </div>

      {/* 썸네일 */}
      {packageId ? (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>썸네일</label>
          <div
            style={{
              position: 'relative',
              width: 140,
              aspectRatio: '4/5',
              border: '1px solid #000',
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#f5f5f5',
            }}
            onClick={() => thumbInputRef.current?.click()}
          >
            {form.thumbnailUrl ? (
              <Image src={form.thumbnailUrl} alt="썸네일" fill sizes="140px" quality={30} style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888' }}>
                이미지 없음
              </div>
            )}
            {thumbUploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #000', borderTopColor: '#c9a96e', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleThumbUpload(f);
                e.target.value = '';
              }}
            />
          </div>
          {thumbError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{thumbError}</p>}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          패키지를 먼저 저장하면 썸네일을 등록할 수 있어요.
        </p>
      )}

      {/* 상세 이미지(갤러리) — 유저페이지 상세 갤러리에 실제로 노출됨 */}
      {packageId ? (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>상세 이미지 (갤러리, 여러 장 · 순서 변경 가능)</label>
          <div
            style={{
              border: '1px dashed #000',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              color: '#555',
              cursor: 'pointer',
              width: 'fit-content',
            }}
            onClick={() => detailInputRef.current?.click()}
          >
            {imagesUploading ? '업로드 중...' : '클릭해서 이미지 선택 (여러 장 가능)'}
          </div>
          <input
            ref={detailInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) handleDetailUpload(files);
              e.target.value = '';
            }}
          />
          {imagesError && (
            <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
              {imagesError}
            </p>
          )}
          {images.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 10,
              }}
            >
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    position: 'relative',
                    width: 90,
                    height: 90,
                    border: '1px solid #000',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={img.thumbUrl ?? img.webUrl}
                    alt=""
                    fill
                    sizes="90px"
                    quality={30}
                    style={{ objectFit: 'cover' }}
                  />
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
                      onClick={() => handleDetailMove(idx, 'up')}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: 'none',
                        background: '#000',
                        color: '#fff',
                        fontSize: 9,
                        cursor: 'pointer',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDetailMove(idx, 'down')}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: 'none',
                        background: '#000',
                        color: '#fff',
                        fontSize: 9,
                        cursor: 'pointer',
                      }}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDetailDelete(img.id)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: 'none',
                      background: '#000',
                      color: '#fff',
                      fontSize: 10,
                      lineHeight: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          패키지를 먼저 저장하면 상세 이미지를 등록할 수 있어요.
        </p>
      )}

      {/* 기본 정보 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>패키지명 *</label>
          <input
            style={inputStyle}
            value={form.name}
            placeholder="Package A"
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>서브타이틀</label>
          <input
            style={inputStyle}
            value={form.subtitle}
            placeholder="Jeju and You Main & Nervi"
            onChange={(e) => onChange({ ...form, subtitle: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>SNS 동의 가격 (USD)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.priceSNS}
            placeholder="2690"
            onChange={(e) => onChange({ ...form, priceSNS: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>SNS 비동의 가격 (USD)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.priceNoSNS}
            placeholder="2830"
            onChange={(e) => onChange({ ...form, priceNoSNS: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>촬영 시간</label>
          <input
            style={inputStyle}
            value={form.shootingTime}
            placeholder="4 hours"
            onChange={(e) =>
              onChange({ ...form, shootingTime: e.target.value })
            }
          />
        </div>
        <div>
          <label style={labelStyle}>장소 수</label>
          <input
            style={inputStyle}
            value={form.locations}
            placeholder="3 sites"
            onChange={(e) => onChange({ ...form, locations: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>원본 사진 수</label>
          <input
            style={inputStyle}
            value={form.originalPhotos}
            placeholder="800+"
            onChange={(e) =>
              onChange({ ...form, originalPhotos: e.target.value })
            }
          />
        </div>
        <div>
          <label style={labelStyle}>보정본 수</label>
          <input
            style={inputStyle}
            type="number"
            value={form.retouched}
            placeholder="40"
            onChange={(e) => onChange({ ...form, retouched: e.target.value })}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>보정 상세</label>
          <input
            style={inputStyle}
            value={form.retouchedDetail}
            placeholder="Detailed Retouched: 25 (Customer Selected) + Color Correction: 15"
            onChange={(e) =>
              onChange({ ...form, retouchedDetail: e.target.value })
            }
          />
        </div>
      </div>

      {/* Partners */}
      <p style={sectionTitle}>Partners</p>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}
      >
        <div>
          <label style={labelStyle}>Hair &amp; Makeup</label>
          <select
            style={inputStyle}
            value={form.hmuId ?? ''}
            onChange={(e) =>
              onChange({
                ...form,
                hmuId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">없음</option>
            {hmuList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Dress</label>
          <select
            style={inputStyle}
            value={form.dressId ?? ''}
            onChange={(e) =>
              onChange({
                ...form,
                dressId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">없음</option>
            {dressList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Suit</label>
          <select
            style={inputStyle}
            value={form.suitId ?? ''}
            onChange={(e) =>
              onChange({
                ...form,
                suitId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">없음</option>
            {suitList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Bouquet</label>
          <select
            style={inputStyle}
            value={form.bouquetId ?? ''}
            onChange={(e) =>
              onChange({
                ...form,
                bouquetId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">없음</option>
            {bouquetList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inclusions */}
      {allInclusions.length > 0 && (
        <>
          <p style={sectionTitle}>Package Inclusive</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 6,
            }}
          >
            {allInclusions.map((inc) => (
              <label
                key={inc.id}
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
                  checked={form.inclusionIds.includes(inc.id)}
                  onChange={() =>
                    onChange({
                      ...form,
                      inclusionIds: toggleId(form.inclusionIds, inc.id),
                    })
                  }
                />
                {inc.name}
              </label>
            ))}
          </div>
        </>
      )}

      {/* Addons */}
      {allAddons.length > 0 && (
        <>
          <p style={sectionTitle}>Add-ons</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 6,
            }}
          >
            {allAddons.map((addon) => (
              <label
                key={addon.id}
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
                  checked={form.addonIds.includes(addon.id)}
                  onChange={() =>
                    onChange({
                      ...form,
                      addonIds: toggleId(form.addonIds, addon.id),
                    })
                  }
                />
                {addon.name}{' '}
                <span style={{ color: '#c9a96e', fontSize: 12 }}>
                  ${addon.price}
                </span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* 버튼 */}
      {!hideButtons && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            style={btnStyle('#000', '#fff')}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button style={btnStyle('#fff', '#000', '#000')} onClick={onCancel}>
            취소
          </button>
        </div>
      )}
      {showPreview && (
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
            if (e.target === e.currentTarget) setShowPreview(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <PackagePreview
              onClose={() => setShowPreview(false)}
              name={form.name}
              subtitle={form.subtitle}
              priceSNS={Number(form.priceSNS) || 0}
              priceNoSNS={Number(form.priceNoSNS) || 0}
              shootingTime={form.shootingTime}
              locations={form.locations}
              originalPhotos={form.originalPhotos}
              retouched={Number(form.retouched) || 0}
              retouchedDetail={form.retouchedDetail}
              inclusionIds={form.inclusionIds}
              allInclusions={allInclusions}
              onReorderInclusions={(inclusionIds) =>
                onChange({ ...form, inclusionIds })
              }
              addonIds={form.addonIds}
              allAddons={allAddons}
              onReorderAddons={(addonIds) => onChange({ ...form, addonIds })}
              partnerRows={partnerRows}
            />
          </div>
        </div>
      )}
    </div>
  );
}
