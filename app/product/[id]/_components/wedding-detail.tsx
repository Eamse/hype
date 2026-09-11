'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { parseShootDetailValue } from '@/lib/package-display';
type Director = {
    id: number;
    number: string;
    name: string;
    instagram: string | null;
};
type Addon = {
    id: number;
    name: string;
    displayName: string | null;
    price: number;
    desc: string | null;
};
type PackageAddon = {
    addon: Addon;
};
type Inclusion = {
    id: number;
    name: string;
};
type Partner = {
    id: number;
    role: string;
    name: string;
    displayName: string | null;
    instagram: string | null;
    instagramAccounts: { handle: string }[];
};
type Package = {
    id: number;
    directorId: number;
    name: string;
    subtitle: string | null;
    priceSNS: number;
    priceNoSNS: number;
    hasPriceSNS: boolean;
    hasPriceNoSNS: boolean;
    isSinglePrice: boolean;
    shootingTime: string;
    shootingTimeDetail: string | null;
    locations: string;
    locationsDetail: string | null;
    originalPhotos: string;
    retouched: number;
    retouchedDetail: string | null;
    director: Director;
    addons: PackageAddon[];
    inclusions: {
        inclusion: Inclusion;
    }[];
    partners: {
        partner: Partner;
    }[];
    images: {
        id: number;
        webUrl: string;
        originalUrl: string;
        thumbUrl: string | null;
    }[];
};
const INQUIRY_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf5wIchc4qYFhPbX1VOlMiFvkNugZpeFa16ArIjuuwd5EW6UA/viewform?usp=send_form';
function AddonDesc({ text }: {
    text: string;
}) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
}
const WHITE = 'text-[#fff]';
const GREEN = 'text-[#2D5A45]';
const GRAY1 = 'text-[#444444]';
const GRAY2 = 'text-[#666666]';
const GRAY3 = 'text-[#AAAAAA]';
const GRAY4 = 'text-[rgb(85,85,85)]';
const BLACK = 'text-[#0D0D0D]';
const BORDER = 'border-[#EEEEEE]';
const GRAYL = 'text-[rgba(255,255,255,0.75)]';
function InstagramLink({ handles }: {
    handles: string[];
}) {
    if (handles.length === 0)
        return null;
    return (<span>
      {handles.map((h, i) => (<span key={h}>
          <a href={`https://instagram.com/${h.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={`text-[11px] font-normal ${GRAY2} no-underline hover:underline`}>
            {h}
          </a>
          {i < handles.length - 1 && ' / '}
        </span>))}
    </span>);
}
export default function WeddingDetail({ productId, title, section, directors, packages, onActiveImagesChange, }: {
    productId: number;
    title: string;
    section?: string;
    directors: Director[];
    packages: Package[];
    onActiveImagesChange?: (images: {
        id: number;
        webUrl: string;
        originalUrl: string;
        thumbUrl: string | null;
    }[]) => void;
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const [prices, setPrices] = useState<Record<number, {
        priceSNS: number;
        priceNoSNS: number;
    }>>({});
    useEffect(() => {
        if (!session) {
            setPrices({});
            return;
        }
        const controller = new AbortController();
        fetch(`/api/products/${productId}/pricing`, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: {
            prices?: typeof prices;
        } | null) => {
            if (data?.prices)
                setPrices(data.prices);
        })
            .catch((e: Error) => {
            if (e.name !== 'AbortError')
                console.error(e);
        });
        return () => controller.abort();
    }, [session, productId]);
    const firstDirectorId = directors[0]?.id ?? null;
    const [activeDirectorId, setActiveDirectorId] = useState<number | null>(firstDirectorId);
    const currentPackages = packages.filter((p) => p.directorId === activeDirectorId);
    const [activePackageId, setActivePackageId] = useState<number | null>(currentPackages[0]?.id ?? null);
    const [expandedAddon, setExpandedAddon] = useState<number | null>(null);
    function handleDirectorSelect(directorId: number) {
        setActiveDirectorId(directorId);
        const firstPkg = packages.find((p) => p.directorId === directorId);
        setActivePackageId(firstPkg?.id ?? null);
        setExpandedAddon(null);
    }
    const productNumber = directors[0]?.number.split('-')[0];
    const regionLabel = section?.includes('Jeju')
        ? 'Jeju'
        : section?.includes('Seoul')
            ? 'Seoul'
            : '';
    const paddedNumber = productNumber
        ? productNumber.replace('#', '').padStart(2, '0')
        : '';
    const pkgNumLabel = ['Photographer', regionLabel, paddedNumber]
        .filter(Boolean)
        .join(' ');
    const activePkgs = packages.filter((p) => p.directorId === activeDirectorId);
    useEffect(() => {
        onActiveImagesChange?.(activePkgs[0]?.images ?? []);
    }, [activeDirectorId]);
    const activePackage = activePkgs.find((p) => p.id === activePackageId) ?? activePkgs[0];
    const allInclusions = activePackage?.inclusions ?? [];
    const inclusions = allInclusions.filter(({ inclusion }) => !inclusion.name.trim().startsWith('Note:'));
    const inclusionNotes = allInclusions.filter(({ inclusion }) => inclusion.name.trim().startsWith('Note:'));
    const addons = activePackage?.addons ?? [];
    const packagePartners = activePackage?.partners ?? [];
    const ROLE_LABELS: Record<string, string> = {
        videographer: 'Videographer',
        hmu: 'Hair & Makeup',
        dress: 'Dress',
        suit: 'Suit',
        bouquet: 'Bouquet',
    };
    const partnerRowsRaw = [
        {
            role: 'Photographer',
            name: activePackage?.director.name ?? '',
            instagramHandles: (activePackage?.director.instagram ?? '').split(' / ').map((h) => h.trim()).filter(Boolean),
        },
        ...packagePartners.map(({ partner }) => ({
            role: ROLE_LABELS[partner.role] ?? partner.role,
            name: partner.displayName ?? partner.name,
            instagramHandles: partner.instagramAccounts.map((a) => a.handle),
        })),
    ] as {
        role: string;
        name: string;
        instagramHandles: string[];
    }[];
    // 같은 role에 파트너가 여러 명이면 한 행으로 합쳐서 이름/계정을 " / "로 이어붙임
    const partnerRows = Object.values(partnerRowsRaw.reduce((acc, row) => {
        const existing = acc[row.role];
        if (existing) {
            existing.name = [...new Set([...existing.name.split(' / '), row.name])].join(' / ');
            existing.instagramHandles = [...existing.instagramHandles, ...row.instagramHandles];
        }
        else {
            acc[row.role] = { ...row, instagramHandles: [...row.instagramHandles] };
        }
        return acc;
    }, {} as Record<string, { role: string; name: string; instagramHandles: string[] }>));
    const shootDetails = activePackage
        ? [
            { label: 'Duration', value: activePackage.shootingTime, detail: activePackage.shootingTimeDetail },
            { label: 'Locations', value: activePackage.locations, detail: activePackage.locationsDetail },
            { label: 'Original Photos', value: activePackage.originalPhotos, detail: null },
        ]
        : [];
    const hasPartners = partnerRows.length > 0;
    const hasInclusions = inclusions.length > 0;
    const hasDetails = !!activePackage;
    const inclusionsIsFirst = !hasPartners && hasInclusions;
    const detailsIsFirst = !hasPartners && !hasInclusions && hasDetails;
    const priceCount = activePackage
        ? activePackage.isSinglePrice
            ? activePackage.hasPriceSNS || activePackage.hasPriceNoSNS
                ? 1
                : 0
            : [activePackage.hasPriceSNS, activePackage.hasPriceNoSNS].filter(Boolean)
                .length
        : 0;
    const activePrice = activePackage ? prices[activePackage.id] : undefined;
    const secLabelBase = `text-[12px] font-semibold ${GRAY3} tracking-[0.12em] uppercase mb-4`;
    const tabState = (active: boolean) => active
        ? 'font-medium bg-[#0D0D0D] text-white border-[#0D0D0D]'
        : `font-normal bg-white ${GRAY2} ${BORDER}`;
    return (<div className={`w-full lg:max-w-[680px] ${BLACK}`}>
      <div className={`bg-white border ${BORDER} rounded-2xl overflow-hidden`}>
        
        <div className={`pt-6 px-4 pb-5 sm:pt-8 sm:px-8 sm:pb-6 text-center border-b ${BORDER}`}>
          <div className={`text-[11px] font-medium ${GREEN} tracking-[0.12em] uppercase mb-2`}>
            {pkgNumLabel}
          </div>
          <div className={`text-[20px] sm:text-[24px] font-semibold ${BLACK} tracking-[-0.02em] mb-5`}>
            {title}
            {directors.length > 1 &&
            activePackage &&
            ` (${activePackage.director.name})`}
          </div>

          {directors.length > 1 && (<div className="flex gap-[6px] justify-center flex-wrap mb-2">
              {directors.map((d) => (<span key={d.id} className={`text-[12px] py-[5px] px-[14px] border rounded-[20px] cursor-pointer ${tabState(activeDirectorId === d.id)}`} onClick={() => handleDirectorSelect(d.id)}>
                  {d.name}
                </span>))}
            </div>)}

          {activePkgs.length > 0 && (<div className="flex gap-[6px] justify-center flex-wrap mb-2">
              {activePkgs.map((pkg) => (<span key={pkg.id} className={`text-[13px] py-[5px] px-[14px] font-normal tracking-normal border rounded-[2px] cursor-pointer ${tabState(activePackageId === pkg.id)}`} onClick={() => setActivePackageId(pkg.id)}>
                  {activePkgs.length === 1 ? pkg.name.replace(/\s+[A-Z]$/, '') : pkg.name}
                </span>))}
            </div>)}
        </div>

        
        <div className="py-5 px-4 sm:py-6 sm:px-8">
          
          {hasPartners && (<>
              <div className={secLabelBase}>Partners</div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-[10px]">
                {partnerRows.map((item, i) => (<div key={item.role} className={`py-[10px] px-3 bg-[#F9F9F9] rounded-[8px]  ${partnerRows.length % 2 === 1 &&
                    i === partnerRows.length - 1
                    ? 'col-span-2'
                    : ''}`}>
                    <div className={`text-[10px] font-normal ${GRAY3} mb-[2px]`}>
                      {item.role}
                    </div>
                    <div className={`text-[13px] font-semibold ${BLACK} mb-[1px]`}>
                      {item.name}
                    </div>
                    <InstagramLink handles={item.instagramHandles}/>
                  </div>))}
              </div>
              <p className={`text-[11px] font-normal ${GRAY3} italic mt-2`}>
                * Please check each studio&apos;s portfolio on Instagram
              </p>
            </>)}

          
          {hasInclusions && (<>
              <div className={`${secLabelBase} ${inclusionsIsFirst ? '' : 'mt-7'}`}>
                What&apos;s Included
              </div>
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-0">
                {inclusions.map(({ inclusion }) => (<div key={inclusion.id} className={`flex gap-2 items-start text-[12px] sm:text-[13px] font-normal ${GRAY1} leading-[1.5] py-[6px] border-b border-[#F5F5F5] [&:nth-last-child(-n+2)]:border-b-0`}>
                    <span className={`${GREEN} shrink-0 text-[12px] mt-[1px] font-semibold`}>
                      ✓
                    </span>
                    {inclusion.name}
                  </div>))}
              </div>
              {inclusionNotes.length > 0 && (<div className="border-t border-[#F5F5F5] mt-2 pt-2">
                  {inclusionNotes.map(({ inclusion }) => (<p key={inclusion.id} className={`flex gap-2 items-center text-[11px] font-normal ${GRAY3} leading-[1.5]`}>
                      <span className={`${GREEN} shrink-0 text-[12px] font-semibold leading-[1.5]`}>
                        ✓
                      </span>
                      {inclusion.name}
                    </p>))}
                </div>)}
            </>)}

          
          {hasDetails && activePackage && (<>
              <div className={`${secLabelBase} ${detailsIsFirst ? '' : 'mt-7'}`}>
                Shoot Details
              </div>
              <div className="grid grid-cols-2 gap-y-4 min-[480px]:grid-cols-4 min-[480px]:gap-y-0">
                {shootDetails.map((d) => {
                const { num, unit: parsedUnit } = parseShootDetailValue(d.value);
                const unit = parsedUnit || (d.label === 'Original Photos' ? 'photos' : '');
                return (<div key={d.label} className="pr-0 min-[480px]:pr-4 min-[480px]:last:pr-0">
                      <div className={`text-[11px] font-normal ${GRAY3} mb-[6px]`}>
                        {d.label}
                      </div>
                      <div className={`text-[22px] font-bold ${BLACK} leading-none tracking-[-0.02em]`}>
                        {num}
                      </div>
                      {unit && (<div className={`text-[11px] font-normal ${GRAY2} mt-[2px]`}>
                          {unit}
                        </div>)}
                      {d.detail && (<div className={`text-[10px] font-normal ${GRAY3} mt-1 leading-[1.5]`}>
                          {d.detail}
                        </div>)}
                    </div>);
            })}
                <div className="pr-0 min-[480px]:pr-4 min-[480px]:last:pr-0">
                  <div className={`text-[11px] font-normal ${GRAY3} mb-[6px]`}>
                    Retouched Photos
                  </div>
                  <div className={`text-[22px] font-bold ${BLACK} leading-none tracking-[-0.02em]`}>
                    {activePackage.retouched}
                  </div>
                  <div className={`text-[11px] font-normal ${GRAY2} mt-[2px]`}>
                    photos
                  </div>
                  {activePackage.retouchedDetail && (<div className={`text-[10px] font-normal ${GRAY3} mt-1 leading-[1.5]`}>
                      {activePackage.retouchedDetail}
                    </div>)}
                </div>
              </div>
            </>)}
        </div>

        
        {addons.length > 0 && (<div className={`py-5 px-4 sm:py-6 sm:px-8 border-t ${BORDER} bg-[#FAFAFA]`}>
            <div className={secLabelBase}>Add-ons</div>
            {addons.map(({ addon }, i) => (<div key={addon.id} className={i === addons.length - 1 ? '' : 'mb-2'}>
                <div className={`flex justify-between items-center gap-2 py-[10px] px-3 sm:py-[11px] sm:px-[14px] border ${BORDER} rounded-[8px] bg-white cursor-pointer`} onClick={() => setExpandedAddon(expandedAddon === i ? null : i)}>
                  <span className={`text-[12px] sm:text-[13px] font-normal ${BLACK}`}>
                    {addon.displayName ?? addon.name}
                  </span>
                  <div className={`text-[12px] sm:text-[13px] font-medium ${GRAY1} flex items-center gap-[6px] shrink-0`}>
                    {addon.price > 0 ? `+$${addon.price.toLocaleString()}` : 'See details'}
                    <div className={`w-5 h-5 rounded-full border ${BORDER} flex items-center justify-center text-[11px] ${GRAY3} shrink-0`}>
                      {expandedAddon === i ? '−' : '+'}
                    </div>
                  </div>
                </div>
                {expandedAddon === i && addon.desc && (<p className={`text-[11px] sm:text-[12px] pt-2 ${GRAY2} leading-[1.6] -mt-[2px] mb-[10px] px-3 sm:px-[14px]`}>
                    <AddonDesc text={addon.desc}/>
                  </p>)}
              </div>))}
            <p className={`text-[11px] font-normal ${GRAY3} italic mt-[10px]`}>
              * Add-ons are NOT included in the total price. Additional charges
              will apply.
            </p>
          </div>)}

        
        {activePackage && priceCount > 0 && session && (<div className={`border-t ${BORDER}`}>
            <div className={`grid ${priceCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {activePackage.isSinglePrice ? (<div className="py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1 bg-[#2d5a45] border-r border-[#EEEEEE]">
                  <div className="flex flex-col items-center gap-[2px] text-center">
                    <span className="text-[10px] sm:text-[14px] font-bold leading-tight text-[rgba(255,255,255,0.75)]">
                      PACKAGE PRICE
                    </span>
                  </div>
                  <div className="text-[16px] text-center font-medium text-[#fff] tracking-[-0.02em]">
                    {activePrice
                    ? `USD ${(activePrice.priceSNS || activePrice.priceNoSNS).toLocaleString()}`
                    : '···'}
                  </div>
                </div>) : (<>
                  {activePackage.hasPriceSNS && (<div className={`py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1 bg-[#2d5a45] ${priceCount > 1 ? `border-r ${BORDER}` : ''}`}>
                      <div className="flex flex-col items-center gap-[2px] text-center">
                        <span className={`text-[10px] sm:text-[14px] font-bold leading-tight ${GRAYL}`}>
                          DISCOUNTED PRICE
                        </span>
                        <span className={`text-[9px] sm:text-[12px] font-medium leading-tight ${GRAYL}`}>
                          (WITH SNS UPLOAD CONSENT)
                        </span>
                      </div>
                      <div className={`text-[16px] text-center font-medium ${WHITE} tracking-[-0.02em]`}>
                        {activePrice
                        ? `USD ${activePrice.priceSNS.toLocaleString()}`
                        : '···'}
                      </div>
                    </div>)}
                  {activePackage.hasPriceNoSNS && (<div className="py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1">
                      <div className="flex flex-col items-center gap-[2px] text-center">
                        <span className="text-[10px] sm:text-[14px] font-bold leading-tight text-[#666666]">
                          REGULAR PRICE
                        </span>
                        <span className="text-[9px] sm:text-[12px] font-medium leading-tight text-[#666666]">
                          (NO SNS UPLOAD CONSENT)
                        </span>
                      </div>
                      <div className={`text-[16px] text-center font-medium ${BLACK} tracking-[-0.02em]`}>
                        {activePrice
                        ? `USD ${activePrice.priceNoSNS.toLocaleString()}`
                        : '···'}
                      </div>
                    </div>)}
                </>)}
            </div>
            <div className={`py-3 px-4 sm:px-6 bg-[#FAFAFA] border-t ${BORDER}`}>
              <p className={`text-[11px] font-normal ${GRAY3} italic leading-[1.6] mb-[3px] last:mb-0`}>
                * Final price is subject to change based on current USD exchange
                rate and does NOT include add-ons.
              </p>
              <p className={`text-[11px] font-normal ${GRAY3} italic leading-[1.6] mb-[3px] last:mb-0`}>
                * SNS Upload: Hype Pig (Hype Wedding, Hype Snap) SNS,
                Photographer SNS
              </p>
            </div>
          </div>)}

        
        <div className={`py-5 px-4 sm:py-6 sm:px-8 border-t ${BORDER} text-center bg-white`}>
          {!session ? (<>
              <p className={'text-center py-2 text-[11px] sm:text-[18px] font-medium text-black'}>
                Want to Check the price?
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-2 sm:gap-x-4 mb-4">
                <span className="row-start-1 row-span-2 col-start-2 self-center text-[15px] font-normal text-black">
                  or
                </span>
                <button onClick={() => router.push('?auth=1')} className="row-start-2 col-start-1 justify-self-center w-[130px] sm:w-[142px] mt-3 mx-1 py-[9px] px-3 sm:px-[18px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none bg-[#0D0D0D] text-white text-center">
                  Login / Sign up
                </button>
                <a href={INQUIRY_FORM_URL} target="_blank" rel="noopener noreferrer" className="row-start-2 col-start-3 justify-self-center mt-3 mx-1 py-[9px] px-3 sm:px-[18px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none no-underline bg-[#0D0D0D] text-white text-center">
                  Submit your Inquiry
                </a>
              </div>
            </>) : (<>
              <p className={`text-[14px] font-normal ${GRAY4} mb-4`}>
                Ready to book or have questions?
              </p>
              <a href={INQUIRY_FORM_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-[14px] bg-[#0D0D0D] text-white border-none rounded-[8px] text-[14px] font-medium cursor-pointer no-underline">
                Submit your Inquiry
              </a>
            </>)}
          <p className={`text-[12px] font-normal ${GRAY4} mt-3`}>
            Instagram:{' '}
            <a href="https://instagram.com/hypewedd_ing" target="_blank" rel="noopener noreferrer" className={`${GRAY4} no-underline`}>
              @hypewedd_ing
            </a>
          </p>
        </div>
      </div>
    </div>);
}
