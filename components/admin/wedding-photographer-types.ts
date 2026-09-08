export type Director = {
  id: number;
  number: string;
  name: string;
  location: string | null;
  instagram: string | null;
  imageUrl: string | null;
  order: number;
  products: {
    productId: number;
    product: { id: number; title: string; section: string };
  }[];
};

export const LOCATIONS: { label: string; match: string }[] = [
  { label: '제주', match: 'Jeju' },
  { label: '서울', match: 'Seoul' },
];

export function locationOfSection(section: string): 'Jeju' | 'Seoul' | null {
  if (section.includes('Jeju')) return 'Jeju';
  if (section.includes('Seoul')) return 'Seoul';
  return null;
}

export type SimpleProduct = { id: number; title: string; section: string };

export type Addon = { id: number; name: string; price: number; desc: string | null };
export type Inclusion = { id: number; name: string };
export type Partner = {
  id: number;
  role: string;
  name: string;
  instagram: string | null;
};

export type PackageImage = {
  id: number;
  packageId: number;
  webUrl: string;
  originalUrl: string;
  thumbUrl: string | null;
  order: number;
};

export type Package = {
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
  thumbnailUrl: string | null;
  addons: { addon: Addon }[];
  inclusions: { inclusion: Inclusion }[];
  partners: { partner: Partner }[];
  images: PackageImage[];
};

export const emptyDirForm = {
  number: '',
  name: '',
  instagram: '',
  location: '' as '' | 'Jeju' | 'Seoul',
  productId: '' as number | '',
};

export const emptyPkgForm = {
  name: '',
  subtitle: '',
  priceSNS: '',
  priceNoSNS: '',
  shootingTime: '',
  locations: '',
  originalPhotos: '',
  retouched: '',
  retouchedDetail: '',
  thumbnailUrl: '' as string | null,
  inclusionIds: [] as number[],
  addonIds: [] as number[],
  hmuId: null as number | null,
  dressId: null as number | null,
  suitId: null as number | null,
  bouquetId: null as number | null,
};
export type PkgForm = typeof emptyPkgForm;

export function pkgFormFromPackage(pkg: Package): PkgForm {
  return {
    name: pkg.name,
    subtitle: pkg.subtitle ?? '',
    priceSNS: String(pkg.priceSNS),
    priceNoSNS: String(pkg.priceNoSNS),
    shootingTime: pkg.shootingTime,
    locations: pkg.locations,
    originalPhotos: pkg.originalPhotos,
    retouched: String(pkg.retouched),
    retouchedDetail: pkg.retouchedDetail ?? '',
    thumbnailUrl: pkg.thumbnailUrl,
    inclusionIds: pkg.inclusions.map((i) => i.inclusion.id),
    addonIds: pkg.addons.map((a) => a.addon.id),
    hmuId:
      pkg.partners.find((p) => p.partner.role === 'hmu')?.partner.id ?? null,
    dressId:
      pkg.partners.find((p) => p.partner.role === 'dress')?.partner.id ?? null,
    suitId:
      pkg.partners.find((p) => p.partner.role === 'suit')?.partner.id ?? null,
    bouquetId:
      pkg.partners.find((p) => p.partner.role === 'bouquet')?.partner.id ?? null,
  };
}

export function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}
