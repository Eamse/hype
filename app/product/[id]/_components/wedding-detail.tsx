'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Director = {
  id: number;
  number: string;
  name: string;
  instagram: string | null;
};

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
  // 서버(page.tsx)에서 항상 0으로 마스킹해서 내려줌 — 실제 금액은 비로그인 사용자 페이지 소스에
  // 노출되면 안 되므로 /api/products/[id]/pricing (인증 필요)에서 별도로 받아옴.
  priceSNS: number;
  priceNoSNS: number;
  hasPriceSNS: boolean;
  hasPriceNoSNS: boolean;
  isSinglePrice: boolean;
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail: string | null;
  director: Director;
  addons: { addon: Addon }[];
  inclusions: { inclusion: Inclusion }[];
  partners: { partner: Partner }[];
  images: {
    id: number;
    webUrl: string;
    originalUrl: string;
    thumbUrl: string | null;
  }[];
};

const INQUIRY_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf5wIchc4qYFhPbX1VOlMiFvkNugZpeFa16ArIjuuwd5EW6UA/viewform?usp=send_form';

/** 문장이 2개 이상(마침표 2개 이상)이면 문장 단위로 줄바꿈, 한 문장뿐이면 그대로 둠 */
function AddonDesc({ text }: { text: string }) {
  const sentences = text
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return <>{text}</>;
  return (
    <>
      {sentences.map((s, i) => (
        <span key={i}>
          {s}.{i < sentences.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

const GREEN = 'text-[#2D5A45]';
const GRAY1 = 'text-[#444444]';
const GRAY2 = 'text-[#666666]';
const GRAY3 = 'text-[#AAAAAA]';
const GRAY4 = 'text-[rgb(85, 85, 85)]';
const BLACK = 'text-[#0D0D0D]';
const BORDER = 'border-[#EEEEEE]';

function InstagramLink({ handle }: { handle: string | null }) {
  if (!handle) return null;
  const handles = handle.split(' / ');
  return (
    <span>
      {handles.map((h, i) => (
        <span key={h}>
          <a
            href={`https://instagram.com/${h.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] font-normal ${GRAY2} no-underline hover:underline`}
          >
            {h}
          </a>
          {i < handles.length - 1 && ' / '}
        </span>
      ))}
    </span>
  );
}

export default function WeddingDetail({
  productId,
  title,
  section,
  directors,
  packages,
  onActiveImagesChange,
}: {
  productId: number;
  title: string;
  section?: string;
  directors: Director[];
  packages: Package[];
  onActiveImagesChange?: (
    images: {
      id: number;
      webUrl: string;
      originalUrl: string;
      thumbUrl: string | null;
    }[],
  ) => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [prices, setPrices] = useState<
    Record<number, { priceSNS: number; priceNoSNS: number }>
  >({});

  useEffect(() => {
    if (!session) {
      setPrices({});
      return;
    }
    const controller = new AbortController();
    fetch(`/api/products/${productId}/pricing`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { prices?: typeof prices } | null) => {
        if (data?.prices) setPrices(data.prices);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') console.error(e);
      });
    return () => controller.abort();
  }, [session, productId]);

  const firstDirectorId = directors[0]?.id ?? null;
  const [activeDirectorId, setActiveDirectorId] = useState<number | null>(
    firstDirectorId,
  );
  const currentPackages = packages.filter(
    (p) => p.directorId === activeDirectorId,
  );
  const [activePackageId, setActivePackageId] = useState<number | null>(
    currentPackages[0]?.id ?? null,
  );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDirectorId]);

  const activePackage =
    activePkgs.find((p) => p.id === activePackageId) ?? activePkgs[0];

  const inclusions = activePackage?.inclusions ?? [];
  const addons = activePackage?.addons ?? [];

  const packagePartners = activePackage?.partners ?? [];
  const hmu =
    packagePartners.find(({ partner }) => partner.role === 'hmu')?.partner ??
    null;
  const dress =
    packagePartners.find(({ partner }) => partner.role === 'dress')?.partner ??
    null;
  const suit =
    packagePartners.find(({ partner }) => partner.role === 'suit')?.partner ??
    null;
  const bouquet =
    packagePartners.find(({ partner }) => partner.role === 'bouquet')
      ?.partner ?? null;

  const partnerRows = [
    {
      role: 'Photographer',
      name: activePackage?.director.name ?? '',
      instagram: activePackage?.director.instagram ?? null,
    },
    hmu
      ? { role: 'Hair & Makeup', name: hmu.name, instagram: hmu.instagram }
      : null,
    dress
      ? { role: 'Dress', name: dress.name, instagram: dress.instagram }
      : null,
    suit ? { role: 'Suit', name: suit.name, instagram: suit.instagram } : null,
    bouquet
      ? { role: 'Bouquet', name: bouquet.name, instagram: bouquet.instagram }
      : null,
  ].filter(Boolean) as {
    role: string;
    name: string;
    instagram: string | null;
  }[];

  const shootDetails = activePackage
    ? [
        { label: 'Duration', value: activePackage.shootingTime },
        { label: 'Locations', value: activePackage.locations },
        { label: 'Original Photos', value: activePackage.originalPhotos },
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
  const tabState = (active: boolean) =>
    active
      ? 'font-medium bg-[#0D0D0D] text-white border-[#0D0D0D]'
      : `font-normal bg-white ${GRAY2} ${BORDER}`;

  return (
    <div className={`w-full lg:max-w-[680px] ${BLACK}`}>
      <div className={`bg-white border ${BORDER} rounded-2xl overflow-hidden`}>
        {/* HEADER */}
        <div
          className={`pt-6 px-4 pb-5 sm:pt-8 sm:px-8 sm:pb-6 text-center border-b ${BORDER}`}
        >
          <div
            className={`text-[11px] font-medium ${GREEN} tracking-[0.12em] uppercase mb-2`}
          >
            {pkgNumLabel}
          </div>
          <div
            className={`text-[20px] sm:text-[24px] font-semibold ${BLACK} tracking-[-0.02em] mb-5`}
          >
            {title}
            {/* 괄호 안 작가이름 */}
            {/* {directors.length > 1 &&
              activePackage &&
              ` (${activePackage.director.name})`} */}
          </div>

          {directors.length > 1 && (
            <div className="flex gap-[6px] justify-center flex-wrap mb-2">
              {directors.map((d) => (
                <span
                  key={d.id}
                  className={`text-[12px] py-[5px] px-[14px] border rounded-[20px] cursor-pointer ${tabState(
                    activeDirectorId === d.id,
                  )}`}
                  onClick={() => handleDirectorSelect(d.id)}
                >
                  {d.name}
                </span>
              ))}
            </div>
          )}

          {activePkgs.length > 0 && (
            <div className="flex gap-[6px] justify-center flex-wrap mb-2">
              {activePkgs.map((pkg) => (
                <span
                  key={pkg.id}
                  className={`text-[13px] py-[5px] px-[14px] font-normal tracking-normal border rounded-[2px] cursor-pointer ${tabState(
                    activePackageId === pkg.id,
                  )}`}
                  onClick={() => setActivePackageId(pkg.id)}
                >
                  {pkg.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="py-5 px-4 sm:py-6 sm:px-8">
          {/* Partners */}
          {hasPartners && (
            <>
              <div className={secLabelBase}>Partners</div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-[10px]">
                {partnerRows.map((item, i) => (
                  <div
                    key={item.role}
                    className={`py-[10px] px-3 bg-[#F9F9F9] rounded-[8px]  ${
                      partnerRows.length % 2 === 1 &&
                      i === partnerRows.length - 1
                        ? 'col-span-2'
                        : ''
                    }`}
                  >
                    <div
                      className={`text-[10px] font-normal ${GRAY3} mb-[2px]`}
                    >
                      {item.role}
                    </div>
                    <div
                      className={`text-[13px] font-semibold ${BLACK} mb-[1px]`}
                    >
                      {item.name}
                    </div>
                    <InstagramLink handle={item.instagram} />
                  </div>
                ))}
              </div>
              <p className={`text-[11px] font-normal ${GRAY3} italic mt-2`}>
                * Please check each studio&apos;s portfolio on Instagram
              </p>
            </>
          )}

          {/* Included */}
          {hasInclusions && (
            <>
              <div
                className={`${secLabelBase} ${inclusionsIsFirst ? '' : 'mt-7'}`}
              >
                What&apos;s Included
              </div>
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-0">
                {inclusions.map(({ inclusion }) => (
                  <div
                    key={inclusion.id}
                    className={`flex gap-2 items-start text-[12px] sm:text-[13px] font-normal ${GRAY1} leading-[1.5] py-[6px] border-b border-[#F5F5F5] [&:nth-last-child(-n+2)]:border-b-0`}
                  >
                    <span
                      className={`${GREEN} shrink-0 text-[12px] mt-[1px] font-semibold`}
                    >
                      ✓
                    </span>
                    {inclusion.name}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Shoot Details */}
          {hasDetails && activePackage && (
            <>
              <div
                className={`${secLabelBase} ${detailsIsFirst ? '' : 'mt-7'}`}
              >
                Shoot Details
              </div>
              <div className="grid grid-cols-2 gap-y-4 min-[480px]:grid-cols-4 min-[480px]:gap-y-0">
                {shootDetails.map((d) => {
                  const m = d.value.match(/^([\d,.+]+)\s*(.*)$/);
                  const num = m ? m[1] : d.value;
                  const unit = m ? m[2] : '';
                  return (
                    <div
                      key={d.label}
                      className="pr-0 min-[480px]:pr-4 min-[480px]:last:pr-0"
                    >
                      <div
                        className={`text-[11px] font-normal ${GRAY3} mb-[6px]`}
                      >
                        {d.label}
                      </div>
                      <div
                        className={`text-[22px] font-bold ${BLACK} leading-none tracking-[-0.02em]`}
                      >
                        {num}
                      </div>
                      {unit && (
                        <div
                          className={`text-[11px] font-normal ${GRAY2} mt-[2px]`}
                        >
                          {unit}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pr-0 min-[480px]:pr-4 min-[480px]:last:pr-0">
                  <div className={`text-[11px] font-normal ${GRAY3} mb-[6px]`}>
                    Retouched Photos
                  </div>
                  <div
                    className={`text-[22px] font-bold ${BLACK} leading-none tracking-[-0.02em]`}
                  >
                    {activePackage.retouched}
                  </div>
                  <div className={`text-[11px] font-normal ${GRAY2} mt-[2px]`}>
                    photos
                  </div>
                  {activePackage.retouchedDetail && (
                    <div
                      className={`text-[10px] font-normal ${GRAY3} mt-1 leading-[1.5]`}
                    >
                      {activePackage.retouchedDetail}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ADD-ONS */}
        {addons.length > 0 && (
          <div
            className={`py-5 px-4 sm:py-6 sm:px-8 border-t ${BORDER} bg-[#FAFAFA]`}
          >
            <div className={secLabelBase}>Add-ons</div>
            {addons.map(({ addon }, i) => (
              <div
                key={addon.id}
                className={i === addons.length - 1 ? '' : 'mb-2'}
              >
                <div
                  className={`flex justify-between items-center gap-2 py-[10px] px-3 sm:py-[11px] sm:px-[14px] border ${BORDER} rounded-[8px] bg-white cursor-pointer`}
                  onClick={() =>
                    setExpandedAddon(expandedAddon === i ? null : i)
                  }
                >
                  <span
                    className={`text-[12px] sm:text-[13px] font-normal ${BLACK}`}
                  >
                    {addon.name}
                  </span>
                  <div
                    className={`text-[12px] sm:text-[13px] font-medium ${GRAY1} flex items-center gap-[6px] shrink-0`}
                  >
                    {addon.price > 0
                      ? `+$${addon.price.toLocaleString()}`
                      : 'See details'}
                    <div
                      className={`w-5 h-5 rounded-full border ${BORDER} flex items-center justify-center text-[11px] ${GRAY3} shrink-0`}
                    >
                      {expandedAddon === i ? '−' : '+'}
                    </div>
                  </div>
                </div>
                {expandedAddon === i && addon.desc && (
                  <p
                    className={`text-[11px] sm:text-[12px] pt-2 ${GRAY2} leading-[1.6] -mt-[2px] mb-[10px] px-3 sm:px-[14px]`}
                  >
                    <AddonDesc text={addon.desc} />
                  </p>
                )}
              </div>
            ))}
            <p className={`text-[11px] font-normal ${GRAY3} italic mt-[10px]`}>
              * Add-ons are NOT included in the total price. Additional charges
              will apply.
            </p>
          </div>
        )}

        {/* PRICE SECTION */}
        {activePackage && priceCount > 0 && session && (
          <div className={`border-t ${BORDER}`}>
            <div
              className={`grid ${priceCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {activePackage.isSinglePrice ? (
                <div className="py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1">
                  <div className="flex flex-col items-center gap-[2px] text-center">
                    <span className="text-[10px] sm:text-[14px] font-bold leading-tight text-[#666666]">
                      PACKAGE PRICE
                    </span>
                  </div>
                  <div
                    className={`text-[16px] text-center font-normal ${BLACK} tracking-[-0.02em]`}
                  >
                    {activePrice
                      ? `USD ${(
                          activePrice.priceSNS || activePrice.priceNoSNS
                        ).toLocaleString()}`
                      : '···'}
                  </div>
                  {/* <a
                    href={INQUIRY_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-center block mt-[10px] py-[9px] px-[14px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none text-center no-underline bg-[#2D5A45] text-white"
                  >
                    Inquire Now →
                  </a> */}
                </div>
              ) : (
                <>
                  {activePackage.hasPriceSNS && (
                    <div
                      className={`py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1 ${
                        priceCount > 1 ? `border-r ${BORDER}` : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-[2px] text-center">
                        <span className="text-[10px] sm:text-[14px] font-bold leading-tight text-[#666666]">
                          DISCOUNTED PRICE
                        </span>
                        <span className="text-[9px] sm:text-[12px] font-medium leading-tight text-[#666666]">
                          (WITH SNS UPLOAD CONSENT)
                        </span>
                      </div>
                      <div
                        className={`text-[16px] text-center font-normal ${BLACK} tracking-[-0.02em]`}
                      >
                        {activePrice
                          ? `USD ${activePrice.priceSNS.toLocaleString()}`
                          : '···'}
                      </div>
                      {/* <a
                        href={INQUIRY_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-center block mt-[10px] py-[9px] px-[14px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none text-center no-underline bg-[#2D5A45] text-white"
                      >
                        Inquire Now →
                      </a> */}
                    </div>
                  )}
                  {activePackage.hasPriceNoSNS && (
                    <div className="py-4 px-3 sm:py-5 sm:px-6 flex flex-col gap-1">
                      <div className="flex flex-col items-center gap-[2px] text-center">
                        <span className="text-[10px] sm:text-[14px] font-bold leading-tight text-[#666666]">
                          REGULAR PRICE
                        </span>
                        <span className="text-[9px] sm:text-[12px] font-medium leading-tight text-[#666666]">
                          (NO SNS UPLOAD CONSENT)
                        </span>
                      </div>
                      <div
                        className={`text-[16px] text-center font-normal ${BLACK} tracking-[-0.02em]`}
                      >
                        {activePrice
                          ? `USD ${activePrice.priceNoSNS.toLocaleString()}`
                          : '···'}
                      </div>
                      {/* <a
                        href={INQUIRY_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-center block mt-[10px] py-[9px] px-[14px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none text-center no-underline bg-[#0D0D0D] text-white"
                      >
                        Inquire Now →
                      </a> */}
                    </div>
                  )}
                </>
              )}
            </div>
            <div
              className={`py-3 px-4 sm:px-6 bg-[#FAFAFA] border-t ${BORDER}`}
            >
              <p
                className={`text-[11px] font-normal ${GRAY3} italic leading-[1.6] mb-[3px] last:mb-0`}
              >
                * Final price is subject to change based on current USD exchange
                rate and does NOT include add-ons.
              </p>
              <p
                className={`text-[11px] font-normal ${GRAY3} italic leading-[1.6] mb-[3px] last:mb-0`}
              >
                * SNS Upload: Hype Pig (Hype Wedding, Hype Snap) SNS,
                Photographer SNS
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className={`py-5 px-4 sm:py-6 sm:px-8 border-t ${BORDER} text-center bg-white`}
        >
          {!session ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-x-2 sm:gap-x-4 mb-4">
              <p
                className={`row-start-1 col-start-1 text-[11px] sm:text-[13px] font-normal ${GRAY2} text-center px-1`}
              >
                Log in to check the price
              </p>
              <span className="row-start-1 row-span-2 col-start-2 self-center text-[15px] font-normal text-black">
                or
              </span>
              <p
                className={`row-start-1 col-start-3 text-[11px] sm:text-[13px] font-normal ${GRAY2} text-center px-1`}
              >
                Ready to book or have questions?
              </p>
              <button
                onClick={() => router.push('?auth=1')}
                className="row-start-2 col-start-1 justify-self-center mt-3 mx-1 py-[9px] px-3 sm:px-[18px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none bg-[#0D0D0D] text-white"
              >
                Check Price
              </button>
              <a
                href={INQUIRY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="row-start-2 col-start-3 justify-self-center mt-3 mx-1 py-[9px] px-3 sm:px-[18px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none no-underline bg-[#0D0D0D] text-white text-center"
              >
                Submit your Inquiry
              </a>
            </div>
          ) : (
            <>
              <p className={`text-[14px] font-normal ${GRAY4} mb-4`}>
                Ready to book or have questions?
              </p>
              <a
                href={INQUIRY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-[14px] bg-[#0D0D0D] text-white border-none rounded-[8px] text-[14px] font-medium cursor-pointer no-underline"
              >
                Submit your Inquiry
              </a>
            </>
          )}
          <p className={`text-[12px] font-normal ${GRAY4} mt-3`}>
            Instagram:{' '}
            <a
              href="https://instagram.com/hypewedd_ing"
              target="_blank"
              rel="noopener noreferrer"
              className={`${GRAY4} no-underline`}
            >
              @hypewedd_ing
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
