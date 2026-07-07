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

function InstagramLink({ handle }: { handle: string | null }) {
  if (!handle) return null;
  const handles = handle.split(' / ');
  return (
    <span style={{ fontSize: '13px', wordBreak: 'break-all' }}>
      {handles.map((h, i) => (
        <span key={h}>
          <a
            href={`https://instagram.com/${h.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#8B7355',
              textDecoration: 'none',
              borderBottom: '1px solid #D4C5B0',
              fontWeight: 'bold',
            }}
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
  directors,
  packages,
}: {
  title: string;
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
    packagePartners.find(({ partner }) => partner.role === 'bouquet')?.partner ??
    null;

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

  return (
    <div
      style={{
        color: '#2C2420',
        maxWidth: 560,
      }}
    >
      {/* 제목 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          className="font"
          style={{
            fontSize: '28px',
            fontWeight: 400,
            color: '#2C2420',
            margin: '0 0 6px',
          }}
        >
          {productNumber} {title}
        </h1>
        <div
          style={{
            width: '40px',
            height: '1px',
            background: '#D4C5B0',
            margin: '12px auto',
          }}
        />
        <p
          style={{
            fontSize: '11px',
            color: '#888',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          {activePackage?.director.number} {activePackage?.director.name}
        </p>
        {activePackage?.director.instagram && (
          <InstagramLink handle={activePackage.director.instagram} />
        )}
      </div>

      {/* 작가 탭 (복수일 때만) */}
      {directors.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          {directors.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDirectorSelect(d.id)}
              style={{
                padding: '8px 20px',
                background: activeDirectorId === d.id ? '#2C2420' : '#fff',
                color: activeDirectorId === d.id ? '#fff' : '#2C2420',
                border: '1px solid #2C2420',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.5px',
              }}
            >
              {d.number} {d.name}
            </button>
          ))}
        </div>
      )}

      {/* 패키지 탭 */}
      {activePkgs.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '32px',
          }}
        >
          {activePkgs.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setActivePackageId(pkg.id)}
              style={{
                padding: '8px 22px',
                background: activePackageId === pkg.id ? '#2C2420' : '#fff',
                color: activePackageId === pkg.id ? '#fff' : '#2C2420',
                border: '1px solid #2C2420',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.5px',
              }}
            >
              {pkg.name}
            </button>
          ))}
        </div>
      )}

      {/* 패키지 서브타이틀 */}
      {activePackage?.subtitle && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#8B7355',
            fontWeight: 500,
            margin: '0 0 28px',
            letterSpacing: '0.3px',
          }}
        >
          {activePackage.subtitle}
        </p>
      )}

      {/* Partners */}
      {partnerRows.length > 0 && (
        <div
          style={{
            border: '1px solid #E8E0D4',
            borderRadius: '4px',
            background: 'rgb(250, 250, 248)',
            padding: '20px 24px',
            marginBottom: '28px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'rgb(102, 102, 102)',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}
          >
            Partners
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 24px',
            }}
          >
            {partnerRows.map((item) => (
              <div key={item.role}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#555',
                    marginBottom: '2px',
                  }}
                >
                  {item.role}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '2px',
                  }}
                >
                  {item.name}
                </div>
                <InstagramLink handle={item.instagram} />
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: '12px',
              color: '#555',
              margin: '16px 0 0',
              fontStyle: 'italic',
            }}
          >
            * Please check each studio&apos;s portfolio on Instagram
          </p>
        </div>
      )}

      {/* Package Inclusive */}
      {inclusions.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#888',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            Package Inclusive
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 16px',
            }}
          >
            {inclusions.map(({ inclusion }) => (
              <div
                key={inclusion.id}
                style={{
                  fontSize: '14px',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{ color: '#8B7355', flexShrink: 0, marginTop: '1px' }}
                >
                  ✓
                </span>
                <span>{inclusion.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photography Details */}
      {activePackage && (
        <div
          style={{
            border: '1px solid #E8E0D4',
            background: 'rgb(250, 250, 248)',
            borderRadius: '4px',
            padding: '20px 24px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'rgb(102, 102, 102)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              margin: '0 0 16px',
            }}
          >
            Photography Details
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            {[
              { label: 'Shooting Time', value: activePackage.shootingTime },
              { label: 'Locations', value: activePackage.locations },
              { label: 'Original Photos', value: activePackage.originalPhotos },
              {
                label: 'Retouched',
                value: `${activePackage.retouched} images`,
              },
            ].map((d) => (
              <div key={d.label}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#555',
                    marginBottom: '4px',
                  }}
                >
                  {d.label}
                </div>
                <div
                  className="font"
                  style={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#1a1a1a',
                  }}
                >
                  {d.value}
                </div>
              </div>
            ))}
          </div>
          {activePackage.retouchedDetail && (
            <p
              style={{
                fontSize: '13px',
                color: '#444',
                margin: '16px 0 0',
                lineHeight: 1.5,
              }}
            >
              {activePackage.retouchedDetail}
            </p>
          )}
        </div>
      )}

      {/* Pricing */}
      {activePackage &&
        (activePackage.priceSNS > 0 || activePackage.priceNoSNS > 0) && (
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  [
                    activePackage.priceSNS > 0,
                    activePackage.priceNoSNS > 0,
                  ].filter(Boolean).length === 1
                    ? '1fr'
                    : '1fr 1fr',
                gap: '12px',
                marginBottom: '10px',
              }}
            >
              {activePackage.priceSNS > 0 && (
                <div
                  style={{
                    background: '#2C2420',
                    borderRadius: '4px',
                    padding: '24px 16px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.75)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '10px',
                    }}
                  >
                    Agree to SNS Upload
                  </div>
                  <div
                    className="font"
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#fff',
                      lineHeight: 1,
                    }}
                  >
                    ${activePackage.priceSNS.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.65)',
                      marginTop: '4px',
                    }}
                  >
                    USD
                  </div>
                </div>
              )}
              {activePackage.priceNoSNS > 0 && (
                <div
                  style={{
                    background: '#FAFAF8',
                    border: '1px solid #E8E0D4',
                    borderRadius: '4px',
                    padding: '24px 16px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '10px',
                    }}
                  >
                    Decline SNS Upload
                  </div>
                  <div
                    className="font"
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#2C2420',
                      lineHeight: 1,
                    }}
                  >
                    ${activePackage.priceNoSNS.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#aaa',
                      marginTop: '4px',
                    }}
                  >
                    USD
                  </div>
                </div>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 2px' }}>
              * Final price is subject to change based on current USD exchange
              rate and does NOT include add-ons.
            </p>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              * SNS Upload: Hype Pig (Hype Wedding, Hype Snap) SNS, Photographer
              SNS
            </p>
          </div>
        )}

      {/* Add-ons */}
      {addons.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '12px',
              color: 'rgb(102, 102, 102)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: '0 0 12px',
              fontWeight: 'bold',
            }}
          >
            Add-ons
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {addons.map(({ addon }, i) => (
              <div
                key={addon.id}
                style={{
                  border: '1px solid #E8E0D4',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() =>
                    setExpandedAddon(expandedAddon === i ? null : i)
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 16px',
                    background: expandedAddon === i ? '#FAFAF8' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#1a1a1a' }}>
                    {addon.name}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#8B7355',
                      fontWeight: 500,
                      flexShrink: 0,
                      marginLeft: '12px',
                    }}
                  >
                    {addon.price > 0
                      ? `+$${addon.price.toLocaleString()}`
                      : 'See details'}{' '}
                    {expandedAddon === i ? '−' : '+'}
                  </span>
                </button>
                {expandedAddon === i && addon.desc && (
                  <div
                    style={{
                      padding: '0 16px 14px',
                      background: '#FAFAF8',
                      borderTop: '1px solid #E8E0D4',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#444',
                        lineHeight: 1.6,
                        margin: '12px 0 0',
                      }}
                    >
                      {addon.desc}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: '12px',
              color: '#888',
              margin: '10px 0 0',
              fontStyle: 'italic',
            }}
          >
            * Add-ons are NOT included in the total price. Additional charges
            will apply.
          </p>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          textAlign: 'center',
          padding: '32px 0',
          borderTop: '1px solid #E8E0D4',
        }}
      >
        <p style={{ fontSize: '14px', color: '#555', margin: '0 0 16px' }}>
          Ready to book or have questions?
        </p>
        <a
          href="https://wa.me/821062695990"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '14px 40px',
            background: '#2C2420',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '2px',
            fontSize: '13px',
            letterSpacing: '1.5px',
            fontWeight: 600,
          }}
        >
          CONTACT US ON WHATSAPP
        </a>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '14px' }}>
          Instagram:{' '}
          <a
            href="https://instagram.com/hypewedd_ing"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#8B7355', textDecoration: 'none' }}
          >
            @hypewedd_ing
          </a>
        </p>
      </div>
    </div>
  );
}
