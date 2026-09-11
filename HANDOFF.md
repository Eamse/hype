# hypewedding.kr 인수인계 문서

작성일: 2026-09-12

## 1. 개요

- **스택**: Next.js (App Router) + Prisma + PostgreSQL, 배포는 iwinv VPS에 PM2로 직접 구동 (Vercel 아님)
- **도메인**: hypewedding.kr
- **어드민**: `/gatekeeper-7f3k9` (경로 자체가 비밀번호 역할, URL 노출 주의)

## 2. 로컬 개발 환경

```bash
npm install
npm run dev        # .next, node_modules/.cache 지우고 next dev 실행
npm run test       # vitest
npx tsc --noEmit   # 타입체크
npm run lint       # eslint
```

`.env` 필요한 변수 (레포에 커밋 안 되어 있음, 별도 전달 필요):

```
DATABASE_URL=postgresql://...
ADMIN_JWT_SECRET=...
ENCRYPTION_KEY=...        # 개인정보 필드 암호화용 (lib/encryption.ts)
DEV_PASSWORD=...
MAGAZINE_DEV_PASSWORD=...
MAGAZINE_MINJU_PASSWORD=...
MAGAZINE_MORGAN_PASSWORD=...
MINJU_PASSWORD=...
MORGAN_PASSWORD=...
GA_CLIENT_EMAIL=...       # Google Analytics Data API
GA_PRIVATE_KEY=...
GA_PROPERTY_ID=...
R2_PUBLIC_BASE_URL=...    # Cloudflare R2 (이미지 저장소)
R2_PUBLIC_URL=...
```

⚠️ 회원 관련 스키마(`User`/`Account`/`Session`)는 있지만 **구글 OAuth 로그인은 아직 미구현**입니다 (설계만 되어 있고 `GOOGLE_CLIENT_ID` 등 관련 코드 없음). 관련 작업 이어가려면 `next-auth` 설정부터 시작해야 합니다.

## 3. 배포 파이프라인 (중요, 여기서 자주 삽질했음)

`.github/workflows/*.yml` — `main`에 push되면 GitHub Actions가 SSH로 서버(`/root/hypepig`)에 접속해서:

1. `bash deploy/maintenance-on.sh` → nginx가 503 유지보수 페이지 서빙 시작
2. `git pull origin main`
3. `npm install`
4. `npx prisma db push` (⚠️ `--accept-data-loss` 옵션 없음 — 컬럼 삭제가 필요한 스키마 변경이면 여기서 멈춰버림. `set -e`라서 그 상태로 파이프라인이 죽고 유지보수 모드가 계속 켜져 있게 됨)
5. `npm run build`
6. `.next/static`, `public`, `.env`를 `.next/standalone`에 복사
7. `pm2 restart hypepig && pm2 save`
8. `bash deploy/maintenance-off.sh`

### 알아둬야 할 함정들

- **`package-lock.json` drift**: 서버에서 수동으로 `npm install`을 한 번이라도 하면 `package-lock.json`이 로컬 변경으로 남아서, 다음 `git pull`이 조용히 실패합니다 (파이프라인은 12~13초 만에 "성공"으로 끝나버려서 놓치기 쉬움 — 반드시 `gh run view --log-failed`로 실제 로그 확인). 서버에서 수동 작업을 했다면 다음 배포 전에 `git checkout -- package-lock.json`부터 하세요.
- **스키마 변경이 컬럼 삭제를 포함하면** 자동 배포가 막힙니다. 이 경우 수동으로 SSH 들어가서 `npx prisma db push --accept-data-loss`를 실행해야 하는데, **그 전에 반드시 해당 컬럼 데이터를 덤프해두고** 진행하세요 (한 번 데이터 날릴 뻔한 적 있음).
- **Prisma Client 재생성**: `db push` 이후 `npx prisma generate`를 안 하면 새로 추가한 모델/필드를 쓰는 코드가 `Cannot read properties of undefined` 에러를 냅니다. 로컬 dev 서버도 스키마 변경 후엔 완전히 재시작(`pkill -f "next dev"; rm -rf .next; npm run dev`)해야 캐시된 옛날 Prisma Client를 안 씁니다.
- **Prisma는 `migrate`가 아니라 `db push`만 씁니다.** `prisma/migrations/` 폴더가 있긴 하지만 2026-08-24 이후로 갱신 안 됐고, 그 이후 스키마 변경(Addon 구조 개편, Partner 다중 계정/순서 등)은 전부 `db push`로만 반영되어서 **schema.prisma와 migrations 폴더가 어긋나 있습니다.** `prisma migrate deploy`를 쓰면 안 되고, 앞으로도 `db push` 방식을 유지하거나, 마이그레이션 히스토리를 정리하고 넘어가야 합니다.

## 4. 어드민에서 흔히 발생하는 문제

- **어드민 브라우저 탭을 여러 개/오래 열어두고 저장하면**, 파트너/애드온/인클루전 저장 API가 "전체 삭제 후 재생성" 방식이라 **오래된 화면 상태로 저장하면 방금 DB에서 직접 고친 내용을 덮어씁니다.** 스크립트로 DB를 직접 만졌다면 어드민 탭은 새로고침 후 이어서 써야 합니다.
- 패키지 파트너 순서 변경은 패키지 수정 폼의 "미리보기" 모달 안에서만 가능합니다 (폼 자체엔 순서 변경 UI 없음, 의도된 설계).

## 5. 데이터 모델에서 알아둘 것

- **Partner**: `name`(관리용, 내부 구분용 접미사 붙을 수 있음) vs `displayName`(공개 노출명, null이면 name 사용) 분리. `instagramAccounts`(`PartnerInstagram`, 1:N)로 계정 여러 개 지원. 레거시 `Partner.instagram` 문자열 필드는 마이그레이션 안 된 옛날 레코드용으로 남아있을 뿐, 새로 쓰면 안 됨.
- **PackagePartner**: `order` 컬럼으로 패키지 내 파트너 노출 순서 관리 (역할 무관, 어드민에서 자유롭게 재배치 가능). Photographer는 이 테이블 소속이 아니라 `Director`에서 옴 — 항상 1번 고정, 순서 변경 대상 아님.
- **Addon**: 같은 `displayName`인데 가격/설명이 패키지마다 다른 "버전"들이 `name`에 "(버전 N)" 접미사로 구분되어 존재. 화면엔 `displayName`만 노출.
- **App.jsx 원본 대조**: `scripts/package-new/App.jsx` (= `src/App.jsx`, 내용 동일)가 클라이언트가 준 원본 패키지 데이터 그라운드 트루스입니다. `packages2027`이 있으면 그걸 우선, 없으면 `packages`. **단, 클라이언트가 이후 별도 수정 시트로 준 정정사항이 App.jsx보다 우선합니다** (예: Ettera 계정, 서울 HMU 결합 계정, Greemy Snap dress 계정 등 — 여러 건이 App.jsx 원본과 다르게 최종 반영되어 있음, git log 커밋 메시지 참고).
- **Director.number**가 App.jsx 대조 시 유일하게 신뢰할 수 있는 매칭 키 (이름/인스타로 매칭하면 충돌남). `location`(Jeju/Seoul)도 같이 봐야 함 — 두 지역이 같은 번호(#2, #3, #5, #6, #7)를 공유하는 디렉터가 있음.

## 6. 테스트

`vitest`, 21개 테스트, 5개 파일 (`lib/*.test.ts`, `components/admin/wedding-photographer-types.test.ts`). 실제로 발견했던 버그(기간 "4.5-5 hours" 파싱, addon variant 그룹핑, 단일가격 토글, 리스트 재정렬)를 커버합니다. 새 로직 추가 시 여기에 테스트 추가하는 패턴 유지하면 좋습니다.

## 7. scripts/ 폴더

- 재사용 가능한 도구로 남겨둔 것: `prod-full-audit.ts`, `prod-migrate-instagram-accounts.ts`, `pull-sheet-to-db.ts`/`push-json-to-sheet.ts`(구글 시트 연동), `transform-appjsx-to-schema.ts`
- 이 외 `tmp-*.ts` 패턴 스크립트는 전부 1회성 DB 수정/검수용이고 **사용 후 바로 삭제하는 게 이 프로젝트 컨벤션**입니다 — 남겨두지 마세요.

## 8. 현재 미해결/보류 중인 항목

- **Rosemarry Snap (Photo Only) 가격 업데이트**: 클라이언트 수정 시트에 "가격 업뎃 안됨"이라고만 적혀있고 목표 가격이 명시 안 되어 있음. 클라이언트에게 정확한 금액 확인 필요.
- **"4K Pre-Wedding Highlight Video (~1 min, landscape)"**: 전체 기간 표기를 "~" → "-"로 통일하는 작업 중, 이 항목만 "~"가 범위가 아니라 "약(approximately)" 의미라서 보류 중. 클라이언트 확인 대기.

## 9. 작업 컨벤션 (기존 개발 히스토리에서 지켜온 것)

- `main` 브랜치에 직접 커밋 (별도 브랜치/PR 안 씀)
- 커밋 메시지에 AI 툴 관련 트레일러 넣지 않음
- 프로덕션 DB/서버에 영향 주는 작업은 항상 백업 먼저, 그리고 로컬에서 먼저 검증 후 반영
- 임시 DB 스크립트(`scripts/tmp-*.ts`)는 로컬/서버 양쪽에서 쓰고 나면 바로 삭제
