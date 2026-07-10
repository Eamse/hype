'use client';

import { inputStyle, btnStyle } from './types';
import PackageForm from './package-form';
import {
  locationOfSection,
  type Director,
  type Package,
  type PkgForm,
  type SimpleProduct,
  type Inclusion,
  type Addon,
  type Partner,
} from './wedding-photographer-types';

export default function DirectorRow({
  dir,
  isExpanded,
  packages,
  isSelected,
  onToggleSelect,
  onToggleExpand,

  isEditingDir,
  editDirForm,
  onEditDirFormChange,
  onStartEditDir,
  onSaveEditDir,
  onCancelEditDir,
  onDeleteDir,
  allProducts,

  pkgsLoading,
  isAddingPkg,
  newPkgForm,
  onNewPkgFormChange,
  onStartAddPkg,
  onCancelAddPkg,
  onSaveNewPkg,
  editPkgId,
  editPkgForm,
  onEditPkgFormChange,
  onStartEditPkg,
  onCancelEditPkg,
  onSaveEditPkg,
  onDeletePkg,
  allInclusions,
  allAddons,
  allPartners,
  saving,
}: {
  dir: Director;
  isExpanded: boolean;
  packages: Package[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;

  isEditingDir: boolean;
  editDirForm: {
    number: string;
    name: string;
    instagram: string;
    location: '' | 'Jeju' | 'Seoul';
    productId: number | '';
  };
  onEditDirFormChange: (f: {
    number: string;
    name: string;
    instagram: string;
    location: '' | 'Jeju' | 'Seoul';
    productId: number | '';
  }) => void;
  onStartEditDir: () => void;
  onSaveEditDir: () => void;
  onCancelEditDir: () => void;
  onDeleteDir: () => void;
  allProducts: SimpleProduct[];

  pkgsLoading: boolean;
  isAddingPkg: boolean;
  newPkgForm: PkgForm;
  onNewPkgFormChange: (f: PkgForm) => void;
  onStartAddPkg: () => void;
  onCancelAddPkg: () => void;
  onSaveNewPkg: () => void;
  editPkgId: number | null;
  editPkgForm: PkgForm;
  onEditPkgFormChange: (f: PkgForm) => void;
  onStartEditPkg: (pkg: Package) => void;
  onCancelEditPkg: () => void;
  onSaveEditPkg: (pkgId: number) => void;
  onDeletePkg: (pkgId: number) => void;
  allInclusions: Inclusion[];
  allAddons: Addon[];
  allPartners: Partner[];
  saving: boolean;
}) {
  return (
    <div
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
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={onToggleSelect}
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
          {isEditingDir ? (
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
                  onEditDirFormChange({ ...editDirForm, number: e.target.value })
                }
                placeholder="번호"
              />
              <select
                style={{ ...inputStyle, minWidth: 90 }}
                value={editDirForm.location}
                onChange={(e) =>
                  onEditDirFormChange({
                    ...editDirForm,
                    location: e.target.value as typeof editDirForm.location,
                    productId: '',
                  })
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
                  onEditDirFormChange({
                    ...editDirForm,
                    productId: e.target.value ? Number(e.target.value) : '',
                  })
                }
              >
                <option value="">상품 없음</option>
                {allProducts
                  .filter((p) => locationOfSection(p.section) === editDirForm.location)
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
                  onEditDirFormChange({ ...editDirForm, name: e.target.value })
                }
                placeholder="작가"
              />
              <input
                style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                value={editDirForm.instagram}
                onChange={(e) =>
                  onEditDirFormChange({ ...editDirForm, instagram: e.target.value })
                }
                placeholder="인스타"
              />
              <button style={btnStyle('#191919', '#fff')} onClick={onSaveEditDir}>
                저장
              </button>
              <button style={btnStyle('#fff', '#666', '#ddd')} onClick={onCancelEditDir}>
                취소
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onToggleExpand}
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
                <span style={{ fontSize: 12, color: '#c9a96e', fontWeight: 700 }}>
                  {dir.number}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                  {dir.name}
                </span>
                {dir.instagram && (
                  <span style={{ fontSize: 12, color: '#888' }}>{dir.instagram}</span>
                )}
                <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>
                  {packages.length > 0 ? `패키지 ${packages.length}개` : ''}{' '}
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>
              <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                <button style={btnStyle('#fff', '#3a1a2a', '#ddd')} onClick={onStartEditDir}>
                  수정
                </button>
                <button style={btnStyle('#fff', '#e05555', '#fdd')} onClick={onDeleteDir}>
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
            {!isAddingPkg && (
              <button style={btnStyle('#191919', '#fff')} onClick={onStartAddPkg}>
                + 패키지 추가
              </button>
            )}
          </div>

          {pkgsLoading && <p style={{ fontSize: 12, color: '#999' }}>불러오는 중...</p>}

          {/* 패키지 추가 폼 */}
          {isAddingPkg && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a', marginBottom: 10 }}>
                새 패키지
              </p>
              <PackageForm
                form={newPkgForm}
                onChange={onNewPkgFormChange}
                allInclusions={allInclusions}
                allAddons={allAddons}
                allPartners={allPartners}
                onSave={onSaveNewPkg}
                onCancel={onCancelAddPkg}
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
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#3a1a2a', marginBottom: 10 }}>
                      {pkg.name} 수정
                    </p>
                    <PackageForm
                      form={editPkgForm}
                      onChange={onEditPkgFormChange}
                      allInclusions={allInclusions}
                      allAddons={allAddons}
                      allPartners={allPartners}
                      onSave={() => onSaveEditPkg(pkg.id)}
                      onCancel={onCancelEditPkg}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                          {pkg.name}
                        </span>
                        {pkg.subtitle && (
                          <span style={{ fontSize: 12, color: '#888' }}>{pkg.subtitle}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
                        <span>SNS ${pkg.priceSNS.toLocaleString()}</span>
                        <span>No SNS ${pkg.priceNoSNS.toLocaleString()}</span>
                        <span>{pkg.shootingTime}</span>
                        <span>{pkg.locations}</span>
                        <span>보정 {pkg.retouched}장</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
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
                                : partner.role === 'suit'
                                  ? 'Suit'
                                  : 'Bouquet'}
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
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                      <button
                        style={btnStyle('#fff', '#3a1a2a', '#ddd')}
                        onClick={() => onStartEditPkg(pkg)}
                      >
                        수정
                      </button>
                      <button
                        style={btnStyle('#fff', '#e05555', '#fdd')}
                        onClick={() => onDeletePkg(pkg.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!pkgsLoading && packages.length === 0 && !isAddingPkg && (
              <p style={{ fontSize: 12, color: '#999' }}>등록된 패키지가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
