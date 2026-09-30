'use client';
import { useState, useEffect, useRef } from 'react';
import { resizeImageFile } from '@/lib/client-image-resize';
import { btnStyle, labelStyle, inputStyle } from './types';
import ImageGallery from '@/app/product/[id]/_components/image-gallery';
import WeddingDetail from '@/app/product/[id]/_components/wedding-detail';

const REGIONS = [
  { value: 'Jeju', label: 'Jeju' },
  { value: 'Seoul', label: 'Seoul' },
];
const CATEGORIES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'snap', label: 'Snap' },
];
const PARTNER_ROLES = [
  { value: 'hmu', label: 'Hair & Makeup' },
  { value: 'dress', label: 'Dress' },
  { value: 'suit', label: 'Suit' },
  { value: 'bouquet', label: 'Bouquet' },
  { value: 'videographer', label: 'Videographer' },
];
function sectionFromRegionCategory(region: string, category: string): string {
  const cat = category === 'snap' ? 'Casual Photoshoot' : 'Photographers';
  return `${cat} in ${region}`;
}
const SECTION_GROUPS = [
  { section: 'Photographers in Jeju', label: 'Wedding · Jeju' },
  { section: 'Photographers in Seoul', label: 'Wedding · Seoul' },
  { section: 'Casual Photoshoot in Jeju', label: 'Snap · Jeju' },
  { section: 'Casual Photoshoot in Seoul', label: 'Snap · Seoul' },
];

let idSeq = 0;
function nextId(): string {
  idSeq += 1;
  return `id-${idSeq}`;
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// 관리자가 "@handle" 대신 인스타그램 프로필 URL을 그대로 붙여넣는 경우, URL에서
// 핸들만 뽑아서 "@handle" 형태로 맞춰준다. 이미 "@handle"/"handle" 형태면 그대로 둔다.
function extractInstagramHandle(raw: string): string {
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/instagram\.com\/([^/?#]+)/i);
  return urlMatch ? `@${urlMatch[1]}` : trimmed;
}

function ImageUploadField({
  label,
  hint,
  multiple,
  onSelect,
  children,
}: {
  label: string;
  hint?: string;
  multiple?: boolean;
  onSelect: (files: FileList) => void;
  children: React.ReactNode;
}) {
  const inputId = `img-upload-${label}-${multiple ? 'm' : 's'}`;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: '#aaa' }}>{hint}</span>}
      </div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: 12,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => {
              if (e.target.files) onSelect(e.target.files);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
          <label
            htmlFor={inputId}
            style={{
              ...btnStyle('#fff', '#333', '#ccc'),
              borderRadius: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            + 이미지 업로드 (50MB 이하)
          </label>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImageThumbList({
  images,
  onChange,
}: {
  images: ImgSlot[];
  onChange: (next: ImgSlot[]) => void;
}) {
  if (images.length === 0) {
    return (
      <p style={{ fontSize: 12, color: '#bbb' }}>
        아직 업로드된 이미지가 없습니다.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {images.map((img, i) => (
        <div
          key={img._id ?? i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: 6,
          }}
        >
          {img.uploading ? (
            <div
              style={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#999',
              }}
            >
              업로드 중...
            </div>
          ) : (
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <img
                src={img.thumbUrl ?? img.url}
                alt=""
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  minWidth: 15,
                  height: 15,
                  padding: '0 2px',
                  background: '#000',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 3 }}>
            {images.length > 1 && (
              <button
                type="button"
                disabled={i === 0}
                onClick={() => onChange(moveItem(images, i, -1))}
                style={reorderBtnStyle}
                aria-label="앞으로 이동"
              >
                ◀
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              style={{
                ...reorderBtnStyle,
                color: '#c0392b',
                borderColor: '#f3d3ce',
              }}
              aria-label="삭제"
            >
              ✕
            </button>
            {images.length > 1 && (
              <button
                type="button"
                disabled={i === images.length - 1}
                onClick={() => onChange(moveItem(images, i, 1))}
                style={reorderBtnStyle}
                aria-label="뒤로 이동"
              >
                ▶
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
const reorderBtnStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '3px 6px',
  border: '1px solid #e0e0e0',
  borderRadius: 3,
  background: '#fff',
  cursor: 'pointer',
  color: '#666',
  lineHeight: 1,
};

type ImgSlot = {
  _id?: string;
  url: string;
  thumbUrl: string | null;
  blurDataUrl?: string | null;
  uploading?: boolean;
};
type AddonForm = {
  _id: string;
  displayName: string;
  price: string;
  noPrice: boolean;
  desc: string;
};
type InclusionForm = { _id: string; name: string };
type InclusionNoteForm = { _id: string; text: string };
type PartnerForm = {
  _id: string;
  role: string;
  displayName: string;
  instagramHandles: string[];
};
type PackageForm = {
  _id: string;
  name: string;
  isSinglePrice: boolean;
  priceSingle: string;
  priceSNS: string;
  priceNoSNS: string;
  images: ImgSlot[];
  partners: PartnerForm[];
  inclusions: InclusionForm[];
  inclusionNotes: InclusionNoteForm[];
  duration: string;
  durationUnit: string;
  durationDetailOn: boolean;
  durationDetail: string;
  locations: string;
  locationsUnit: string;
  locationsDetailOn: boolean;
  locationsDetail: string;
  originalPhotos: string;
  originalPhotosUnit: string;
  originalPhotosDetailOn: boolean;
  originalPhotosDetail: string;
  retouched: string;
  retouchedUnit: string;
  retouchedDetailOn: boolean;
  retouchedDetail: string;
  addons: AddonForm[];
};
type DirectorForm = {
  _id: string;
  name: string;
  instagram: string;
  packages: PackageForm[];
};

function emptyAddon(): AddonForm {
  return {
    _id: nextId(),
    displayName: '',
    price: '',
    noPrice: false,
    desc: '',
  };
}
function emptyInclusion(): InclusionForm {
  return { _id: nextId(), name: '' };
}
function emptyPartner(): PartnerForm {
  return {
    _id: nextId(),
    role: 'hmu',
    displayName: '',
    instagramHandles: [''],
  };
}
function emptyPackage(letter: string): PackageForm {
  return {
    _id: nextId(),
    name: `Package ${letter}`,
    isSinglePrice: false,
    priceSingle: '',
    priceSNS: '',
    priceNoSNS: '',
    images: [],
    partners: [emptyPartner(), emptyPartner(), emptyPartner()],
    inclusions: [
      emptyInclusion(),
      emptyInclusion(),
      emptyInclusion(),
      emptyInclusion(),
    ],
    inclusionNotes: [],
    duration: '',
    durationUnit: 'hours',
    durationDetailOn: false,
    durationDetail: '',
    locations: '',
    locationsUnit: 'sites',
    locationsDetailOn: false,
    locationsDetail: '',
    originalPhotos: '',
    originalPhotosUnit: 'photos',
    originalPhotosDetailOn: false,
    originalPhotosDetail: '',
    retouched: '',
    retouchedUnit: 'photos',
    retouchedDetailOn: false,
    retouchedDetail: '',
    addons: [emptyAddon()],
  };
}
function emptyDirector(): DirectorForm {
  return {
    _id: nextId(),
    name: '',
    instagram: '',
    packages: [emptyPackage('A')],
  };
}

const PKG_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const MAX_UPLOAD_IMAGE_SIZE = 50 * 1024 * 1024;

async function uploadImage(
  file: File,
): Promise<{ url: string; thumbUrl: string | null; blurDataUrl?: string | null }> {
  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    throw new Error('이미지 용량이 너무 커요. 50MB 이하로 업로드해주세요.');
  }
  const resized = await resizeImageFile(file);
  const formData = new FormData();
  formData.append('image', resized);
  const res = await fetch('/api/admin/images/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? '이미지 업로드에 실패했습니다.');
  }
  return res.json();
}

function mapApiProductToForm(api: any): {
  title: string;
  region: string;
  category: string;
  thumbnail: ImgSlot | null;
  directors: DirectorForm[];
} {
  const firstDirector = api.directors[0]?.director;
  return {
    title: api.title ?? '',
    region: firstDirector?.location || 'Seoul',
    category: firstDirector?.category || 'wedding',
    thumbnail: api.imageUrl ? { url: api.imageUrl, thumbUrl: null } : null,
    directors: api.directors.map(({ director }: any) => {
      return {
        _id: nextId(),
        name: director.name ?? '',
        instagram: director.instagram ?? '',
        packages: director.packages.map((pkg: any) => {
          const [dVal, ...dRest] = (pkg.shootingTime ?? '').split(' ');
          const [lVal, ...lRest] = (pkg.locations ?? '').split(' ');
          const inclusions: InclusionForm[] = [];
          const inclusionNotes: InclusionNoteForm[] = [];
          for (const pi of pkg.inclusions) {
            const name: string = pi.inclusion.name ?? '';
            if (name.startsWith('Note:')) {
              inclusionNotes.push({
                _id: nextId(),
                text: name.replace(/^Note:\s*/, ''),
              });
            } else {
              inclusions.push({ _id: nextId(), name });
            }
          }
          return {
            _id: nextId(),
            name: pkg.name ?? '',
            isSinglePrice: pkg.isSinglePrice,
            priceSingle: pkg.isSinglePrice ? String(pkg.priceSNS) : '',
            priceSNS: pkg.isSinglePrice ? '' : String(pkg.priceSNS),
            priceNoSNS: pkg.isSinglePrice ? '' : String(pkg.priceNoSNS),
            images: pkg.images.map((i: any) => ({
              url: i.originalUrl,
              thumbUrl: i.thumbUrl,
            })),
            partners: pkg.partners.map((pp: any) => ({
              _id: nextId(),
              role: pp.partner.role,
              displayName: pp.partner.displayName ?? pp.partner.name ?? '',
              instagramHandles:
                pp.partner.instagramAccounts.length > 0
                  ? pp.partner.instagramAccounts.map((h: any) => h.handle)
                  : [''],
            })),
            inclusions,
            inclusionNotes,
            duration: dVal ?? '',
            durationUnit: dRest.join(' ') || 'hours',
            durationDetailOn: !!pkg.shootingTimeDetail,
            durationDetail: pkg.shootingTimeDetail ?? '',
            locations: lVal ?? '',
            locationsUnit: lRest.join(' ') || 'sites',
            locationsDetailOn: !!pkg.locationsDetail,
            locationsDetail: pkg.locationsDetail ?? '',
            originalPhotos: pkg.originalPhotos ?? '',
            originalPhotosUnit: 'photos',
            originalPhotosDetailOn: !!pkg.originalPhotosDetail,
            originalPhotosDetail: pkg.originalPhotosDetail ?? '',
            retouched: String(pkg.retouched ?? ''),
            retouchedUnit: 'photos',
            retouchedDetailOn: !!pkg.retouchedDetail,
            retouchedDetail: pkg.retouchedDetail ?? '',
            addons: pkg.addons.map((pa: any) => ({
              _id: nextId(),
              displayName: pa.addon.displayName ?? pa.addon.name ?? '',
              price: pa.addon.price ? String(pa.addon.price) : '',
              noPrice: !pa.addon.price,
              desc: pa.addon.desc ?? '',
            })),
          };
        }),
      };
    }),
  };
}

export default function ProductFullPanel({
  fixedCategory,
}: { fixedCategory?: 'wedding' | 'snap' } = {}) {
  const [productId, setProductId] = useState<number | null>(null);
  const [loadIdInput, setLoadIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('Jeju');
  const [category, setCategory] = useState<string>(fixedCategory ?? 'wedding');
  const [thumbnail, setThumbnail] = useState<ImgSlot | null>(null);
  const [directors, setDirectors] = useState<DirectorForm[]>([emptyDirector()]);
  const [activeDirector, setActiveDirector] = useState(0);
  const [activePackage, setActivePackage] = useState<Record<number, number>>({
    0: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [doneAction, setDoneAction] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [productList, setProductList] = useState<
    { id: number; title: string; section: string; order: number }[]
  >([]);
  const [listLoading, setListLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [reordering, setReordering] = useState(false);

  async function refreshProductList() {
    setListLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProductList(
        Array.isArray(data)
          ? data.map((p: any) => ({
              id: p.id,
              title: p.title,
              section: p.section,
              order: p.order,
            }))
          : [],
      );
    } catch {
      setProductList([]);
    } finally {
      setListLoading(false);
    }
  }

  async function handleReorder(
    currentId: number,
    dir: -1 | 1,
    sectionList: { id: number; order: number }[],
  ) {
    const index = sectionList.findIndex((p) => p.id === currentId);
    const targetIndex = index + dir;
    if (index === -1 || targetIndex < 0 || targetIndex >= sectionList.length)
      return;
    const a = sectionList[index];
    const b = sectionList[targetIndex];
    setReordering(true);
    try {
      await Promise.all([
        fetch(`/api/admin/products/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: b.order }),
        }),
        fetch(`/api/admin/products/${b.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: a.order }),
        }),
      ]);
      await refreshProductList();
    } finally {
      setReordering(false);
    }
  }

  useEffect(() => {
    refreshProductList();
  }, []);

  async function handleDelete() {
    if (!productId) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${productId}/full`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '삭제에 실패했습니다.');
        return;
      }
      handleNewProduct();
      refreshProductList();
      setDoneAction('delete');
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleLoad(idOverride?: number) {
    const id = idOverride ?? Number(loadIdInput);
    if (!Number.isInteger(id) || id <= 0) {
      setError('올바른 상품 ID를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${id}/full`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '상품을 불러오지 못했습니다.');
        return;
      }
      const api = await res.json();
      const mapped = mapApiProductToForm(api);
      setTitle(mapped.title);
      setRegion(mapped.region);
      setCategory(mapped.category);
      setThumbnail(mapped.thumbnail);
      setDirectors(
        mapped.directors.length > 0 ? mapped.directors : [emptyDirector()],
      );
      setActiveDirector(0);
      setActivePackage({ 0: 0 });
      setProductId(id);
      setDoneAction(null);
    } catch {
      setError('상품을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleNewProduct() {
    setProductId(null);
    setLoadIdInput('');
    setTitle('');
    setRegion('Seoul');
    setCategory(fixedCategory ?? 'wedding');
    setThumbnail(null);
    setDirectors([emptyDirector()]);
    setActiveDirector(0);
    setActivePackage({ 0: 0 });
    setError('');
    setDoneAction(null);
  }

  function updateDirector(index: number, patch: Partial<DirectorForm>) {
    setDirectors((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }
  function updatePackage(
    dirIndex: number,
    pkgIndex: number,
    patch: Partial<PackageForm>,
  ) {
    setDirectors((prev) =>
      prev.map((d, i) => {
        if (i !== dirIndex) return d;
        return {
          ...d,
          packages: d.packages.map((p, j) =>
            j === pkgIndex ? { ...p, ...patch } : p,
          ),
        };
      }),
    );
  }

  function addDirector() {
    setDirectors((prev) => [...prev, emptyDirector()]);
    setActiveDirector(directors.length);
    setActivePackage((prev) => ({ ...prev, [directors.length]: 0 }));
  }
  function removeDirector(index: number) {
    setDirectors((prev) => prev.filter((_, i) => i !== index));
    setActiveDirector((prev) =>
      Math.max(0, prev === index ? 0 : prev > index ? prev - 1 : prev),
    );
  }
  function addPackage(dirIndex: number) {
    setDirectors((prev) =>
      prev.map((d, i) => {
        if (i !== dirIndex) return d;
        const letter =
          PKG_LETTERS[d.packages.length] ?? String(d.packages.length + 1);

        const sourcePkg = d.packages[activePackage[dirIndex] ?? 0];
        const newPkg = {
          ...emptyPackage(letter),
          addons: sourcePkg
            ? sourcePkg.addons.map((a) => ({ ...a, _id: nextId() }))
            : emptyPackage(letter).addons,
        };
        return { ...d, packages: [...d.packages, newPkg] };
      }),
    );
    setActivePackage((prev) => ({
      ...prev,
      [dirIndex]: directors[dirIndex].packages.length,
    }));
  }
  function removePackage(dirIndex: number, pkgIndex: number) {
    setDirectors((prev) =>
      prev.map((d, i) =>
        i === dirIndex
          ? { ...d, packages: d.packages.filter((_, j) => j !== pkgIndex) }
          : d,
      ),
    );
    setActivePackage((prev) => ({
      ...prev,
      [dirIndex]: Math.max(
        0,
        (prev[dirIndex] ?? 0) > pkgIndex ? (prev[dirIndex] ?? 0) - 1 : 0,
      ),
    }));
  }
  function movePackage(dirIndex: number, pkgIndex: number, dir: -1 | 1) {
    let moved = false;
    setDirectors((prev) =>
      prev.map((d, i) => {
        if (i !== dirIndex) return d;
        const next = moveItem(d.packages, pkgIndex, dir);
        if (next === d.packages) return d;
        moved = true;
        // "Package A" 같은 기본 이름을 그대로 쓰던 패키지만 새 위치에 맞게
        // 이름을 다시 붙임 — 관리자가 직접 커스텀한 이름은 그대로 둠
        const renamed = next.map((p, idx) => {
          if (!/^Package [A-F]$/.test(p.name)) return p;
          const letter = PKG_LETTERS[idx] ?? String(idx + 1);
          return { ...p, name: `Package ${letter}` };
        });
        return { ...d, packages: renamed };
      }),
    );
    if (moved) {
      setActivePackage((prev) =>
        (prev[dirIndex] ?? 0) === pkgIndex
          ? { ...prev, [dirIndex]: pkgIndex + dir }
          : prev,
      );
    }
  }

  async function handleThumbnailUpload(file: File) {
    setThumbnail({ url: '', thumbUrl: null, uploading: true });
    try {
      const result = await uploadImage(file);
      setThumbnail({ ...result, uploading: false });
    } catch (e) {
      setThumbnail(null);
      setUploadError(e instanceof Error ? e.message : '업로드에 실패했습니다.');
    }
  }
  // 여러 파일을 동시에 업로드할 때 각 슬롯을 배열 인덱스가 아니라 고유 id로 식별해야
  // setImages의 비동기 특성 때문에 두 번째 파일부터 같은 자리를 덮어쓰는 걸 막을 수 있음
  async function handlePackageImageUpload(
    dirIndex: number,
    pkgIndex: number,
    files: FileList,
  ) {
    for (const file of Array.from(files)) {
      const slotId = nextId();
      // pkg.images를 바깥 클로저(directors)에서 읽으면 이전 반복에서 추가한
      // 슬롯이 아직 반영 안 된 스냅샷이라, 여러 파일을 한 번에 선택하면 뒤에
      // 추가된 파일이 앞서 추가된 자리를 덮어써버림 — 항상 최신 prev를 써야 함
      setDirectors((prev) =>
        prev.map((d, i) => {
          if (i !== dirIndex) return d;
          return {
            ...d,
            packages: d.packages.map((p, j) =>
              j === pkgIndex
                ? {
                    ...p,
                    images: [
                      ...p.images,
                      { _id: slotId, url: '', thumbUrl: null, uploading: true },
                    ],
                  }
                : p,
            ),
          };
        }),
      );
      try {
        const result = await uploadImage(file);
        setDirectors((prev) =>
          prev.map((d, i) => {
            if (i !== dirIndex) return d;
            return {
              ...d,
              packages: d.packages.map((p, j) =>
                j === pkgIndex
                  ? {
                      ...p,
                      images: p.images.map((img) =>
                        img._id === slotId
                          ? { ...img, ...result, uploading: false }
                          : img,
                      ),
                    }
                  : p,
              ),
            };
          }),
        );
      } catch (e) {
        setDirectors((prev) =>
          prev.map((d, i) => {
            if (i !== dirIndex) return d;
            return {
              ...d,
              packages: d.packages.map((p, j) =>
                j === pkgIndex
                  ? {
                      ...p,
                      images: p.images.filter((img) => img._id !== slotId),
                    }
                  : p,
              ),
            };
          }),
        );
        setUploadError(
          e instanceof Error ? e.message : '업로드에 실패했습니다.',
        );
      }
    }
  }

  function buildPayload() {
    return {
      section: sectionFromRegionCategory(region, category),
      title: title.trim(),
      imageUrl: thumbnail?.url || null,
      directors: directors.map((d, dOrder) => ({
        number: computeDirectorNumber(dOrder),
        name: d.name.trim(),
        instagram:
          d.instagram
            .split(' / ')
            .map((h) => extractInstagramHandle(h))
            .filter(Boolean)
            .join(' / ') || null,
        location: region,
        category,
        order: dOrder,
        packages: d.packages.map((p, pOrder) => ({
          name: p.name.trim(),
          isSinglePrice: p.isSinglePrice,
          priceSNS: p.isSinglePrice
            ? Number(p.priceSingle) || 0
            : Number(p.priceSNS) || 0,
          priceNoSNS: p.isSinglePrice
            ? Number(p.priceSingle) || 0
            : Number(p.priceNoSNS) || 0,
          shootingTime: [p.duration, p.durationUnit].filter(Boolean).join(' '),
          shootingTimeDetail: p.durationDetailOn
            ? p.durationDetail.trim() || null
            : null,
          locations: [p.locations, p.locationsUnit].filter(Boolean).join(' '),
          locationsDetail: p.locationsDetailOn
            ? p.locationsDetail.trim() || null
            : null,
          originalPhotos: p.originalPhotos.trim(),
          originalPhotosDetail: p.originalPhotosDetailOn
            ? p.originalPhotosDetail.trim() || null
            : null,
          retouched: Number(p.retouched) || 0,
          retouchedDetail: p.retouchedDetailOn
            ? p.retouchedDetail.trim() || null
            : null,
          order: pOrder,
          images: p.images
            .filter((i) => i.url)
            .map((i, order) => ({
              originalUrl: i.url,
              thumbUrl: i.thumbUrl,
              blurDataUrl: i.blurDataUrl,
              order,
            })),
          addons: p.addons
            .filter((a) => a.displayName.trim())
            .map((a, order) => ({
              displayName: a.displayName.trim(),
              price: a.noPrice ? 0 : Number(a.price) || 0,
              desc: a.desc.trim() || null,
              order,
            })),
          inclusions: [
            ...p.inclusions
              .filter((i) => i.name.trim())
              .map((i, order) => ({ name: i.name.trim(), order })),
            ...p.inclusionNotes
              .filter((n) => n.text.trim())
              .map((n, idx) => ({
                name: `Note: ${n.text.trim()}`,
                order: p.inclusions.length + idx,
              })),
          ],
          partners: p.partners
            .filter((pt) => pt.displayName.trim())
            .map((pt, order) => ({
              role: pt.role,
              displayName: pt.displayName.trim(),
              instagramHandles: pt.instagramHandles
                .map((h) => extractInstagramHandle(h))
                .filter(Boolean),
              order,
            })),
        })),
      })),
    };
  }

  async function handleSubmit() {
    setError('');
    if (!title.trim()) {
      setError('상품명을 입력해주세요.');
      return;
    }
    for (const d of directors) {
      if (!d.name.trim()) {
        setError('작가명은 필수입니다.');
        return;
      }
    }
    setSaving(true);
    const wasEdit = productId !== null;
    try {
      const url = wasEdit
        ? `/api/admin/products/${productId}/full`
        : '/api/admin/products/full';
      const method = wasEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '저장에 실패했습니다.');
        return;
      }
      if (!wasEdit) {
        const data = await res.json();
        setProductId(data.id);
      }
      setDoneAction(wasEdit ? 'edit' : 'create');
      refreshProductList();
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const curDirIndex = Math.min(activeDirector, directors.length - 1);
  const curDir = directors[curDirIndex];
  const curPkgIndex = Math.min(
    activePackage[curDirIndex] ?? 0,
    curDir.packages.length - 1,
  );
  const curPkg = curDir.packages[curPkgIndex];

  // 작가 번호는 더 이상 직접 입력하지 않고, 이 상품이 해당 섹션(지역·카테고리) 목록에서
  // 몇 번째인지로 자동 계산한다. 작가가 여러 명이면 "N-1", "N-2"..., 한 명이면 "N".
  const numberSection = sectionFromRegionCategory(region, category);
  const sectionProductList = productList.filter(
    (p) => p.section === numberSection,
  );
  const productPosition = productId
    ? (() => {
        const idx = sectionProductList.findIndex((p) => p.id === productId);
        return idx === -1 ? sectionProductList.length + 1 : idx + 1;
      })()
    : sectionProductList.length + 1;
  function computeDirectorNumber(directorIndex: number): string {
    return directors.length > 1
      ? `#${productPosition}-${directorIndex + 1}`
      : `#${productPosition}`;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>
          {(() => {
            const base =
              fixedCategory === 'wedding'
                ? 'Photographers'
                : fixedCategory === 'snap'
                  ? 'Casual Photoshoot'
                  : '상품 등록 (New)';
            return productId ? `${base} 수정 — #${productId}` : `${base} 등록`;
          })()}
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={btnStyle('#fff', '#333', '#ccc')}
            onClick={() => setPreviewOpen(true)}
          >
            미리보기
          </button>
          <button
            style={btnStyle('#000', '#fff')}
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? '저장 중...' : productId ? '수정 저장' : '등록'}
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: 24,
          padding: 12,
          background: '#fafafa',
          borderRadius: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <label style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
            상품 ID로 직접 불러오기
          </label>
          <input
            style={{ ...inputStyle, width: 100, padding: '6px 8px' }}
            value={loadIdInput}
            onChange={(e) => setLoadIdInput(e.target.value)}
            placeholder="예: 12"
          />
          <button
            style={btnStyle('#f0f0f0', '#333')}
            disabled={loading}
            onClick={() => handleLoad()}
          >
            {loading ? '불러오는 중...' : '불러오기'}
          </button>
          {productId && (
            <>
              <button
                style={{ ...btnStyle('#f0f0f0', '#333'), display: 'none' }}
                onClick={handleNewProduct}
              >
                새 상품으로 전환
              </button>
              <button
                style={btnStyle('#f0f0f0', '#333')}
                onClick={() => window.location.reload()}
              >
                초기화
              </button>
              <button
                style={btnStyle('#fff', '#c0392b', '#f3d3ce')}
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                {deleting ? '삭제 중...' : '이 상품 삭제'}
              </button>
            </>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {!fixedCategory && (
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>
                1차 · 카테고리
              </label>
              <select
                style={inputStyle}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label style={{ ...labelStyle, marginBottom: 4 }}>
              {fixedCategory ? '지역' : '2차 · 지역'}
            </label>
            <select
              style={inputStyle}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          {(() => {
            const currentSection = sectionFromRegionCategory(region, category);
            const currentGroupLabel =
              SECTION_GROUPS.find((g) => g.section === currentSection)?.label ??
              currentSection;
            const filteredList = productList.filter(
              (p) => p.section === currentSection,
            );
            return (
              <>
                <p style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>
                  상품 목록 · {currentGroupLabel} ({filteredList.length}){' '}
                  {listLoading && '(불러오는 중...)'}
                </p>
                {filteredList.length === 0 && !listLoading ? (
                  <p style={{ fontSize: 12, color: '#bbb' }}>
                    이 카테고리에 등록된 상품이 없습니다.
                  </p>
                ) : (
                  <div
                    ref={productDropdownRef}
                    style={{ position: 'relative' }}
                  >
                    <button
                      type="button"
                      onClick={() => setProductDropdownOpen((v) => !v)}
                      style={{
                        ...inputStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          color: productId ? '#000' : '#999',
                        }}
                      >
                        {productId
                          ? (() => {
                              const idx = filteredList.findIndex(
                                (p) => p.id === productId,
                              );
                              const p = filteredList[idx];
                              return p
                                ? `${idx + 1}. ${p.title}`
                                : '상품 선택...';
                            })()
                          : '상품 선택...'}
                      </span>
                      <span style={{ color: '#999', fontSize: 10 }}>
                        {productDropdownOpen ? '▲' : '▼'}
                      </span>
                    </button>
                    {productDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: 4,
                          background: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: 3,
                          maxHeight: 240,
                          overflowY: 'auto',
                          zIndex: 20,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                      >
                        {filteredList.map((p, i) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              handleLoad(p.id);
                              setProductDropdownOpen(false);
                            }}
                            style={{
                              padding: '8px 10px',
                              fontSize: 13,
                              cursor: 'pointer',
                              background:
                                p.id === productId ? '#f5f5f5' : '#fff',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = '#f5f5f5')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                p.id === productId ? '#f5f5f5' : '#fff')
                            }
                          >
                            {i + 1}. {p.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {filteredList.length > 1 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      노출 순서 {reordering && '(변경 중...)'}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        maxHeight: 160,
                        overflowY: 'auto',
                      }}
                    >
                      {filteredList.map((p, i) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 8px',
                            border: '1px solid #eee',
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ flex: 1 }}>
                            {i + 1}. {p.title}
                          </span>
                          <button
                            type="button"
                            disabled={i === 0 || reordering}
                            onClick={() =>
                              handleReorder(p.id, -1, filteredList)
                            }
                            style={reorderBtnStyle}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={
                              i === filteredList.length - 1 || reordering
                            }
                            onClick={() => handleReorder(p.id, 1, filteredList)}
                            style={reorderBtnStyle}
                          >
                            ▼
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>
          {error}
        </p>
      )}
      {uploadError && (
        <div
          onClick={() => setUploadError(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 4,
              padding: '32px 28px',
              width: 320,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              이미지를 업로드하지 못했어요.
            </p>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
              {uploadError}
            </p>
            <button
              onClick={() => setUploadError(null)}
              style={{ ...btnStyle('#000', '#fff'), width: '100%' }}
            >
              확인
            </button>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div
          onClick={() => !deleting && setShowDeleteConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 4,
              padding: '32px 28px',
              width: 360,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              &quot;{title || '이 상품'}&quot;을(를) 삭제하시겠습니까?
            </p>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
              연결된 작가·패키지·이미지가 모두 함께 삭제되며 되돌릴 수 없습니다.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                style={{ ...btnStyle('#f0f0f0', '#333'), flex: 1 }}
              >
                취소
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                style={{
                  ...btnStyle('#fff', '#c0392b', '#f3d3ce'),
                  flex: 1,
                }}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
      {doneAction && (
        <div
          onClick={() => setDoneAction(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 4,
              padding: '32px 28px',
              width: 320,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
              {doneAction === 'create' && '등록 완료되었습니다.'}
              {doneAction === 'edit' && '수정 완료되었습니다.'}
              {doneAction === 'delete' && '삭제 완료되었습니다.'}
            </p>
            <button
              onClick={() => setDoneAction(null)}
              style={{ ...btnStyle('#000', '#fff'), width: '100%' }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 상품 기본 정보 */}
      <section
        style={{
          border: '1px solid #eee',
          borderRadius: 4,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
          상품 기본 정보
        </h2>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>상품명</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: De.riz"
            />
          </div>
          <div
            style={
              fixedCategory
                ? { gridColumn: '1 / -1' }
                : {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                    gridColumn: '1 / -1',
                  }
            }
          >
            {!fixedCategory && (
              <div>
                <label style={labelStyle}>카테고리</label>
                <select
                  style={inputStyle}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>지역</label>
              <select
                style={inputStyle}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <ImageUploadField
              label="썸네일 이미지"
              hint="목록 화면 등에서 대표로 쓰일 이미지 1장"
              onSelect={(files) => files[0] && handleThumbnailUpload(files[0])}
            >
              {thumbnail ? (
                <ImageThumbList
                  images={[thumbnail]}
                  onChange={(next) => setThumbnail(next[0] ?? null)}
                />
              ) : (
                <p style={{ fontSize: 12, color: '#bbb' }}>
                  아직 업로드된 이미지가 없습니다.
                </p>
              )}
            </ImageUploadField>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <ImageUploadField
              label="이미지"
              hint={`상세페이지 갤러리에 노출될 패키지 이미지`}
              multiple
              onSelect={(files) =>
                handlePackageImageUpload(curDirIndex, curPkgIndex, files)
              }
            >
              <ImageThumbList
                images={curPkg.images}
                onChange={(next) =>
                  updatePackage(curDirIndex, curPkgIndex, { images: next })
                }
              />
            </ImageUploadField>
          </div>
        </div>
      </section>

      {/* 작가 탭 */}
      <section
        style={{ border: '1px solid #eee', borderRadius: 4, marginBottom: 20 }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, padding: '16px 20px 0' }}>
          작가
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 20px 0',
            borderBottom: '1px solid #eee',
            overflowX: 'auto',
          }}
        >
          {directors.map((d, i) => (
            <button
              key={d._id}
              onClick={() => setActiveDirector(i)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: i === curDirIndex ? '#000' : '#999',
                background: 'none',
                border: 'none',
                borderBottom:
                  i === curDirIndex
                    ? '2px solid #000'
                    : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {d.name.trim() || `작가 ${i + 1}`}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeDirector(i);
                }}
                style={{ marginLeft: 8, color: '#ccc' }}
              >
                ✕
              </span>
            </button>
          ))}
          <button
            onClick={addDirector}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#2d5a45',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + 작가 추가
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.4fr',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'none' }}>
              <label style={labelStyle}>작가 번호</label>
              <input
                style={{
                  ...inputStyle,
                  backgroundColor: '#f5f5f5',
                  color: '#888',
                }}
                value={computeDirectorNumber(curDirIndex)}
                readOnly
                disabled
              />
            </div>
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            패키지
          </p>
          <div
            style={{
              display: 'flex',
              gap: 4,
              borderBottom: '1px solid #eee',
              marginBottom: 16,
              overflowX: 'auto',
            }}
          >
            {curDir.packages.map((p, i) => (
              <button
                key={p._id}
                onClick={() =>
                  setActivePackage((prev) => ({ ...prev, [curDirIndex]: i }))
                }
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: i === curPkgIndex ? '#000' : '#999',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    i === curPkgIndex
                      ? '2px solid #000'
                      : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
                {i > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      movePackage(curDirIndex, i, -1);
                    }}
                    style={{ marginLeft: 8, color: '#ccc' }}
                  >
                    ◀
                  </span>
                )}
                {i < curDir.packages.length - 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      movePackage(curDirIndex, i, 1);
                    }}
                    style={{ marginLeft: 6, color: '#ccc' }}
                  >
                    ▶
                  </span>
                )}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removePackage(curDirIndex, i);
                  }}
                  style={{ marginLeft: 8, color: '#ccc' }}
                >
                  ✕
                </span>
              </button>
            ))}
            <button
              onClick={() => addPackage(curDirIndex)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: '#2d5a45',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + 패키지 추가
            </button>
          </div>

          <PackageEditor
            pkg={curPkg}
            onChange={(patch) => updatePackage(curDirIndex, curPkgIndex, patch)}
            directorName={curDir.name}
            directorInstagram={curDir.instagram}
            onDirectorNameChange={(value) =>
              updateDirector(curDirIndex, { name: value })
            }
            onDirectorInstagramChange={(value) =>
              updateDirector(curDirIndex, { instagram: value })
            }
          />
        </div>
      </section>

      {previewOpen && (
        <ProductPreviewOverlay
          title={title || '(상품명 미입력)'}
          section={sectionFromRegionCategory(region, category)}
          directors={directors}
          productPosition={productPosition}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

// 아직 저장하지 않은 폼 상태를 실제 상세페이지 컴포넌트(WeddingDetail/ImageGallery)에 그대로
// 태워서 미리보기로 보여줌 — 실제 DB id가 없는 상태라 임의의 음수 id를 부여해 구분만 함
function buildPreviewWeddingData(
  directors: DirectorForm[],
  productPosition: number,
) {
  const previewDirectors = directors.map((d, i) => ({
    id: -(i + 1),
    number:
      directors.length > 1
        ? `#${productPosition}-${i + 1}`
        : `#${productPosition}`,
    name: d.name || `작가 ${i + 1}`,
    instagram:
      d.instagram
        .split(' / ')
        .map((h) => extractInstagramHandle(h))
        .filter(Boolean)
        .join(' / ') || null,
  }));
  const previewPrices: Record<
    number,
    { priceSNS: number; priceNoSNS: number }
  > = {};
  let pkgSeq = 0;
  const previewPackages = directors.flatMap((d, dIdx) =>
    d.packages.map((p) => {
      pkgSeq -= 1;
      const pkgId = pkgSeq;
      const priceSNS = p.isSinglePrice
        ? Number(p.priceSingle) || 0
        : Number(p.priceSNS) || 0;
      const priceNoSNS = p.isSinglePrice
        ? Number(p.priceSingle) || 0
        : Number(p.priceNoSNS) || 0;
      previewPrices[pkgId] = { priceSNS, priceNoSNS };
      return {
        id: pkgId,
        directorId: previewDirectors[dIdx].id,
        name: p.name || 'Package A',
        subtitle: null,
        priceSNS,
        priceNoSNS,
        hasPriceSNS: priceSNS > 0,
        hasPriceNoSNS: priceNoSNS > 0,
        isSinglePrice: p.isSinglePrice,
        shootingTime: [p.duration, p.durationUnit].filter(Boolean).join(' '),
        shootingTimeDetail: p.durationDetailOn ? p.durationDetail : null,
        locations: [p.locations, p.locationsUnit].filter(Boolean).join(' '),
        locationsDetail: p.locationsDetailOn ? p.locationsDetail : null,
        originalPhotos: p.originalPhotos,
        originalPhotosDetail: p.originalPhotosDetailOn
          ? p.originalPhotosDetail
          : null,
        retouched: Number(p.retouched) || 0,
        retouchedDetail: p.retouchedDetailOn ? p.retouchedDetail : null,
        director: previewDirectors[dIdx],
        addons: p.addons
          .filter((a) => a.displayName.trim())
          .map((a, i) => ({
            addon: {
              id: -(i + 1),
              name: a.displayName,
              displayName: a.displayName,
              price: a.noPrice ? 0 : Number(a.price) || 0,
              desc: a.desc || null,
            },
          })),
        inclusions: [
          ...p.inclusions
            .filter((x) => x.name.trim())
            .map((x, i) => ({ inclusion: { id: -(i + 1), name: x.name } })),
          ...p.inclusionNotes
            .filter((x) => x.text.trim())
            .map((x, i) => ({
              inclusion: { id: -(1000 + i), name: `Note: ${x.text}` },
            })),
        ],
        partners: p.partners
          .filter((pt) => pt.displayName.trim())
          .map((pt, i) => ({
            partner: {
              id: -(i + 1),
              role: pt.role,
              name: pt.displayName,
              displayName: pt.displayName,
              instagram: null,
              instagramAccounts: pt.instagramHandles
                .map((h) => extractInstagramHandle(h))
                .filter(Boolean)
                .map((handle) => ({ handle })),
            },
          })),
        images: p.images
          .filter((img) => img.url)
          .map((img, i) => ({
            id: -(i + 1),
            webUrl: img.url,
            originalUrl: img.url,
            thumbUrl: img.thumbUrl,
            blurDataUrl: img.blurDataUrl ?? null,
          })),
      };
    }),
  );
  return { previewDirectors, previewPackages, previewPrices };
}

function ProductPreviewOverlay({
  title,
  section,
  directors,
  productPosition,
  onClose,
}: {
  title: string;
  section: string;
  directors: DirectorForm[];
  productPosition: number;
  onClose: () => void;
}) {
  const [{ previewDirectors, previewPackages, previewPrices }] = useState(() =>
    buildPreviewWeddingData(directors, productPosition),
  );
  const [galleryImages, setGalleryImages] = useState(
    previewPackages[0]?.images ?? [],
  );
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#fafafa',
          borderRadius: 6,
          maxWidth: 1400,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#fff',
            borderBottom: '1px solid #eee',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#999',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            미리보기 · 실제 상세페이지 기준
          </span>
          <button onClick={onClose} style={btnStyle('#fff', '#333', '#ccc')}>
            닫기
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="hide-scroll p-5 mb-6 lg:mb-0 lg:pl-16 lg:pt-0 lg:pb-8">
            <ImageGallery
              mainImageUrl={null}
              images={galleryImages.map((img, order) => ({
                id: img.id,
                url: img.originalUrl,
                thumbUrl: img.thumbUrl,
                blurDataUrl: img.blurDataUrl,
                order,
              }))}
            />
          </div>
          <div className="p-6 lg:pl-6 lg:pr-16 lg:pt-8 lg:pb-16 pb-16">
            <WeddingDetail
              productId={-1}
              title={title}
              section={section}
              directors={previewDirectors}
              packages={previewPackages}
              onActiveImagesChange={setGalleryImages}
              previewMode
              previewPrices={previewPrices}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageEditor({
  pkg,
  onChange,
  directorName,
  directorInstagram,
  onDirectorNameChange,
  onDirectorInstagramChange,
}: {
  pkg: PackageForm;
  onChange: (patch: Partial<PackageForm>) => void;
  directorName: string;
  directorInstagram: string;
  onDirectorNameChange: (value: string) => void;
  onDirectorInstagramChange: (value: string) => void;
}) {
  function updateAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
    return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>패키지명</label>
        <input
          style={{ ...inputStyle, maxWidth: 300 }}
          value={pkg.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          파트너{' '}
          <span style={{ color: '#999', fontWeight: 500 }}>
            (Photographer · Hair & Makeup · Dress · Suit · Bouquet)
          </span>
        </p>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 10,
              border: '1px solid #eee',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '0.8fr 1fr',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  padding: '6px 8px',
                  color: '#666',
                  background: '#f5f5f5',
                  borderRadius: 4,
                  textAlign: 'center',
                }}
              >
                Photographer
              </span>
              <input
                style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                placeholder="Director Ura"
                value={directorName}
                onChange={(e) => onDirectorNameChange(e.target.value)}
              />
            </div>
            <input
              style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
              placeholder="@handle1 / @handle2"
              value={directorInstagram}
              onChange={(e) => onDirectorInstagramChange(e.target.value)}
            />
          </div>
          {pkg.partners.map((p, i) => (
            <div
              key={p._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 10,
                border: '1px solid #eee',
                borderRadius: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#999',
                    minWidth: 14,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() =>
                    onChange({ partners: moveItem(pkg.partners, i, -1) })
                  }
                  style={reorderBtnStyle}
                  aria-label="위로 이동"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={i === pkg.partners.length - 1}
                  onClick={() =>
                    onChange({ partners: moveItem(pkg.partners, i, 1) })
                  }
                  style={reorderBtnStyle}
                  aria-label="아래로 이동"
                >
                  ▼
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '0.8fr 1fr auto',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <select
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                  value={p.role}
                  onChange={(e) =>
                    onChange({
                      partners: updateAt(pkg.partners, i, {
                        role: e.target.value,
                      }),
                    })
                  }
                >
                  {PARTNER_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <input
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                  placeholder="업체명"
                  value={p.displayName}
                  onChange={(e) =>
                    onChange({
                      partners: updateAt(pkg.partners, i, {
                        displayName: e.target.value,
                      }),
                    })
                  }
                />
                <button
                  onClick={() =>
                    onChange({
                      partners: pkg.partners.filter((_, j) => j !== i),
                    })
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c0392b',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  삭제
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.instagramHandles.map((handle, hi) => (
                  <div key={hi} style={{ display: 'flex', gap: 4 }}>
                    <input
                      style={{
                        ...inputStyle,
                        padding: '6px 8px',
                        fontSize: 12,
                      }}
                      placeholder="@instagram_handle"
                      value={handle}
                      onChange={(e) => {
                        const next = [...p.instagramHandles];
                        next[hi] = e.target.value;
                        onChange({
                          partners: updateAt(pkg.partners, i, {
                            instagramHandles: next,
                          }),
                        });
                      }}
                    />
                    <button
                      onClick={() =>
                        onChange({
                          partners: updateAt(pkg.partners, i, {
                            instagramHandles: p.instagramHandles.filter(
                              (_, j) => j !== hi,
                            ),
                          }),
                        })
                      }
                      style={{
                        ...reorderBtnStyle,
                        color: '#c0392b',
                        borderColor: '#f3d3ce',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    onChange({
                      partners: updateAt(pkg.partners, i, {
                        instagramHandles: [...p.instagramHandles, ''],
                      }),
                    })
                  }
                  style={{ ...addBtnStyle, marginTop: 0 }}
                >
                  + 계정 추가
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            onChange({ partners: [...pkg.partners, emptyPartner()] })
          }
          style={addBtnStyle}
        >
          + 파트너 추가
        </button>
      </div>

      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          What's Included{' '}
          <span style={{ color: '#999', fontWeight: 500 }}>(포함 사항)</span>
        </p>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          {pkg.inclusions.map((inc, i) => (
            <div
              key={inc._id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: 6,
                alignItems: 'center',
                padding: 8,
                border: '1px solid #eee',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#999',
                  minWidth: 14,
                }}
              >
                {i + 1}
              </span>
              <input
                style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                placeholder="포함 항목 (예: 리무진 픽업 서비스)"
                value={inc.name}
                onChange={(e) =>
                  onChange({
                    inclusions: updateAt(pkg.inclusions, i, {
                      name: e.target.value,
                    }),
                  })
                }
              />
              <button
                type="button"
                disabled={i === 0}
                onClick={() =>
                  onChange({ inclusions: moveItem(pkg.inclusions, i, -1) })
                }
                style={reorderBtnStyle}
                aria-label="위로 이동"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={i === pkg.inclusions.length - 1}
                onClick={() =>
                  onChange({ inclusions: moveItem(pkg.inclusions, i, 1) })
                }
                style={reorderBtnStyle}
                aria-label="아래로 이동"
              >
                ▼
              </button>
              <button
                onClick={() =>
                  onChange({
                    inclusions: pkg.inclusions.filter((_, j) => j !== i),
                  })
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c0392b',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            onChange({ inclusions: [...pkg.inclusions, emptyInclusion()] })
          }
          style={addBtnStyle}
        >
          + 항목 추가
        </button>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
          What's Included 각주
        </p>
        <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
          체크리스트 대신 하단에 별도 안내문으로 노출됩니다
        </p>
        {pkg.inclusionNotes.map((note, i) => (
          <div
            key={note._id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 6,
              alignItems: 'center',
              padding: 8,
              border: '1px solid #eee',
              borderRadius: 4,
              marginBottom: 6,
            }}
          >
            <input
              style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
              placeholder="각주 내용"
              value={note.text}
              onChange={(e) =>
                onChange({
                  inclusionNotes: updateAt(pkg.inclusionNotes, i, {
                    text: e.target.value,
                  }),
                })
              }
            />
            <button
              onClick={() =>
                onChange({
                  inclusionNotes: pkg.inclusionNotes.filter((_, j) => j !== i),
                })
              }
              style={{
                background: 'none',
                border: 'none',
                color: '#c0392b',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              삭제
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            onChange({
              inclusionNotes: [
                ...pkg.inclusionNotes,
                { _id: nextId(), text: '' },
              ],
            })
          }
          style={addBtnStyle}
        >
          + 각주 추가
        </button>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          Shoot Details{' '}
          <span style={{ color: '#999', fontWeight: 500 }}>(촬영 정보)</span>
        </p>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          <ShootStat
            label="Duration"
            value={pkg.duration}
            unit={pkg.durationUnit}
            onValue={(v) => onChange({ duration: v })}
            onUnit={(v) => onChange({ durationUnit: v })}
            detailOn={pkg.durationDetailOn}
            detail={pkg.durationDetail}
            onDetailToggle={(v) => onChange({ durationDetailOn: v })}
            onDetail={(v) => onChange({ durationDetail: v })}
          />
          <ShootStat
            label="Locations"
            value={pkg.locations}
            unit={pkg.locationsUnit}
            onValue={(v) => onChange({ locations: v })}
            onUnit={(v) => onChange({ locationsUnit: v })}
            detailOn={pkg.locationsDetailOn}
            detail={pkg.locationsDetail}
            onDetailToggle={(v) => onChange({ locationsDetailOn: v })}
            onDetail={(v) => onChange({ locationsDetail: v })}
          />
          <ShootStat
            label="Original Photos"
            value={pkg.originalPhotos}
            unit={pkg.originalPhotosUnit}
            onValue={(v) => onChange({ originalPhotos: v })}
            onUnit={(v) => onChange({ originalPhotosUnit: v })}
            detailOn={pkg.originalPhotosDetailOn}
            detail={pkg.originalPhotosDetail}
            onDetailToggle={(v) => onChange({ originalPhotosDetailOn: v })}
            onDetail={(v) => onChange({ originalPhotosDetail: v })}
          />
          <ShootStat
            label="Retouched Photos"
            value={pkg.retouched}
            unit={pkg.retouchedUnit}
            onValue={(v) => onChange({ retouched: v })}
            onUnit={(v) => onChange({ retouchedUnit: v })}
            detailOn={pkg.retouchedDetailOn}
            detail={pkg.retouchedDetail}
            onDetailToggle={(v) => onChange({ retouchedDetailOn: v })}
            onDetail={(v) => onChange({ retouchedDetail: v })}
          />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
          Add-ons{' '}
          <span style={{ color: '#999', fontWeight: 500 }}>(부가 옵션)</span>
        </p>
        <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
          유저 화면에서 항목을 누르면 펼쳐지며 상세설명이 나타납니다
        </p>
        {pkg.addons.map((a, i) => (
          <div
            key={a._id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 8,
              border: '1px solid #eee',
              borderRadius: 4,
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#999',
                  minWidth: 14,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                disabled={i === 0}
                onClick={() =>
                  onChange({ addons: moveItem(pkg.addons, i, -1) })
                }
                style={reorderBtnStyle}
                aria-label="위로 이동"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={i === pkg.addons.length - 1}
                onClick={() => onChange({ addons: moveItem(pkg.addons, i, 1) })}
                style={reorderBtnStyle}
                aria-label="아래로 이동"
              >
                ▼
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <input
                style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                placeholder="옵션명"
                value={a.displayName}
                onChange={(e) =>
                  onChange({
                    addons: updateAt(pkg.addons, i, {
                      displayName: e.target.value,
                    }),
                  })
                }
              />
              <input
                style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                type="number"
                placeholder="추가 금액"
                value={a.price}
                disabled={a.noPrice}
                onChange={(e) =>
                  onChange({
                    addons: updateAt(pkg.addons, i, { price: e.target.value }),
                  })
                }
              />
              <label
                style={{
                  fontSize: 11,
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <input
                  type="checkbox"
                  checked={a.noPrice}
                  onChange={(e) =>
                    onChange({
                      addons: updateAt(pkg.addons, i, {
                        noPrice: e.target.checked,
                      }),
                    })
                  }
                />
                가격 미정
              </label>
              <button
                onClick={() =>
                  onChange({ addons: pkg.addons.filter((_, j) => j !== i) })
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c0392b',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                삭제
              </button>
            </div>
            <textarea
              style={{ ...inputStyle, fontSize: 12, minHeight: 44 }}
              placeholder="상세설명"
              value={a.desc}
              onChange={(e) =>
                onChange({
                  addons: updateAt(pkg.addons, i, { desc: e.target.value }),
                })
              }
            />
          </div>
        ))}
        <button
          onClick={() => onChange({ addons: [...pkg.addons, emptyAddon()] })}
          style={addBtnStyle}
        >
          + 옵션 추가
        </button>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>가격</p>
        <label
          style={{
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <input
            type="checkbox"
            checked={pkg.isSinglePrice}
            onChange={(e) => onChange({ isSinglePrice: e.target.checked })}
          />
          가격 단일 표기
        </label>
        {pkg.isSinglePrice ? (
          <div>
            <label style={labelStyle}>패키지 가격</label>
            <input
              style={{ ...inputStyle, maxWidth: 200 }}
              type="number"
              value={pkg.priceSingle}
              onChange={(e) => onChange({ priceSingle: e.target.value })}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              maxWidth: 420,
            }}
          >
            <div>
              <label style={labelStyle}>가격 (SNS 동의)</label>
              <input
                style={inputStyle}
                type="number"
                value={pkg.priceSNS}
                onChange={(e) => onChange({ priceSNS: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>가격 (SNS 미동의)</label>
              <input
                style={inputStyle}
                type="number"
                value={pkg.priceNoSNS}
                onChange={(e) => onChange({ priceNoSNS: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const addBtnStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 8,
  padding: 7,
  fontSize: 12,
  fontWeight: 600,
  color: '#666',
  background: '#fff',
  border: '1px dashed #ccc',
  borderRadius: 3,
  cursor: 'pointer',
};

function ShootStat({
  label,
  value,
  unit,
  onValue,
  onUnit,
  detailOn,
  detail,
  onDetailToggle,
  onDetail,
}: {
  label: string;
  value: string;
  unit: string;
  onValue: (v: string) => void;
  onUnit: (v: string) => void;
  detailOn?: boolean;
  detail?: string;
  onDetailToggle?: (v: boolean) => void;
  onDetail?: (v: string) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: 4,
        padding: '10px 12px',
        background: '#fafafa',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          marginBottom: onDetailToggle ? 8 : 0,
        }}
      >
        <input
          style={{
            ...inputStyle,
            padding: '6px 8px',
            fontSize: 13,
            fontWeight: 700,
          }}
          value={value}
          onChange={(e) => onValue(e.target.value)}
        />
        <input
          style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
          value={unit}
          onChange={(e) => onUnit(e.target.value)}
        />
      </div>
      {onDetailToggle && (
        <>
          <label
            style={{
              fontSize: 11,
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <input
              type="checkbox"
              checked={detailOn}
              onChange={(e) => onDetailToggle(e.target.checked)}
            />
            추가 설명
          </label>
          {detailOn && (
            <textarea
              style={{
                ...inputStyle,
                fontSize: 12,
                minHeight: 44,
                marginTop: 6,
              }}
              value={detail}
              onChange={(e) => onDetail?.(e.target.value)}
            />
          )}
        </>
      )}
    </div>
  );
}
