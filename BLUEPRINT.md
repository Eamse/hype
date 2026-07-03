# Hype Pig Admin — Redesign Blueprint

> 작성일: 2026-07-02  
> DB: 비어있음 (마이그레이션 불필요)

---

## 목표 구조 요약

```
[Manage] 작가 관리 탭  ←  모든 마스터 데이터 허브
  └─ Director
       └─ Package A / B / C
            ├─ 가격, 촬영시간, 장소, 보정본
            ├─ Inclusions (Manage > Inclusions 탭에서 등록한 항목 선택)
            ├─ Addons    (Manage > Addons 탭에서 등록한 항목 선택)
            └─ Partners  (Manage > HMU/Dress/Suit 탭에서 등록한 항목 선택)
                         ※ 파트너는 패키지별로 다름
                         ※ 파트너 정보(인스타 등) 변경 시 Partner 탭에서만 수정하면 전체 반영

[Products] 상품 등록 탭  ←  껍데기만
  └─ 썸네일 + 상세이미지
  └─ 섹션 선택 (Photographers Jeju / Seoul / Casual Jeju / Seoul)
  └─ 작가 선택 (등록된 Director 목록에서 체크)
```

---

## 스키마 변경

### 변경 전 → 변경 후

| 모델 | 변경 내용 |
|---|---|
| `Package` | `productId` 제거 → Director 소속으로 |
| `ProductPartner` | **삭제** |
| `PackagePartner` | **신규** — 파트너를 패키지 단위로 연결 |
| `Product` | `brand`, `price`, `description`, `inclusions String[]` 제거 (또는 미사용 처리) |

### 새 스키마

```prisma
model Director {
  id        Int               @id @default(autoincrement())
  number    String            // "#1-1", "#1-2", "#2"
  name      String
  instagram String?
  imageUrl  String?
  order     Int               @default(0)
  products  ProductDirector[]
  packages  Package[]         // 패키지가 Director 소속
}

model Package {
  id              Int                @id @default(autoincrement())
  directorId      Int                // ← productId 제거, directorId만 남김
  name            String             // "Package A", "Package B"
  subtitle        String?
  priceSNS        Int
  priceNoSNS      Int
  shootingTime    String
  locations       String
  originalPhotos  String
  retouched       Int
  retouchedDetail String?
  order           Int                @default(0)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  director        Director           @relation(fields: [directorId], references: [id], onDelete: Cascade)
  addons          PackageAddon[]
  inclusions      PackageInclusion[]
  partners        PackagePartner[]   // ← 신규: 파트너를 패키지 단위로
}

model PackagePartner {                // ← 신규
  packageId Int
  partnerId Int
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  partner   Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@id([packageId, partnerId])
}

model Partner {
  id        Int              @id @default(autoincrement())
  role      String           // "hmu" | "dress" | "suit"
  name      String
  instagram String?
  imageUrl  String?
  order     Int              @default(0)
  packages  PackagePartner[] // ← products → packages 로 변경
}

model Product {
  id        Int              @id @default(autoincrement())
  section   String           // "Photographers · Jeju" 등
  title     String
  imageUrl  String?          // 썸네일
  order     Int              @default(0)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  images    ProductImage[]
  directors ProductDirector[]
  bookmarks Bookmark[]
  // brand, price, description, inclusions String[] → 제거
}
```

---

## 어드민 패널 구조

### Directors 탭 (핵심 변경)

```
Director 목록
  └─ [작가 추가] 버튼

  ▼ Jeju and You (#1)        ← 클릭하면 펼침
       기본 정보: name / number / instagram / 이미지
       ─────────────────────────────────────
       패키지 목록
         ▼ Package A
              subtitle
              priceSNS / priceNoSNS
              shootingTime / locations / originalPhotos
              retouched / retouchedDetail
              ─────────────────────────
              Inclusions: [체크박스 목록]
              Addons:     [체크박스 목록]
              Partners:
                HMU:   [드롭다운 — Partner(role=hmu) 목록]
                Dress: [드롭다운 — Partner(role=dress) 목록]
                Suit:  [드롭다운 — Partner(role=suit) 목록]
         ▼ Package B
              ...
         [+ 패키지 추가]
```

### Products 탭 (단순화)

```
상품 등록 폼
  section    [드롭다운]
  title      [텍스트]
  thumbnail  [이미지 업로드]
  상세이미지   [다중 이미지 업로드]
  Directors  [체크박스 목록 — 등록된 Director에서 선택]
```

### Manage 하위 탭 (현재와 동일 유지)

- **Inclusions** — CRUD (name만)
- **Addons** — CRUD (name, price, desc)
- **Hair & Makeup** — Partner(role=hmu) CRUD
- **Dress** — Partner(role=dress) CRUD
- **Suit** — Partner(role=suit) CRUD

> 이 탭들은 독립적으로 유지. Directors 탭에서 "참조"만 함.
> 파트너 인스타 변경 → Partner 탭에서만 수정하면 전체 패키지에 자동 반영.

---

## 유저 페이지 렌더링 쿼리

```
Product
  └─ directors (ProductDirector → Director)
       └─ packages (Package, directorId 기준)
            ├─ addons (PackageAddon → Addon)
            ├─ inclusions (PackageInclusion → Inclusion)
            └─ partners (PackagePartner → Partner)
```

`wedding-detail.tsx` 변경: `partnerRows` 조립 시 `activePackage.partners`에서 role별로 찾도록 수정

---

## API 변경 사항

| 현재 | 변경 후 |
|---|---|
| `GET /api/admin/packages` (productId 기준) | `GET /api/admin/directors/[id]/packages` |
| `POST /api/admin/packages` (productId 포함) | `POST /api/admin/directors/[id]/packages` |
| `PUT /api/admin/packages/[id]/addons` | 유지 |
| `PUT /api/admin/packages/[id]/inclusions` | 유지 |
| `PUT /api/admin/packages/[id]/partners` | **신규** |
| `GET/POST /api/admin/product-partners/[productId]` | **삭제** |

---

## 구현 순서

1. **스키마 변경** — `Package.productId` 제거, `PackagePartner` 추가, `ProductPartner` 삭제, `Product` 정리
2. **DB push + generate**
3. **Package API 개편** — director 기반으로
4. **PackagePartner API** — `PUT /api/admin/packages/[id]/partners`
5. **Directors 패널 개편** — 패키지 + 파트너 선택 포함
6. **Product 등록 단순화** — 이미지 + Director 선택만
7. **유저 페이지 쿼리 수정** — `Partner`를 `PackagePartner`에서 가져오도록
8. **wedding-detail.tsx 수정** — partners를 `activePackage.partners`에서 파싱

---

## 확정된 결정사항

- [x] 파트너는 패키지별로 다름 → `PackagePartner` 조인 테이블
- [x] DB 비어있음 → 마이그레이션 불필요, 스키마 자유롭게 변경 가능
- [x] 파트너 정보 변경 가능 → Partner 별도 관리, 패키지에서 참조
- [x] Inclusions/Addons/HMU/Dress/Suit 탭은 현재 구조 유지
- [x] Casual (Hype Snap) 상품도 동일 구조 — Director는 섹션 구분 없이 공유, 상품마다 "어떤 작가 쓸지"만 선택. 컨셉(섹션)이 바뀌는 것.
