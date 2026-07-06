'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';
import PackagePreview from './package-preview';

type Director = {
  id: number;
  number: string;
  name: string;
  location: string | null;
  instagram: string | null;
  imageUrl: string | null;
  order: number;
  products: {
    productId: number;
    product: { id: number; title: string; section: string };
  }[];
};

const LOCATIONS: { label: string; match: string }[] = [
  { label: '제주', match: 'Jeju' },
  { label: '서울', match: 'Seoul' },
];

function locationOfSection(section: string): 'Jeju' | 'Seoul' | null {
  if (section.includes('Jeju')) return 'Jeju';
  if (section.includes('Seoul')) return 'Seoul';
  return null;
}

type SimpleProduct = { id: number; title: string; section: string };

type Addon = { id: number; name: string; price: number; desc: string | null };
type Inclusion = { id: number; name: string };
type Partner = {
  id: number;
  role: string;
  name: string;
  instagram: string | null;
};

type Package = {
  id: number;
  directorId: number;
  name: string;
  subtitle: string | null;
  priceSNS: number;
  priceNoSNS: number;
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail: string | null;
  addons: { addon: Addon }[];
  inclusions: { inclusion: Inclusion }[];
  partners: { partner: Partner }[];
};

const emptyDirForm = {
  number: '',
  name: '',
  instagram: '',
  location: '' as '' | 'Jeju' | 'Seoul',
  productId: '' as number | '',
};

const emptyPkgForm = {
  name: '',
  subtitle: '',
  priceSNS: '',
  priceNoSNS: '',
  shootingTime: '',
  locations: '',
  originalPhotos: '',
  retouched: '',
  retouchedDetail: '',
  inclusionIds: [] as number[],
  addonIds: [] as number[],
  hmuId: null as number | null,
  dressId: null as number | null,
  suitId: null as number | null,
};
type PkgForm = typeof emptyPkgForm;

function pkgFormFromPackage(pkg: Package): PkgForm {
  return {
    name: pkg.name,
    subtitle: pkg.subtitle ?? '',
    priceSNS: String(pkg.priceSNS),
    priceNoSNS: String(pkg.priceNoSNS),
    shootingTime: pkg.shootingTime,
    locations: pkg.locations,
    originalPhotos: pkg.originalPhotos,
    retouched: String(pkg.retouched),
    retouchedDetail: pkg.retouchedDetail ?? '',
    inclusionIds: pkg.inclusions.map((i) => i.inclusion.id),
    addonIds: pkg.addons.map((a) => a.addon.id),
    hmuId:
      pkg.partners.find((p) => p.partner.role === 'hmu')?.partner.id ?? null,
    dressId:
      pkg.partners.find((p) => p.partner.role === 'dress')?.partner.id ?? null,
    suitId:
      pkg.partners.find((p) => p.partner.role === 'suit')?.partner.id ?? null,
  };
}

function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

// ── Package Form ──────────────────────────────────────────────────────────────
function PackageForm({
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
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
    <div
      style={{
        background: '#fdfcfa',
        border: '1px solid #e8e0d0',
        borderRadius: 10,
        padding: 20,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}
      >
        <button
          type="button"
          style={btnStyle(
            showPreview ? '#191919' : '#fff',
            showPreview ? '#fff' : '#3a1a2a',
            '#ddd',
          )}
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? '미리보기 닫기' : '미리보기'}
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
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}
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
            style={btnStyle('#191919', '#fff')}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button style={btnStyle('#fff', '#666', '#ddd')} onClick={onCancel}>
            취소
          </button>
        </div>
      )}
    </div>
    {showPreview && (
      <PackagePreview
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
        onReorderInclusions={(inclusionIds) => onChange({ ...form, inclusionIds })}
        addonIds={form.addonIds}
        allAddons={allAddons}
        onReorderAddons={(addonIds) => onChange({ ...form, addonIds })}
        partnerRows={partnerRows}
      />
    )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function WeddingPhotographerPanel() {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirForm, setDirForm] = useState(emptyDirForm);
  const [newDirPkgForms, setNewDirPkgForms] = useState<PkgForm[]>([]);
  const [editDirId, setEditDirId] = useState<number | null>(null);
  const [editDirForm, setEditDirForm] = useState(emptyDirForm);

  const [expandedDirId, setExpandedDirId] = useState<number | null>(null);
  const [dirPackages, setDirPackages] = useState<Record<number, Package[]>>({});
  const [pkgsLoading, setPkgsLoading] = useState(false);

  const [addingPkgForDir, setAddingPkgForDir] = useState<number | null>(null);
  const [newPkgForm, setNewPkgForm] = useState<PkgForm>(emptyPkgForm);
  const [editPkgId, setEditPkgId] = useState<number | null>(null);
  const [editPkgForm, setEditPkgForm] = useState<PkgForm>(emptyPkgForm);
  const [saving, setSaving] = useState(false);

  const [allInclusions, setAllInclusions] = useState<Inclusion[]>([]);
  const [allAddons, setAllAddons] = useState<Addon[]>([]);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>([]);
  const { selectedIds, toggleSelect, toggleAll, clearSelection } =
    useSelection(directors);

  async function loadDirectors() {
    const data = await fetch('/api/admin/wedding-photographers').then((r) =>
      r.json(),
    );
    setDirectors(Array.isArray(data) ? data : []);
  }

  async function loadPackages(directorId: number) {
    setPkgsLoading(true);
    try {
      const data = await fetch(
        `/api/admin/packages?directorId=${directorId}`,
      ).then((r) => r.json());
      setDirPackages((prev) => ({
        ...prev,
        [directorId]: Array.isArray(data) ? data : [],
      }));
    } finally {
      setPkgsLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      loadDirectors(),
      fetch('/api/admin/inclusions')
        .then((r) => r.json())
        .then((d) => setAllInclusions(Array.isArray(d) ? d : [])),
      fetch('/api/admin/addons')
        .then((r) => r.json())
        .then((d) => setAllAddons(Array.isArray(d) ? d : [])),
      fetch('/api/admin/partners')
        .then((r) => r.json())
        .then((d) => setAllPartners(Array.isArray(d) ? d : [])),
      fetch('/api/products')
        .then((r) => r.json())
        .then((d) => setAllProducts(Array.isArray(d) ? d : [])),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleExpandDir(dirId: number) {
    if (expandedDirId === dirId) {
      setExpandedDirId(null);
      return;
    }
    setExpandedDirId(dirId);
    setAddingPkgForDir(null);
    setEditPkgId(null);
    if (!dirPackages[dirId]) await loadPackages(dirId);
  }

  // ── Director CRUD ──
  async function handleCreateDir() {
    if (!dirForm.number.trim() || !dirForm.name.trim()) {
      alert('번호와 이름은 필수입니다.');
      return;
    }
    if (!dirForm.location) {
      alert('지역을 선택해주세요.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/wedding-photographers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dirForm),
      });
      if (!res.ok) {
        alert((await res.json()).error);
        return;
      }
      const director = await res.json();

      // 패키지 일괄 등록
      for (const pkgForm of newDirPkgForms) {
        if (!pkgForm.name.trim()) continue;
        const pkgRes = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directorId: director.id,
            name: pkgForm.name,
            subtitle: pkgForm.subtitle || null,
            priceSNS: Number(pkgForm.priceSNS) || 0,
            priceNoSNS: Number(pkgForm.priceNoSNS) || 0,
            shootingTime: pkgForm.shootingTime,
            locations: pkgForm.locations,
            originalPhotos: pkgForm.originalPhotos,
            retouched: Number(pkgForm.retouched) || 0,
            retouchedDetail: pkgForm.retouchedDetail || null,
          }),
        });
        if (pkgRes.ok) {
          const pkg = await pkgRes.json();
          await savePkgRelations(pkg.id, pkgForm);
        }
      }

      // 상품 연결
      if (dirForm.productId) {
        await fetch(`/api/admin/wedding-directors/${dirForm.productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ directorId: director.id }),
        });
      }

      await loadDirectors();
      setDirForm(emptyDirForm);
      setNewDirPkgForms([]);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDir(id: number, oldProductId?: number) {
    const res = await fetch(`/api/admin/wedding-photographers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDirForm),
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }

    const newProductId = editDirForm.productId;
    if (newProductId !== (oldProductId ?? '')) {
      if (oldProductId) {
        await fetch(`/api/admin/wedding-directors/${oldProductId}/${id}`, {
          method: 'DELETE',
        });
      }
      if (newProductId) {
        await fetch(`/api/admin/wedding-directors/${newProductId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ directorId: id }),
        });
      }
    }

    await loadDirectors();
    setEditDirId(null);
  }

  async function handleBulkDeleteDirs() {
    await Promise.all(
      [...selectedIds].map((id) =>
        fetch(`/api/admin/wedding-photographers/${id}`, { method: 'DELETE' }),
      ),
    );
    await loadDirectors();
    clearSelection();
  }

  async function handleDeleteDir(id: number) {
    if (
      !confirm(
        '이 작가를 삭제하면 연결된 패키지도 모두 삭제됩니다. 계속할까요?',
      )
    )
      return;
    const res = await fetch(`/api/admin/wedding-photographers/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    setDirectors((prev) => prev.filter((d) => d.id !== id));
    if (expandedDirId === id) setExpandedDirId(null);
  }

  // ── Package helpers ──
  async function savePkgRelations(pkgId: number, form: PkgForm) {
    const partnerIds = [form.hmuId, form.dressId, form.suitId].filter(
      (id): id is number => id !== null,
    );
    await Promise.all([
      fetch(`/api/admin/packages/${pkgId}/inclusions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inclusionIds: form.inclusionIds }),
      }),
      fetch(`/api/admin/packages/${pkgId}/addons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonIds: form.addonIds }),
      }),
      fetch(`/api/admin/packages/${pkgId}/partners`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerIds }),
      }),
    ]);
  }

  // ── Package CRUD ──
  async function handleCreatePkg(directorId: number) {
    if (!newPkgForm.name.trim()) {
      alert('패키지명은 필수입니다.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorId,
          name: newPkgForm.name,
          subtitle: newPkgForm.subtitle || null,
          priceSNS: Number(newPkgForm.priceSNS) || 0,
          priceNoSNS: Number(newPkgForm.priceNoSNS) || 0,
          shootingTime: newPkgForm.shootingTime,
          locations: newPkgForm.locations,
          originalPhotos: newPkgForm.originalPhotos,
          retouched: Number(newPkgForm.retouched) || 0,
          retouchedDetail: newPkgForm.retouchedDetail || null,
        }),
      });
      if (!res.ok) {
        alert((await res.json()).error);
        return;
      }
      const pkg = await res.json();
      await savePkgRelations(pkg.id, newPkgForm);
      await loadPackages(directorId);
      setAddingPkgForDir(null);
      setNewPkgForm(emptyPkgForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePkg(pkgId: number, directorId: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/packages/${pkgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPkgForm.name,
          subtitle: editPkgForm.subtitle || null,
          priceSNS: Number(editPkgForm.priceSNS) || 0,
          priceNoSNS: Number(editPkgForm.priceNoSNS) || 0,
          shootingTime: editPkgForm.shootingTime,
          locations: editPkgForm.locations,
          originalPhotos: editPkgForm.originalPhotos,
          retouched: Number(editPkgForm.retouched) || 0,
          retouchedDetail: editPkgForm.retouchedDetail || null,
        }),
      });
      if (!res.ok) {
        alert((await res.json()).error);
        return;
      }
      await savePkgRelations(pkgId, editPkgForm);
      await loadPackages(directorId);
      setEditPkgId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePkg(pkgId: number, directorId: number) {
    if (!confirm('이 패키지를 삭제할까요?')) return;
    const res = await fetch(`/api/admin/packages/${pkgId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    setDirPackages((prev) => ({
      ...prev,
      [directorId]: (prev[directorId] ?? []).filter((p) => p.id !== pkgId),
    }));
  }

  // ── Render ──
  function renderDirectorRow(dir: Director) {
    const isExpanded = expandedDirId === dir.id;
    const packages = dirPackages[dir.id] ?? [];

    return (
      <div
        key={dir.id}
        style={{
          background: '#fff',
          border: '1px solid #ede8de',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* 작가 행 */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(dir.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggleSelect(dir.id)}
            style={{ flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {editDirId === dir.id ? (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flex: 1,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <input
                  style={{ ...inputStyle, width: 80 }}
                  value={editDirForm.number}
                  onChange={(e) =>
                    setEditDirForm((f) => ({ ...f, number: e.target.value }))
                  }
                  placeholder="번호"
                />
                <select
                  style={{ ...inputStyle, minWidth: 90 }}
                  value={editDirForm.location}
                  onChange={(e) =>
                    setEditDirForm((f) => ({
                      ...f,
                      location: e.target.value as typeof f.location,
                      productId: '',
                    }))
                  }
                >
                  <option value="">지역 선택</option>
                  <option value="Jeju">제주</option>
                  <option value="Seoul">서울</option>
                </select>
                <select
                  style={{ ...inputStyle, minWidth: 120 }}
                  value={editDirForm.productId}
                  disabled={!editDirForm.location}
                  onChange={(e) =>
                    setEditDirForm((f) => ({
                      ...f,
                      productId: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                >
                  <option value="">상품 없음</option>
                  {allProducts
                    .filter(
                      (p) => locationOfSection(p.section) === editDirForm.location,
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                  value={editDirForm.name}
                  onChange={(e) =>
                    setEditDirForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="작가"
                />
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                  value={editDirForm.instagram}
                  onChange={(e) =>
                    setEditDirForm((f) => ({ ...f, instagram: e.target.value }))
                  }
                  placeholder="인스타"
                />
                <button
                  style={btnStyle('#191919', '#fff')}
                  onClick={() =>
                    handleUpdateDir(dir.id, dir.products[0]?.productId)
                  }
                >
                  저장
                </button>
                <button
                  style={btnStyle('#fff', '#666', '#ddd')}
                  onClick={() => setEditDirId(null)}
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleExpandDir(dir.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: '#c9a96e', fontWeight: 700 }}
                  >
                    {dir.number}
                  </span>
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}
                  >
                    {dir.name}
                  </span>
                  {dir.instagram && (
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {dir.instagram}
                    </span>
                  )}
                  <span
                    style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}
                  >
                    {packages.length > 0 ? `패키지 ${packages.length}개` : ''}{' '}
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>
                <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                  <button
                    style={btnStyle('#fff', '#3a1a2a', '#ddd')}
                    onClick={() => {
                      setEditDirId(dir.id);
                      setEditDirForm({
                        number: dir.number,
                        name: dir.name,
                        instagram: dir.instagram ?? '',
                        location:
                          (dir.location as '' | 'Jeju' | 'Seoul' | null) ?? '',
                        productId: dir.products[0]?.productId ?? '',
                      });
                    }}
                  >
                    수정
                  </button>
                  <button
                    style={btnStyle('#fff', '#e05555', '#fdd')}
                    onClick={() => handleDeleteDir(dir.id)}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 패키지 섹션 */}
        {isExpanded && (
          <div
            style={{
              borderTop: '1px solid #ede8de',
              background: '#fafaf8',
              padding: '20px 20px 24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#3a1a2a',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Packages
              </p>
              {addingPkgForDir !== dir.id && (
                <button
                  style={btnStyle('#191919', '#fff')}
                  onClick={() => {
                    setAddingPkgForDir(dir.id);
                    setNewPkgForm(emptyPkgForm);
                    setEditPkgId(null);
                  }}
                >
                  + 패키지 추가
                </button>
              )}
            </div>

            {pkgsLoading && (
              <p style={{ fontSize: 12, color: '#999' }}>불러오는 중...</p>
            )}

            {/* 패키지 추가 폼 */}
            {addingPkgForDir === dir.id && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#3a1a2a',
                    marginBottom: 10,
                  }}
                >
                  새 패키지
                </p>
                <PackageForm
                  form={newPkgForm}
                  onChange={setNewPkgForm}
                  allInclusions={allInclusions}
                  allAddons={allAddons}
                  allPartners={allPartners}
                  onSave={() => handleCreatePkg(dir.id)}
                  onCancel={() => setAddingPkgForDir(null)}
                  saving={saving}
                />
              </div>
            )}

            {/* 패키지 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e8e0d0',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {editPkgId === pkg.id ? (
                    <div style={{ padding: 16 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#3a1a2a',
                          marginBottom: 10,
                        }}
                      >
                        {pkg.name} 수정
                      </p>
                      <PackageForm
                        form={editPkgForm}
                        onChange={setEditPkgForm}
                        allInclusions={allInclusions}
                        allAddons={allAddons}
                        allPartners={allPartners}
                        onSave={() => handleUpdatePkg(pkg.id, dir.id)}
                        onCancel={() => setEditPkgId(null)}
                        saving={saving}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: '#1a1a1a',
                            }}
                          >
                            {pkg.name}
                          </span>
                          {pkg.subtitle && (
                            <span style={{ fontSize: 12, color: '#888' }}>
                              {pkg.subtitle}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            fontSize: 12,
                            color: '#666',
                          }}
                        >
                          <span>SNS ${pkg.priceSNS.toLocaleString()}</span>
                          <span>No SNS ${pkg.priceNoSNS.toLocaleString()}</span>
                          <span>{pkg.shootingTime}</span>
                          <span>{pkg.locations}</span>
                          <span>보정 {pkg.retouched}장</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginTop: 2,
                          }}
                        >
                          {pkg.partners.map(({ partner }) => (
                            <span
                              key={partner.id}
                              style={{
                                fontSize: 11,
                                background: '#f0e8d8',
                                color: '#7a5520',
                                borderRadius: 4,
                                padding: '2px 6px',
                              }}
                            >
                              {partner.role === 'hmu'
                                ? 'HMU'
                                : partner.role === 'dress'
                                  ? 'Dress'
                                  : 'Suit'}
                              : {partner.name}
                            </span>
                          ))}
                          {pkg.inclusions.length > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                background: '#e8f0e8',
                                color: '#2a5a2a',
                                borderRadius: 4,
                                padding: '2px 6px',
                              }}
                            >
                              Inclusive {pkg.inclusions.length}개
                            </span>
                          )}
                          {pkg.addons.length > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                background: '#e8e8f0',
                                color: '#2a2a5a',
                                borderRadius: 4,
                                padding: '2px 6px',
                              }}
                            >
                              Add-on {pkg.addons.length}개
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginLeft: 12,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          style={btnStyle('#fff', '#3a1a2a', '#ddd')}
                          onClick={() => {
                            setEditPkgId(pkg.id);
                            setEditPkgForm(pkgFormFromPackage(pkg));
                            setAddingPkgForDir(null);
                          }}
                        >
                          수정
                        </button>
                        <button
                          style={btnStyle('#fff', '#e05555', '#fdd')}
                          onClick={() => handleDeletePkg(pkg.id, dir.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!pkgsLoading &&
                packages.length === 0 &&
                addingPkgForDir !== dir.id && (
                  <p style={{ fontSize: 12, color: '#999' }}>
                    등록된 패키지가 없습니다.
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const groupedDirectors = LOCATIONS.map(({ label, match }) => ({
    label,
    directors: directors.filter((d) => d.location === match),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 헤더 */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #ede8de' }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            color: '#7a5520',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          MANAGE
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
          Directors 관리
        </h2>
        <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          작가 정보와 패키지(가격·구성·파트너)를 여기서 모두 관리합니다.
        </p>
      </div>

      {/* 작가 등록 폼 */}
      <div
        style={{
          background: '#fdfcfa',
          border: '1px solid #ede8de',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#3a1a2a',
            marginBottom: 16,
          }}
        >
          새 작가 등록
        </p>

        {/* 기본 정보 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 100px 1fr 1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>번호 *</label>
            <input
              style={inputStyle}
              placeholder="#1-1"
              value={dirForm.number}
              onChange={(e) =>
                setDirForm((f) => ({ ...f, number: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={labelStyle}>지역 *</label>
            <select
              style={inputStyle}
              value={dirForm.location}
              onChange={(e) =>
                setDirForm((f) => ({
                  ...f,
                  location: e.target.value as typeof f.location,
                  productId: '',
                }))
              }
            >
              <option value="">선택</option>
              <option value="Jeju">제주</option>
              <option value="Seoul">서울</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>상품</label>
            <select
              style={inputStyle}
              value={dirForm.productId}
              disabled={!dirForm.location}
              onChange={(e) =>
                setDirForm((f) => ({
                  ...f,
                  productId: e.target.value ? Number(e.target.value) : '',
                }))
              }
            >
              <option value="">없음</option>
              {allProducts
                .filter((p) => locationOfSection(p.section) === dirForm.location)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>작가 *</label>
            <input
              style={inputStyle}
              placeholder="Jeju and You"
              value={dirForm.name}
              onChange={(e) =>
                setDirForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={labelStyle}>인스타그램</label>
            <input
              style={inputStyle}
              placeholder="@jejuandyou_snap"
              value={dirForm.instagram}
              onChange={(e) =>
                setDirForm((f) => ({ ...f, instagram: e.target.value }))
              }
            />
          </div>
        </div>

        {/* 패키지 */}
        <div
          style={{
            borderTop: '1px solid #ede8de',
            paddingTop: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#3a1a2a',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Packages{' '}
              {newDirPkgForms.length > 0 && (
                <span style={{ color: '#c9a96e' }}>
                  ({newDirPkgForms.length}개)
                </span>
              )}
            </p>
            <button
              style={btnStyle('transparent', '#3a1a2a', '#ddd')}
              onClick={() =>
                setNewDirPkgForms((prev) => [...prev, { ...emptyPkgForm }])
              }
            >
              + 패키지 추가
            </button>
          </div>

          {newDirPkgForms.map((pkgForm, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>
                  Package {idx + 1}
                </p>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: '#e05555',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setNewDirPkgForms((prev) =>
                      prev.filter((_, i) => i !== idx),
                    )
                  }
                >
                  제거
                </button>
              </div>
              <PackageForm
                form={pkgForm}
                onChange={(f) =>
                  setNewDirPkgForms((prev) =>
                    prev.map((p, i) => (i === idx ? f : p)),
                  )
                }
                allInclusions={allInclusions}
                allAddons={allAddons}
                allPartners={allPartners}
                onSave={() => {}}
                onCancel={() => {}}
                saving={false}
                hideButtons
              />
            </div>
          ))}
        </div>

        <button
          style={btnStyle('#191919', '#fff')}
          onClick={handleCreateDir}
          disabled={saving}
        >
          {saving ? '등록 중...' : '등록'}
        </button>
      </div>

      {/* 작가 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <p style={{ fontSize: 13, color: '#999' }}>불러오는 중...</p>
        )}
        {!loading && directors.length === 0 && (
          <p style={{ fontSize: 13, color: '#999' }}>등록된 작가가 없습니다.</p>
        )}
        <BulkActions
          total={directors.length}
          selectedCount={selectedIds.size}
          allSelected={
            selectedIds.size === directors.length && directors.length > 0
          }
          onToggleAll={toggleAll}
          onDeleteSelected={handleBulkDeleteDirs}
        />

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          {groupedDirectors.map(({ label, directors: group }) => (
            <div
              key={label}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
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
                {label} ({group.length})
              </p>
              {group.length === 0 && (
                <p style={{ fontSize: 12, color: '#999' }}>
                  등록된 작가가 없습니다.
                </p>
              )}
              {group.map(renderDirectorRow)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
