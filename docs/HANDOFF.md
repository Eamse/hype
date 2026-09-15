# hypewedding.kr 인수인계 문서

작성일: 2026-09-12

> 급한대로 AI 토대로 작성했습니다.

> 압축 파일은 노드 모듈 뺐습니다.

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
AUTH_SECRET=...          # NextAuth (회원 로그인)
AUTH_GOOGLE_ID=...       # 구글 OAuth
AUTH_GOOGLE_SECRET=...
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
R2_ACCESS_KEY_ID=...      # Cloudflare R2 (이미지 저장소)
R2_SECRET_ACCESS_KEY=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
R2_PUBLIC_BASE_URL=...
R2_BACKUP_ACCESS_KEY_ID=...   # R2 백업용 (별도 버킷)
R2_BACKUP_SECRET_ACCESS_KEY=...
R2_BACKUP_BUCKET=...
R2_BACKUP_ENDPOINT=...
```

구글 OAuth 로그인은 **이미 구현되어 있습니다** (`auth.ts`/`auth.config.ts`, NextAuth(Auth.js v5) + Google Provider + Credentials Provider).

## 3. 배포 파이프라인 (중요, 여기서 자주 삽질했음)

`.github/workflows/*.yml` — `main`에 push되면 GitHub Actions가 SSH로 서버(`/root/hypepig`)에 접속해서:

1. `git pull origin main`
2. `bash deploy/maintenance-on.sh` → nginx가 503 유지보수 페이지 서빙 시작
3. `npm install`
4. `npx prisma db push` (⚠️ `--accept-data-loss` 옵션 없음 — 컬럼 삭제가 필요한 스키마 변경이면 여기서 멈춰버림. `set -e`라서 그 상태로 파이프라인이 죽고 유지보수 모드가 계속 켜져 있게 됨)
5. (있으면) `.next/standalone/.next/cache/images`를 `/tmp`에 백업
6. `NODE_OPTIONS="--max-old-space-size=3072" npm run build` (메모리 제한 걸어서 빌드, 서버 사양 때문)
7. `.next/static`, `public`, `.env`를 `.next/standalone`에 복사
8. 백업해둔 이미지 캐시를 다시 `.next/standalone/.next/cache/images`로 복원
9. `pm2 restart hypepig && pm2 save`
10. `bash deploy/maintenance-off.sh`

### 알아둬야 할 함정들

- **`package-lock.json` drift**: 서버에서 수동으로 `npm install`을 한 번이라도 하면 `package-lock.json`이 로컬 변경으로 남아서, 다음 `git pull`이 조용히 실패합니다 (파이프라인은 12~13초 만에 "성공"으로 끝나버려서 놓치기 쉬움 — 반드시 `gh run view --log-failed`로 실제 로그 확인). 서버에서 수동 작업을 했다면 다음 배포 전에 `git checkout -- package-lock.json`부터 하세요.
- **스키마 변경이 컬럼 삭제를 포함하면** 자동 배포가 막힙니다. 이 경우 수동으로 SSH 들어가서 `npx prisma db push --accept-data-loss`를 실행해야 하는데, **그 전에 반드시 해당 컬럼 데이터를 덤프해두고** 진행하세요 (한 번 데이터 날릴 뻔한 적 있음).
- **Prisma Client 재생성**: `db push` 이후 `npx prisma generate`를 안 하면 새로 추가한 모델/필드를 쓰는 코드가 `Cannot read properties of undefined` 에러를 냅니다. 로컬 dev 서버도 스키마 변경 후엔 완전히 재시작(`pkill -f "next dev"; rm -rf .next; npm run dev`)해야 캐시된 옛날 Prisma Client를 안 씁니다.
- **Prisma는 `migrate`가 아니라 `db push`만 씁니다.** 2026-09-12에 옛 migrations 파일들을 정리하고 현재 스키마 전체를 담은 `20260912021130_baseline_sync` 베이스라인 마이그레이션 1개로 이력을 다시 시작했습니다 (로컬/프로덕션 둘 다 `prisma migrate resolve --applied`로 맞춰둠). 배포 파이프라인은 여전히 `db push`만 쓰니, 앞으로도 `prisma migrate dev`/`migrate deploy`는 쓰지 말고 스키마 변경 후 `db push`만 하면 됩니다 (이력 파일은 실제로 안 늘어남 — 필요하면 나중에 또 베이스라인 잡으면 됨).

## 4. 어드민에서 흔히 발생하는 문제

- **어드민 브라우저 탭을 여러 개/오래 열어두고 저장하면**, 파트너/애드온/인클루전 저장 API가 "전체 삭제 후 재생성" 방식이라 **오래된 화면 상태로 저장하면 방금 DB에서 직접 고친 내용을 덮어씁니다.** 스크립트로 DB를 직접 만졌다면 어드민 탭은 새로고침 후 이어서 써야 합니다.
- 패키지 파트너 순서 변경은 패키지 수정 폼의 "미리보기" 모달 안에서만 가능합니다 (폼 자체엔 순서 변경 UI 없음, 의도된 설계).

## 5. 데이터 모델에서 알아둘 것

- **Partner**: `name`(관리용, 내부 구분용 접미사 붙을 수 있음) vs `displayName`(공개 노출명, null이면 name 사용) 분리. `instagramAccounts`(`PartnerInstagram`, 1:N)로 계정 여러 개 지원. 레거시 `Partner.instagram` 문자열 필드는 마이그레이션 안 된 옛날 레코드용으로 남아있을 뿐, 새로 쓰면 안 됨.
- **PackagePartner**: `order` 컬럼으로 패키지 내 파트너 노출 순서 관리 (역할 무관, 어드민에서 자유롭게 재배치 가능). Photographer는 이 테이블 소속이 아니라 `Director`에서 옴 — 항상 1번 고정, 순서 변경 대상 아님.
- **Addon**: 같은 `displayName`인데 가격/설명이 패키지마다 다른 "버전"들이 `name`에 "(버전 N)" 접미사로 구분되어 존재. 화면엔 `displayName`만 노출.
- **클라이언트 원본 데이터 검수는 완료된 상태**입니다. 검수에 썼던 원본 파일(`scripts/package-new/App.jsx`)은 더 이상 필요 없어서 삭제했습니다. 이후에도 데이터가 이상하면 클라이언트에게 다시 원본을 받아서 대조해야 함 — 그때는 `Director.number`(이름/인스타로 매칭하면 충돌남)와 `location`(Jeju/Seoul, 같은 번호를 공유하는 디렉터가 있어서 지역까지 같이 봐야 함)을 키로 매칭하면 됩니다.

## 6. scripts/ 폴더

- 재사용 가능한 도구로 남겨둔 것: `prod-full-audit.ts`, `prod-migrate-instagram-accounts.ts`, `pull-sheet-to-db.ts`/`push-json-to-sheet.ts`(구글 시트 연동), `transform-appjsx-to-schema.ts`
- 이 외 `tmp-*.ts` 패턴 스크립트는 전부 1회성 DB 수정/검수용이고 **사용 후 바로 삭제하는 게 이 프로젝트 컨벤션**입니다 — 남겨두지 마세요.

## 7. 작업 컨벤션 (기존 개발 히스토리에서 지켜온 것)

- 프로덕션 DB/서버에 영향 주는 작업은 항상 백업 먼저, 그리고 로컬에서 먼저 검증 후 반영
- 임시 DB 스크립트(`scripts/tmp-*.ts`)는 로컬/서버 양쪽에서 쓰고 나면 바로 삭제
