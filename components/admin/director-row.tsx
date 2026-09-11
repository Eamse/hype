'use client';
import { inputStyle, btnStyle } from './types';
import PackageForm from './package-form';
import { locationOfSection, type Director, type Package, type PkgForm, type SimpleProduct, type Inclusion, type Addon, type Partner, } from './wedding-photographer-types';
export default function DirectorRow({ dir, isExpanded, packages, isSelected, onToggleSelect, onToggleExpand, isEditingDir, editDirForm, onEditDirFormChange, onStartEditDir, onSaveEditDir, onCancelEditDir, onDeleteDir, allProducts, pkgsLoading, isAddingPkg, newPkgForm, onNewPkgFormChange, onStartAddPkg, onCancelAddPkg, onSaveNewPkg, editPkgId, editPkgForm, onEditPkgFormChange, onStartEditPkg, onCancelEditPkg, onSaveEditPkg, onDeletePkg, allInclusions, allAddons, allPartners, saving, }: {
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
    return (<div style={{
            background: '#fff',
            border: '1px solid #000',
            borderRadius: 12,
            overflow: 'hidden',
        }}>
      
      <div style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
        }}>
        <input type="checkbox" checked={isSelected} onClick={(e) => e.stopPropagation()} onChange={onToggleSelect} style={{ flexShrink: 0 }}/>
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
          {isEditingDir ? (<div style={{
                display: 'flex',
                gap: 10,
                flex: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
              <input style={{ ...inputStyle, width: 80 }} value={editDirForm.number} onChange={(e) => onEditDirFormChange({ ...editDirForm, number: e.target.value })} placeholder="번호"/>
              <select style={{ ...inputStyle, minWidth: 90 }} value={editDirForm.location} onChange={(e) => onEditDirFormChange({
                ...editDirForm,
                location: e.target.value as typeof editDirForm.location,
                productId: '',
            })}>
                <option value="">지역 선택</option>
                <option value="Jeju">제주</option>
                <option value="Seoul">서울</option>
              </select>
              <select style={{ ...inputStyle, minWidth: 120 }} value={editDirForm.productId} disabled={!editDirForm.location} onChange={(e) => onEditDirFormChange({
                ...editDirForm,
                productId: e.target.value ? Number(e.target.value) : '',
            })}>
                <option value="">상품 없음</option>
                {allProducts
                .filter((p) => locationOfSection(p.section) === editDirForm.location)
                .map((p) => (<option key={p.id} value={p.id}>
                      {p.title}
                    </option>))}
              </select>
              <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={editDirForm.name} onChange={(e) => onEditDirFormChange({ ...editDirForm, name: e.target.value })} placeholder="작가"/>
              <input style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={editDirForm.instagram} onChange={(e) => onEditDirFormChange({ ...editDirForm, instagram: e.target.value })} placeholder="인스타"/>
              <button style={btnStyle('#000', '#fff')} onClick={onSaveEditDir}>
                저장
              </button>
              <button style={btnStyle('#fff', '#000', '#000')} onClick={onCancelEditDir}>
                취소
              </button>
            </div>) : (<>
              <button onClick={onToggleExpand} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flex: 1,
                textAlign: 'left',
            }}>
                <span style={{ fontSize: 12, color: '#acacac', fontWeight: 700 }}>
                  {dir.number}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
                  {dir.name}
                </span>
                {dir.instagram && (<span style={{ fontSize: 12, color: '#000' }}>{dir.instagram}</span>)}
                <span style={{ fontSize: 11, color: '#000', marginLeft: 'auto' }}>
                  {packages.length > 0 ? `패키지 ${packages.length}개` : ''}{' '}
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>
              <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                <button style={btnStyle('#fff', '#252525', '#000')} onClick={onStartEditDir}>
                  수정
                </button>
                <button style={btnStyle('#fff', '#7f7f7f', '#e7e7e7')} onClick={onDeleteDir}>
                  삭제
                </button>
              </div>
            </>)}
        </div>
      </div>

      
      {(isExpanded || isEditingDir) && (<div style={{
                borderTop: '1px solid #000',
                background: '#fff',
                padding: '20px 20px 24px',
            }}>
          <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
            }}>
            <p style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#252525',
                letterSpacing: '1px',
                textTransform: 'uppercase',
            }}>
              Packages
            </p>
            {!isAddingPkg && (<button style={btnStyle('#000', '#fff')} onClick={onStartAddPkg}>
                + 패키지 추가
              </button>)}
          </div>

          {pkgsLoading && <p style={{ fontSize: 12, color: '#000' }}>불러오는 중...</p>}

          
          {isAddingPkg && (<div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#252525', marginBottom: 10 }}>
                새 패키지
              </p>
              <PackageForm form={newPkgForm} onChange={onNewPkgFormChange} allInclusions={allInclusions} allAddons={allAddons} allPartners={allPartners} photographerName={dir.name} photographerInstagram={dir.instagram} onSave={onSaveNewPkg} onCancel={onCancelAddPkg} saving={saving}/>
            </div>)}

          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {packages.map((pkg) => (<div key={pkg.id} style={{
                    background: '#fff',
                    border: '1px solid #000',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}>
                {editPkgId === pkg.id ? (<div style={{ padding: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#252525', marginBottom: 10 }}>
                      {pkg.name} 수정
                    </p>
                    <PackageForm form={editPkgForm} onChange={onEditPkgFormChange} allInclusions={allInclusions} allAddons={allAddons} allPartners={allPartners} photographerName={dir.name} photographerInstagram={dir.instagram} onSave={() => onSaveEditPkg(pkg.id)} onCancel={onCancelEditPkg} saving={saving}/>
                  </div>) : (<div style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>
                          {pkg.name}
                        </span>
                        {pkg.subtitle && (<span style={{ fontSize: 12, color: '#000' }}>{pkg.subtitle}</span>)}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#000', flexWrap: 'wrap' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>SNS ${pkg.priceSNS.toLocaleString()}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>No SNS ${pkg.priceNoSNS.toLocaleString()}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>{pkg.shootingTime}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>{pkg.locations}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>보정 {pkg.retouched}장</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                        {pkg.partners.map(({ partner }) => (<span key={partner.id} style={{
                            fontSize: 11,
                            background: '#e9e9e9',
                            color: '#5a5a5a',
                            borderRadius: 4,
                            padding: '2px 6px',
                        }}>
                            {partner.role === 'videographer'
                            ? 'Videographer'
                            : partner.role === 'hmu'
                                ? 'HMU'
                                : partner.role === 'dress'
                                    ? 'Dress'
                                    : partner.role === 'suit'
                                        ? 'Suit'
                                        : 'Bouquet'}
                            : {partner.name}
                          </span>))}
                        {pkg.inclusions.length > 0 && (<span style={{
                            fontSize: 11,
                            background: '#ededed',
                            color: '#464646',
                            borderRadius: 4,
                            padding: '2px 6px',
                        }}>
                            Inclusive {pkg.inclusions.length}개
                          </span>)}
                        {pkg.addons.length > 0 && (<span style={{
                            fontSize: 11,
                            background: '#e9e9e9',
                            color: '#2f2f2f',
                            borderRadius: 4,
                            padding: '2px 6px',
                        }}>
                            Add-on {pkg.addons.length}개
                          </span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                      <button style={btnStyle('#fff', '#252525', '#000')} onClick={() => onStartEditPkg(pkg)}>
                        수정
                      </button>
                      <button style={btnStyle('#fff', '#7f7f7f', '#e7e7e7')} onClick={() => onDeletePkg(pkg.id)}>
                        삭제
                      </button>
                    </div>
                  </div>)}
              </div>))}
            {!pkgsLoading && packages.length === 0 && !isAddingPkg && (<p style={{ fontSize: 12, color: '#000' }}>등록된 패키지가 없습니다.</p>)}
          </div>
        </div>)}
    </div>);
}
