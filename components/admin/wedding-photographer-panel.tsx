'use client';

import { useState, useEffect } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import { useSelection } from './use-selection';
import BulkActions from './bulk-actions';
import PackageForm from './package-form';
import DirectorRow from './director-row';
import {
  LOCATIONS,
  locationOfSection,
  pkgFormFromPackage,
  emptyDirForm,
  emptyPkgForm,
  type Director,
  type Package,
  type PkgForm,
  type SimpleProduct,
  type Inclusion,
  type Addon,
  type Partner,
} from './wedding-photographer-types';

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
    const partnerIds = [form.hmuId, form.dressId, form.suitId, form.bouquetId].filter(
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

  const groupedDirectors = LOCATIONS.map(({ label, match }) => ({
    label,
    directors: directors.filter((d) => d.location === match),
  }));

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
          MANAGE
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000' }}>
          Directors 관리
        </h2>
        <p style={{ fontSize: 12, color: '#000', marginTop: 4 }}>
          작가 정보와 패키지(가격·구성·파트너)를 여기서 모두 관리합니다.
        </p>
      </div>

      {/* 작가 등록 폼 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #000',
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
            borderTop: '1px solid #000',
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
              style={btnStyle('transparent', '#3a1a2a', '#000')}
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
                <p style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>
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
          style={btnStyle('#000', '#fff')}
          onClick={handleCreateDir}
          disabled={saving}
        >
          {saving ? '등록 중...' : '등록'}
        </button>
      </div>

      {/* 작가 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>
        )}
        {!loading && directors.length === 0 && (
          <p style={{ fontSize: 13, color: '#000' }}>등록된 작가가 없습니다.</p>
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
                <p style={{ fontSize: 12, color: '#000' }}>
                  등록된 작가가 없습니다.
                </p>
              )}
              {group.map((dir) => (
                <DirectorRow
                  key={dir.id}
                  dir={dir}
                  isExpanded={expandedDirId === dir.id}
                  packages={dirPackages[dir.id] ?? []}
                  isSelected={selectedIds.has(dir.id)}
                  onToggleSelect={() => toggleSelect(dir.id)}
                  onToggleExpand={() => handleExpandDir(dir.id)}
                  isEditingDir={editDirId === dir.id}
                  editDirForm={editDirForm}
                  onEditDirFormChange={setEditDirForm}
                  onStartEditDir={() => {
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
                  onSaveEditDir={() =>
                    handleUpdateDir(dir.id, dir.products[0]?.productId)
                  }
                  onCancelEditDir={() => setEditDirId(null)}
                  onDeleteDir={() => handleDeleteDir(dir.id)}
                  allProducts={allProducts}
                  pkgsLoading={pkgsLoading}
                  isAddingPkg={addingPkgForDir === dir.id}
                  newPkgForm={newPkgForm}
                  onNewPkgFormChange={setNewPkgForm}
                  onStartAddPkg={() => {
                    setAddingPkgForDir(dir.id);
                    setNewPkgForm(emptyPkgForm);
                    setEditPkgId(null);
                  }}
                  onCancelAddPkg={() => setAddingPkgForDir(null)}
                  onSaveNewPkg={() => handleCreatePkg(dir.id)}
                  editPkgId={editPkgId}
                  editPkgForm={editPkgForm}
                  onEditPkgFormChange={setEditPkgForm}
                  onStartEditPkg={(pkg) => {
                    setEditPkgId(pkg.id);
                    setEditPkgForm(pkgFormFromPackage(pkg));
                    setAddingPkgForDir(null);
                  }}
                  onCancelEditPkg={() => setEditPkgId(null)}
                  onSaveEditPkg={(pkgId) => handleUpdatePkg(pkgId, dir.id)}
                  onDeletePkg={(pkgId) => handleDeletePkg(pkgId, dir.id)}
                  allInclusions={allInclusions}
                  allAddons={allAddons}
                  allPartners={allPartners}
                  saving={saving}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
