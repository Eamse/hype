'use client';

import { useState } from 'react';

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
  priceSNS: number;
  priceNoSNS: number;
  shootingTime: string;
  locations: string;
  originalPhotos: string;
  retouched: number;
  retouchedDetail: string | null;
  director: Director;
  addons: { addon: Addon }[];
  inclusions: { inclusion: Inclusion }[];
  partners: { partner: Partner }[];
};

const INQUIRY_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf5wIchc4qYFhPbX1VOlMiFvkNugZpeFa16ArIjuuwd5EW6UA/viewform?usp=send_form';

const GREEN = 'text-[#2D5A45]';
const GRAY1 = 'text-[#444444]';
const GRAY2 = 'text-[#666666]';
const GRAY3 = 'text-[#AAAAAA]';
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
  title,
  section,
  directors,
  packages,
}: {
  title: string;
  section?: string;
  directors: Director[];
  packages: Package[];
}) {
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
    ? [activePackage.priceSNS > 0, activePackage.priceNoSNS > 0].filter(Boolean)
        .length
    : 0;

  const secLabelBase = `text-[10px] font-semibold ${GRAY3} tracking-[0.12em] uppercase mb-4`;
  const tabState = (active: boolean) =>
    active
      ? 'font-medium bg-[#0D0D0D] text-white border-[#0D0D0D]'
      : `font-normal bg-white ${GRAY2} ${BORDER}`;

  return (
    <div className={`max-w-[680px] ${BLACK}`}>
      <div className={`bg-white border ${BORDER} rounded-2xl overflow-hidden`}>
        {/* HEADER */}
        <div className={`pt-8 px-8 pb-6 text-center border-b ${BORDER}`}>
          <div
            className={`text-[11px] font-medium ${GREEN} tracking-[0.12em] uppercase mb-2`}
          >
            {pkgNumLabel}
          </div>
          <div
            className={`text-[24px] font-semibold ${BLACK} tracking-[-0.02em] mb-5`}
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
                  className={`text-[12px] py-[5px] px-[14px] border rounded-[6px] cursor-pointer ${tabState(
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
        <div className="py-6 px-8">
          {/* Partners */}
          {hasPartners && (
            <>
              <div className={secLabelBase}>Partners</div>
              <div className="grid grid-cols-2 gap-[10px]">
                {partnerRows.map((item, i) => (
                  <div
                    key={item.role}
                    className={`py-[10px] px-3 bg-[#F9F9F9] rounded-[8px] ${
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                {inclusions.map(({ inclusion }) => (
                  <div
                    key={inclusion.id}
                    className={`flex gap-2 items-start text-[13px] font-normal ${GRAY1} leading-[1.5] py-[6px] border-b border-[#F5F5F5] [&:nth-last-child(-n+2)]:border-b-0`}
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

        {/* PRICE SECTION */}
        {activePackage && priceCount > 0 && (
          <div className={`border-t ${BORDER}`}>
            <div
              className={`grid ${priceCount === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {activePackage.priceSNS > 0 && (
                <div
                  className={`py-5 px-6 flex flex-col gap-1 ${
                    priceCount > 1 ? `border-r ${BORDER}` : ''
                  }`}
                >
                  <span className="inline-block text-[10px] font-medium py-[3px] px-2 rounded-[4px] mb-2 w-fit bg-[#EAF0EC] text-[#2D5A45]">
                    Agree to SNS Upload
                  </span>
                  <div
                    className={`text-[22px] font-bold ${BLACK} tracking-[-0.02em]`}
                  >
                    USD{activePackage.priceSNS.toLocaleString()}
                  </div>
                  <a
                    href={INQUIRY_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-[10px] py-[9px] px-[14px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none w-full text-center no-underline bg-[#2D5A45] text-white"
                  >
                    Inquire Now →
                  </a>
                </div>
              )}
              {activePackage.priceNoSNS > 0 && (
                <div className="py-5 px-6 flex flex-col gap-1">
                  <span className="inline-block text-[10px] font-medium py-[3px] px-2 rounded-[4px] mb-2 w-fit bg-[#F5F5F5] text-[#666666]">
                    Decline SNS Upload
                  </span>
                  <div
                    className={`text-[22px] font-bold ${BLACK} tracking-[-0.02em]`}
                  >
                    USD{activePackage.priceNoSNS.toLocaleString()}
                  </div>
                  <a
                    href={INQUIRY_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-[10px] py-[9px] px-[14px] rounded-[6px] text-[12px] font-medium cursor-pointer border-none w-full text-center no-underline bg-[#0D0D0D] text-white"
                  >
                    Inquire Now →
                  </a>
                </div>
              )}
            </div>
            <div className={`py-3 px-6 bg-[#FAFAFA] border-t ${BORDER}`}>
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

        {/* ADD-ONS */}
        {addons.length > 0 && (
          <div className={`py-6 px-8 border-t ${BORDER} bg-[#FAFAFA]`}>
            <div className={secLabelBase}>Add-ons</div>
            {addons.map(({ addon }, i) => (
              <div
                key={addon.id}
                className={i === addons.length - 1 ? '' : 'mb-2'}
              >
                <div
                  className={`flex justify-between items-center py-[11px] px-[14px] border ${BORDER} rounded-[8px] bg-white cursor-pointer`}
                  onClick={() =>
                    setExpandedAddon(expandedAddon === i ? null : i)
                  }
                >
                  <span className={`text-[13px] font-normal ${BLACK}`}>
                    {addon.name}
                  </span>
                  <div
                    className={`text-[13px] font-medium ${GRAY1} flex items-center gap-[6px]`}
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
                    className={`text-[12px] ${GRAY2} leading-[1.6] -mt-[2px] mb-[10px] px-[14px]`}
                  >
                    {addon.desc}
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

        {/* CTA */}
        <div className={`py-6 px-8 border-t ${BORDER} text-center bg-white`}>
          <p className={`text-[14px] font-normal ${GRAY2} mb-4`}>
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
          <p className={`text-[12px] font-normal ${GRAY3} mt-3`}>
            Instagram:{' '}
            <a
              href="https://instagram.com/hypewedd_ing"
              target="_blank"
              rel="noopener noreferrer"
              className={`${GRAY3} no-underline`}
            >
              @hypewedd_ing
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
