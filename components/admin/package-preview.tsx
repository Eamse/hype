'use client';
function moveInArray<T>(items: T[], index: number, direction: 'up' | 'down'): T[] {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length)
        return items;
    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return next;
}
const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    color: '#000',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: '0 0 12px',
    fontWeight: 'bold',
};
function ReorderRow({ position, label, extra, canMoveUp, canMoveDown, onMoveUp, onMoveDown, }: {
    position: number;
    label: string;
    extra?: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    return (<div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            border: '1px solid #000',
            borderRadius: 4,
            background: '#fff',
        }}>
      <span style={{
            color: '#000',
            fontWeight: 700,
            flexShrink: 0,
            minWidth: 16,
        }}>
        {position}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: '#000' }}>{label}</span>
      {extra && (<span style={{ fontSize: 12, color: '#000', fontWeight: 500 }}>
          {extra}
        </span>)}
      <button type="button" disabled={!canMoveUp} onClick={onMoveUp} style={{
            background: 'none',
            border: '1px solid #e0d8c8',
            borderRadius: 4,
            cursor: canMoveUp ? 'pointer' : 'default',
            color: canMoveUp ? '#000' : '#bbb',
            padding: '1px 6px',
            fontSize: 11,
        }}>
        ▲
      </button>
      <button type="button" disabled={!canMoveDown} onClick={onMoveDown} style={{
            background: 'none',
            border: '1px solid #e0d8c8',
            borderRadius: 4,
            cursor: canMoveDown ? 'pointer' : 'default',
            color: canMoveDown ? '#000' : '#bbb',
            padding: '1px 6px',
            fontSize: 11,
        }}>
        ▼
      </button>
    </div>);
}
export default function PackagePreview({ name, subtitle, priceSNS, priceNoSNS, shootingTime, shootingTimeDetail, locations, locationsDetail, originalPhotos, retouched, retouchedDetail, inclusionIds, allInclusions, onReorderInclusions, addonIds, allAddons, onReorderAddons, partnerRows, onClose, }: {
    name: string;
    subtitle: string;
    priceSNS: number;
    priceNoSNS: number;
    shootingTime: string;
    shootingTimeDetail: string;
    locations: string;
    locationsDetail: string;
    originalPhotos: string;
    retouched: number;
    retouchedDetail: string;
    inclusionIds: number[];
    allInclusions: {
        id: number;
        name: string;
    }[];
    onReorderInclusions: (ids: number[]) => void;
    addonIds: number[];
    allAddons: {
        id: number;
        name: string;
        displayName: string | null;
        price: number;
        desc: string | null;
    }[];
    onReorderAddons: (ids: number[]) => void;
    partnerRows: {
        role: string;
        name: string;
    }[];
    onClose?: () => void;
}) {
    return (<div style={{
            position: 'relative',
            color: '#2C2420',
            background: '#fff',
            border: '1px solid #000',
            borderRadius: 8,
            padding: 24,
            maxWidth: 680,
            width: '100%',
        }}>
      {onClose && (<button type="button" onClick={onClose} style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 38,
                height: 38,
                background: '#fff',
                color: '#3a1a2a',
                fontSize: 30,
                lineHeight: 1,
                cursor: 'pointer',
            }}>
          ×
        </button>)}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{
            fontSize: 11,
            color: '#000',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0,
        }}>
          미리보기
        </p>
        <h3 style={{ fontSize: 20, fontWeight: 600, margin: '4px 0 0' }}>
          {name || '(패키지명 없음)'}
        </h3>
        {subtitle && (<p style={{
                fontSize: 13,
                color: '#000',
                fontWeight: 500,
                margin: '6px 0 0',
            }}>
            {subtitle}
          </p>)}
      </div>

      {partnerRows.length > 0 && (<div style={{
                border: '1px solid #000',
                borderRadius: 4,
                background: '#fff',
                padding: '16px 20px',
                marginBottom: 20,
            }}>
          <p style={{ ...sectionLabel, margin: '0 0 12px' }}>Partners</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {partnerRows.map((item) => (<div key={item.role} style={{ fontSize: 13 }}>
                <span style={{ color: '#000' }}>{item.role}: </span>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
              </div>))}
          </div>
        </div>)}

      {inclusionIds.length > 0 && (<div style={{ marginBottom: 20 }}>
          <p style={sectionLabel}>Package Inclusive</p>
          <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 6,
            }}>
            {inclusionIds.map((id, i) => {
                const item = allInclusions.find((x) => x.id === id);
                if (!item)
                    return null;
                return (<ReorderRow key={id} position={i + 1} label={item.name} canMoveUp={i > 0} canMoveDown={i < inclusionIds.length - 1} onMoveUp={() => onReorderInclusions(moveInArray(inclusionIds, i, 'up'))} onMoveDown={() => onReorderInclusions(moveInArray(inclusionIds, i, 'down'))}/>);
            })}
          </div>
        </div>)}

      {(shootingTime || locations || originalPhotos || retouched > 0) && (<div style={{
                border: '1px solid #000',
                background: '#fff',
                borderRadius: 4,
                padding: '16px 20px',
                marginBottom: 20,
            }}>
          <p style={{ ...sectionLabel, margin: '0 0 12px' }}>
            Photography Details
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
                { label: 'Shooting Time', value: shootingTime, detail: shootingTimeDetail },
                { label: 'Locations', value: locations, detail: locationsDetail },
                { label: 'Original Photos', value: originalPhotos, detail: '' },
                {
                    label: 'Retouched',
                    value: retouched ? `${retouched} images` : '',
                    detail: '',
                },
            ].map((d) => (<div key={d.label}>
                <div style={{ fontSize: 11, color: '#000', marginBottom: 2 }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 14, color: '#000' }}>
                  {d.value || '-'}
                </div>
                {d.detail && (<div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    {d.detail}
                  </div>)}
              </div>))}
          </div>
          {retouchedDetail && (<p style={{
                    fontSize: 12,
                    color: '#000',
                    margin: '12px 0 0',
                    lineHeight: 1.5,
                }}>
              {retouchedDetail}
            </p>)}
        </div>)}

      {(priceSNS > 0 || priceNoSNS > 0) && (<div style={{
                display: 'grid',
                gridTemplateColumns: priceSNS > 0 && priceNoSNS > 0 ? '1fr 1fr' : '1fr',
                gap: 10,
                marginBottom: 20,
            }}>
          {priceSNS > 0 && (<div style={{
                    background: '#2C2420',
                    borderRadius: 4,
                    padding: '16px 12px',
                    textAlign: 'center',
                }}>
              <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.75)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                }}>
                Agree to SNS
              </div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>
                ${priceSNS.toLocaleString()}
              </div>
            </div>)}
          {priceNoSNS > 0 && (<div style={{
                    background: '#fff',
                    border: '1px solid #000',
                    borderRadius: 4,
                    padding: '16px 12px',
                    textAlign: 'center',
                }}>
              <div style={{
                    fontSize: 11,
                    color: '#000',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                }}>
                Decline SNS
              </div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#2C2420' }}>
                ${priceNoSNS.toLocaleString()}
              </div>
            </div>)}
        </div>)}

      {addonIds.length > 0 && (<div>
          <p style={sectionLabel}>Add-ons</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {addonIds.map((id, i) => {
                const item = allAddons.find((x) => x.id === id);
                if (!item)
                    return null;
                return (<ReorderRow key={id} position={i + 1} label={item.displayName ?? item.name} extra={`$${item.price || 0}`} canMoveUp={i > 0} canMoveDown={i < addonIds.length - 1} onMoveUp={() => onReorderAddons(moveInArray(addonIds, i, 'up'))} onMoveDown={() => onReorderAddons(moveInArray(addonIds, i, 'down'))}/>);
            })}
          </div>
        </div>)}
    </div>);
}
