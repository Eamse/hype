'use client';
import { useState } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';
import PackagePreview from './package-preview';
import { toggleId, type PkgForm, type Inclusion, type Addon, type Partner, } from './wedding-photographer-types';
import { applySinglePriceToggle } from '@/lib/single-price';
export default function PackageForm({ form, onChange, allInclusions, allAddons, allPartners, onSave, onCancel, saving, hideButtons = false, }: {
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
    const videographerList = allPartners.filter((p) => p.role === 'videographer');
    const hmuList = allPartners.filter((p) => p.role === 'hmu');
    const dressList = allPartners.filter((p) => p.role === 'dress');
    const suitList = allPartners.filter((p) => p.role === 'suit');
    const bouquetList = allPartners.filter((p) => p.role === 'bouquet');
    const [showPreview, setShowPreview] = useState(false);
    const partnerRows = [
        form.videographerId
            ? {
                role: 'Videographer',
                name: allPartners.find((p) => p.id === form.videographerId)?.name ?? '',
            }
            : null,
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
    ].filter(Boolean) as {
        role: string;
        name: string;
    }[];
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

      
      <p style={sectionTitle}>Partners</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Videographer</label>
          <select style={inputStyle} value={form.videographerId ?? ''} onChange={(e) => onChange({
            ...form,
            videographerId: e.target.value ? Number(e.target.value) : null,
        })}>
            <option value="">없음</option>
            {videographerList.map((p) => (<option key={p.id} value={p.id}>
                {p.name}
              </option>))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Hair &amp; Makeup</label>
          <select style={inputStyle} value={form.hmuId ?? ''} onChange={(e) => onChange({
            ...form,
            hmuId: e.target.value ? Number(e.target.value) : null,
        })}>
            <option value="">없음</option>
            {hmuList.map((p) => (<option key={p.id} value={p.id}>
                {p.name}
              </option>))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Dress</label>
          <select style={inputStyle} value={form.dressId ?? ''} onChange={(e) => onChange({
            ...form,
            dressId: e.target.value ? Number(e.target.value) : null,
        })}>
            <option value="">없음</option>
            {dressList.map((p) => (<option key={p.id} value={p.id}>
                {p.name}
              </option>))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Suit</label>
          <select style={inputStyle} value={form.suitId ?? ''} onChange={(e) => onChange({
            ...form,
            suitId: e.target.value ? Number(e.target.value) : null,
        })}>
            <option value="">없음</option>
            {suitList.map((p) => (<option key={p.id} value={p.id}>
                {p.name}
              </option>))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Bouquet</label>
          <select style={inputStyle} value={form.bouquetId ?? ''} onChange={(e) => onChange({
            ...form,
            bouquetId: e.target.value ? Number(e.target.value) : null,
        })}>
            <option value="">없음</option>
            {bouquetList.map((p) => (<option key={p.id} value={p.id}>
                {p.name}
              </option>))}
          </select>
        </div>
      </div>

      
      {allInclusions.length > 0 && (<>
          <p style={sectionTitle}>Package Inclusive</p>
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
        </>)}

      
      {allAddons.length > 0 && (<>
          <p style={sectionTitle}>Add-ons</p>
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
        </>)}

      
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
            <PackagePreview onClose={() => setShowPreview(false)} name={form.name} subtitle={form.subtitle} priceSNS={Number(form.priceSNS) || 0} priceNoSNS={Number(form.priceNoSNS) || 0} shootingTime={form.shootingTime} shootingTimeDetail={form.shootingTimeDetail} locations={form.locations} locationsDetail={form.locationsDetail} originalPhotos={form.originalPhotos} retouched={Number(form.retouched) || 0} retouchedDetail={form.retouchedDetail} inclusionIds={form.inclusionIds} allInclusions={allInclusions} onReorderInclusions={(inclusionIds) => onChange({ ...form, inclusionIds })} addonIds={form.addonIds} allAddons={allAddons} onReorderAddons={(addonIds) => onChange({ ...form, addonIds })} partnerRows={partnerRows}/>
          </div>
        </div>)}
    </div>);
}
