'use client';
import { useState, type ReactNode } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import PackagePreview from './package-preview';
import { toggleId, type PkgForm, type Inclusion, type Addon, type Partner, } from './wedding-photographer-types';
import { applySinglePriceToggle } from '@/lib/single-price';
export default function PackageForm({ form, onChange, allInclusions, allAddons, allPartners, photographerName, photographerInstagram, onSave, onCancel, saving, hideButtons = false, }: {
    form: PkgForm;
    onChange: (f: PkgForm) => void;
    allInclusions: Inclusion[];
    allAddons: Addon[];
    allPartners: Partner[];
    photographerName?: string;
    photographerInstagram?: string | null;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    hideButtons?: boolean;
}) {
    function partnerLabel(p: Partner): string {
        const handles = p.instagramAccounts.map((a) => a.handle).join(' / ');
        return handles ? `${p.name} (${handles})` : p.name;
    }
    const videographerList = allPartners.filter((p) => p.role === 'videographer');
    const hmuList = allPartners.filter((p) => p.role === 'hmu');
    const dressList = allPartners.filter((p) => p.role === 'dress');
    const suitList = allPartners.filter((p) => p.role === 'suit');
    const bouquetList = allPartners.filter((p) => p.role === 'bouquet');
    const [showPreview, setShowPreview] = useState(false);
    const ROLE_LABELS: Record<string, string> = {
        videographer: 'Videographer',
        hmu: 'Hair & Makeup',
        dress: 'Dress',
        suit: 'Suit',
        bouquet: 'Bouquet',
    };
    // partnerOrder(역할 무관 노출 순서)에 있는 id 기준으로 미리보기용 행을 만든다.
    // Photographer는 Partner 테이블 소속이 아니라 항상 맨 앞에 고정으로 참고용으로만 보여준다 (순서 변경 대상 아님).
    const partnerRows = [
        ...(photographerName ? [{ id: -1, role: 'Photographer', name: photographerInstagram ? `${photographerName} (${photographerInstagram})` : photographerName }] : []),
        ...form.partnerOrder
            .map((id) => allPartners.find((p) => p.id === id))
            .filter((p): p is Partner => !!p)
            .map((p) => ({ id: p.id, role: ROLE_LABELS[p.role] ?? p.role, name: partnerLabel(p) })),
    ];
    function togglePartner(field: 'videographerIds' | 'hmuIds' | 'dressIds' | 'suitIds' | 'bouquetIds', id: number) {
        const wasSelected = form[field].includes(id);
        const nextIds = toggleId(form[field], id);
        const nextOrder = wasSelected
            ? form.partnerOrder.filter((pid) => pid !== id)
            : [...form.partnerOrder, id];
        onChange({ ...form, [field]: nextIds, partnerOrder: nextOrder });
    }
    const sectionTitle: React.CSSProperties = {
        fontSize: 10,
        fontWeight: 700,
        color: '#acacac',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 16,
    };
    return (<div style={{
            background: '#fff',
            border: '1px solid #000',
            borderRadius: 10,
            padding: 20,
        }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button type="button" style={btnStyle('#fff', '#252525', '#000')} onClick={() => setShowPreview(true)}>
          미리보기
        </button>
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>패키지명 *</label>
          <input style={inputStyle} value={form.name} placeholder="Package A" onChange={(e) => onChange({ ...form, name: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>서브타이틀</label>
          <input style={inputStyle} value={form.subtitle} placeholder="Jeju and You Main & Nervi" onChange={(e) => onChange({ ...form, subtitle: e.target.value })}/>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isSinglePrice} onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                    ...form,
                    isSinglePrice: checked,
                    ...applySinglePriceToggle(checked, form.priceSNS),
                });
            }}/>
            단일가격 (SNS 동의/비동의 구분 없이 가격 1개만 사용)
          </label>
        </div>
        {form.isSinglePrice ? (<div>
            <label style={labelStyle}>가격 (USD)</label>
            <input style={inputStyle} type="number" value={form.priceSNS} placeholder="0" onChange={(e) => onChange({ ...form, priceSNS: e.target.value, priceNoSNS: e.target.value })}/>
          </div>) : (<>
            <div>
              <label style={labelStyle}>SNS 동의 가격 (USD)</label>
              <input style={inputStyle} type="number" value={form.priceSNS} placeholder="2690" onChange={(e) => onChange({ ...form, priceSNS: e.target.value })}/>
            </div>
            <div>
              <label style={labelStyle}>SNS 비동의 가격 (USD)</label>
              <input style={inputStyle} type="number" value={form.priceNoSNS} placeholder="2830" onChange={(e) => onChange({ ...form, priceNoSNS: e.target.value })}/>
            </div>
          </>)}
        <div>
          <label style={labelStyle}>촬영 시간</label>
          <input style={inputStyle} value={form.shootingTime} placeholder="4 hours" onChange={(e) => onChange({ ...form, shootingTime: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>촬영 시간 상세 (숫자 아래 작은 참고문구)</label>
          <input style={inputStyle} value={form.shootingTimeDetail} placeholder="예: Up to 2 outfits" onChange={(e) => onChange({ ...form, shootingTimeDetail: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>장소 수</label>
          <input style={inputStyle} value={form.locations} placeholder="3 sites" onChange={(e) => onChange({ ...form, locations: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>장소 수 상세 (숫자 아래 작은 참고문구)</label>
          <input style={inputStyle} value={form.locationsDetail} placeholder="예: 1 Outdoor site + 1 Indoor studio" onChange={(e) => onChange({ ...form, locationsDetail: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>원본 사진 수</label>
          <input style={inputStyle} value={form.originalPhotos} placeholder="800+" onChange={(e) => onChange({ ...form, originalPhotos: e.target.value })}/>
        </div>
        <div>
          <label style={labelStyle}>보정본 수</label>
          <input style={inputStyle} type="number" value={form.retouched} placeholder="40" onChange={(e) => onChange({ ...form, retouched: e.target.value })}/>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>보정 상세</label>
          <input style={inputStyle} value={form.retouchedDetail} placeholder="Detailed Retouched: 25 (Customer Selected) + Color Correction: 15" onChange={(e) => onChange({ ...form, retouchedDetail: e.target.value })}/>
        </div>
      </div>


      <CollapsibleSection title="Partners" count={form.videographerIds.length + form.hmuIds.length + form.dressIds.length + form.suitIds.length + form.bouquetIds.length}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
          <PartnerCheckboxGroup label="Videographer" list={videographerList} selectedIds={form.videographerIds} onToggle={(id) => togglePartner('videographerIds', id)} partnerLabel={partnerLabel}/>
          <PartnerCheckboxGroup label="Hair &amp; Makeup" list={hmuList} selectedIds={form.hmuIds} onToggle={(id) => togglePartner('hmuIds', id)} partnerLabel={partnerLabel}/>
          <PartnerCheckboxGroup label="Dress" list={dressList} selectedIds={form.dressIds} onToggle={(id) => togglePartner('dressIds', id)} partnerLabel={partnerLabel}/>
          <PartnerCheckboxGroup label="Suit" list={suitList} selectedIds={form.suitIds} onToggle={(id) => togglePartner('suitIds', id)} partnerLabel={partnerLabel}/>
          <PartnerCheckboxGroup label="Bouquet" list={bouquetList} selectedIds={form.bouquetIds} onToggle={(id) => togglePartner('bouquetIds', id)} partnerLabel={partnerLabel}/>
        </div>
        <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>노출 순서는 우측 상단 "미리보기"에서 변경할 수 있습니다.</p>
      </CollapsibleSection>


      {allInclusions.length > 0 && (
        <CollapsibleSection title="Package Inclusive" count={form.inclusionIds.length}>
          <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 6,
            }}>
            {allInclusions.map((inc) => (<label key={inc.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                }}>
                <input type="checkbox" checked={form.inclusionIds.includes(inc.id)} onChange={() => onChange({
                    ...form,
                    inclusionIds: toggleId(form.inclusionIds, inc.id),
                })}/>
                {inc.name}
              </label>))}
          </div>
        </CollapsibleSection>
      )}


      {allAddons.length > 0 && (
        <CollapsibleSection title="Add-ons" count={form.addonIds.length}>
          <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 6,
            }}>
            {allAddons.map((addon) => (<label key={addon.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                }}>
                <input type="checkbox" checked={form.addonIds.includes(addon.id)} onChange={() => onChange({
                    ...form,
                    addonIds: toggleId(form.addonIds, addon.id),
                })}/>
                <span>
                  {addon.name}
                  <span style={{ display: 'block', fontSize: 11, color: '#888' }}>
                    USD {addon.price.toLocaleString()}
                    {addon.desc ? ` · ${addon.desc.slice(0, 40)}${addon.desc.length > 40 ? '…' : ''}` : ''}
                  </span>
                </span>
              </label>))}
          </div>
        </CollapsibleSection>
      )}

      
      {!hideButtons && (<div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={btnStyle('#000', '#fff')} onClick={onSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
          <button style={btnStyle('#fff', '#000', '#000')} onClick={onCancel}>
            취소
          </button>
        </div>)}
      {showPreview && (<div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }} onClick={(e) => {
                if (e.target === e.currentTarget)
                    setShowPreview(false);
            }}>
          <div style={{
                width: '100%',
                maxWidth: 720,
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
            <PackagePreview onClose={() => setShowPreview(false)} name={form.name} subtitle={form.subtitle} priceSNS={Number(form.priceSNS) || 0} priceNoSNS={Number(form.priceNoSNS) || 0} isSinglePrice={form.isSinglePrice} shootingTime={form.shootingTime} shootingTimeDetail={form.shootingTimeDetail} locations={form.locations} locationsDetail={form.locationsDetail} originalPhotos={form.originalPhotos} retouched={Number(form.retouched) || 0} retouchedDetail={form.retouchedDetail} inclusionIds={form.inclusionIds} allInclusions={allInclusions} onReorderInclusions={(inclusionIds) => onChange({ ...form, inclusionIds })} addonIds={form.addonIds} allAddons={allAddons} onReorderAddons={(addonIds) => onChange({ ...form, addonIds })} partnerRows={partnerRows} onReorderPartners={(ids) => onChange({ ...form, partnerOrder: ids })}/>
          </div>
        </div>)}
    </div>);
}
function PartnerCheckboxGroup({ label, list, selectedIds, onToggle, partnerLabel, }: {
    label: string;
    list: Partner[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    partnerLabel: (p: Partner) => string;
}) {
    return (<div>
      <label style={labelStyle}>{label}</label>
      <div style={{
            border: '1px solid #d5d5d5',
            borderRadius: 6,
            padding: 8,
            maxHeight: 160,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        }}>
        {list.length === 0 && (<span style={{ fontSize: 12, color: '#999' }}>등록된 항목 없음</span>)}
        {list.map((p) => (<label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => onToggle(p.id)}/>
            {partnerLabel(p)}
          </label>))}
      </div>
    </div>);
}
function CollapsibleSection({ title, count, children }: {
    title: string;
    count: number;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (<div style={{ marginTop: 16 }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
        }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#acacac', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#acacac' }}>({count}개 선택됨)</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#000' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>);
}
