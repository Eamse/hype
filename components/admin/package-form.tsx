'use client';

import { useState } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import PackagePreview from './package-preview';
import {
  toggleId,
  toggleAddonEntry,
  type PkgForm,
  type Inclusion,
  type Addon,
  type Partner,
} from './wedding-photographer-types';

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
}) {
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
    color: '#acacac',
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
          style={btnStyle('#fff', '#252525', '#000')}
          onClick={() => setShowPreview(true)}
        >
          미리보기
        </button>
      </div>

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

      {/* Addons — 같은 이름이라도 패키지마다 가격/설명이 다를 수 있어서 체크한 항목마다 따로 입력 */}
      {allAddons.length > 0 && (
        <>
          <p style={sectionTitle}>Add-ons</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allAddons.map((addon) => {
              const entry = form.addonEntries.find((e) => e.addonId === addon.id);
              return (
                <div key={addon.id}>
                  <label
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
                      checked={!!entry}
                      onChange={() =>
                        onChange({
                          ...form,
                          addonEntries: toggleAddonEntry(form.addonEntries, addon),
                        })
                      }
                    />
                    {addon.name}
                  </label>
                  {entry && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                        gap: 8,
                        marginTop: 4,
                        marginLeft: 24,
                      }}
                    >
                      <input
                        style={inputStyle}
                        type="number"
                        placeholder="가격 (USD)"
                        value={entry.price}
                        onChange={(e) =>
                          onChange({
                            ...form,
                            addonEntries: form.addonEntries.map((x) =>
                              x.addonId === addon.id ? { ...x, price: e.target.value } : x,
                            ),
                          })
                        }
                      />
                      <input
                        style={inputStyle}
                        placeholder="설명"
                        value={entry.desc}
                        onChange={(e) =>
                          onChange({
                            ...form,
                            addonEntries: form.addonEntries.map((x) =>
                              x.addonId === addon.id ? { ...x, desc: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
              addonEntries={form.addonEntries}
              allAddons={allAddons}
              onReorderAddons={(addonEntries) => onChange({ ...form, addonEntries })}
              partnerRows={partnerRows}
            />
          </div>
        </div>
      )}
    </div>
  );
}
