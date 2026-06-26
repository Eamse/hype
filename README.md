# HYPE WEDDING

서울·제주에서 웨딩 촬영 스튜디오를 탐색하고 문의할 수 있는 플랫폼
유저 서비스 + 관리자 시스템이 분리된 풀스택 구조

## 프로젝트 규모

- 개발 기간: 개발 중
- 참여 인원: 1명 (개인 프로젝트)

---

**유저**

- 서울 / 제주 웨딩·캐주얼 사진작가 탐색 및 상품 조회
- 조건 기반 상품 검색 (title / brand / description)
- Google OAuth 및 이메일/비밀번호 기반 회원 인증
- 온보딩 정보 수집 및 사용자 프로필 생성 (이름 / 생년월일 / 성별 / 국가 / 전화번호)
- 상품 북마크 저장 및 개인 북마크 리스트 관리
- 매거진 콘텐츠 열람 (촬영 스토리 / 가이드 콘텐츠)

**관리자**

- 서비스 운영 대시보드 (사용자 / 상품 통계 관리)
- 히어로 이미지 업로드 및 삭제 (Cloudflare R2 연동)
- 사진작가 상품 관리 (생성 / 수정 / 삭제 / 이미지 다중 업로드 / 노출 순서 제어)
- 매거진 콘텐츠 관리 (작성 / 발행 / 이미지 관리)
- 지역 및 카테고리 기반 상품 분류 관리 (서울 / 제주 / 캐주얼)
- 회원 데이터 조회 및 관리
- 관리자 계정 관리 (master 권한 기반 계정 생성·삭제, manager 접근 제한)

**권한 구조**

일반 유저와 관리자는 완전히 분리된 테이블과 인증 방식을 사용
일반 유저는 Google OAuth 또는 이메일/비밀번호로 로그인하고, 관리자는 별도 Admin 테이블의 ID/PW로 JWT 인증

## 서비스 구조

사진작가 상품 탐색 → 북마크 저장 → 상담 문의
관리자는 어드민 패널에서 상품·히어로 이미지·매거진 콘텐츠·회원을 관리

**주요 도메인**

- `User` → Google OAuth 또는 Credentials 인증 · 온보딩 정보 포함
- `Product` → `ProductImage` (섹션별 사진작가 상품)
- `Magazine` → `MagazineImage` (Cascade Delete)
- `Admin` → role(master/manager) 기반 관리자 계정
- `Bookmark` → 유저별 상품 북마크

---

## 기술 스택

| 구분            | 사용 기술                         | 선택 이유                                                                |
| --------------- | --------------------------------- | ------------------------------------------------------------------------ |
| Frontend        | Next.js 15 (App Router), React 19 | 풀스택 단일 프로젝트로 운영 가능하고, SSR·CSR을 라우트별로 유연하게 조합 |
| Styling         | Tailwind CSS 4, shadcn/ui         | 유틸리티 클래스로 빠른 UI 구성, 재사용 가능한 컴포넌트 시스템            |
| ORM             | Prisma + PostgreSQL               | 타입 안전한 쿼리와 마이그레이션 관리                                     |
| 이미지 스토리지 | Cloudflare R2 + AWS SDK           | S3 호환 API를 그대로 사용하면서 무료 이그레스 비용, CDN 내장             |
| 이미지 처리     | sharp                             | 업로드 시점에 WebP 변환·리사이즈를 서버에서 일관되게 처리                |
| 인증 (유저)     | NextAuth v5 (JWT · Google OAuth)  | 소셜 로그인과 Credentials를 하나의 라이브러리로 통합 관리                |
| 인증 (관리자)   | jose (JWT · httpOnly Cookie)      | XSS로 토큰이 탈취되지 않도록 JS 접근 차단, 2시간 만료                    |
| 암호화          | Node.js (crypto: AES-256-GCM)     | 개인정보(이름·전화번호) 저장 시 암호화                                   |

---

## 주요 기능

**보안**

- NextAuth JWT 세션 (7일 만료) · Admin JWT 쿠키 (2시간 만료)
- Proxy 미들웨어로 `/admin`, `/onboarding` 접근 보호
- Magic Bytes 검증 — MIME 스푸핑 방지 (JPEG/PNG/WEBP 실제 내용 확인)
- Decompression Bomb 방지 — sharp `limitInputPixels: 40M`
- AES-256-GCM으로 개인정보(이름·전화번호) 암호화 저장
- Path Traversal 방지 — 이미지 키 패턴 검증
- IP 기반 Rate Limiting (인메모리) — 로그인 10회/15분, 회원가입 5회/10분
- CSP · X-Frame-Options · X-Content-Type-Options 등 보안 헤더
- master/manager role 기반 어드민 접근 제어
- bcryptjs 비밀번호 해싱 (salt rounds: 12)

---

## API 구성

- 인증 API — 회원가입, 로그인, 온보딩
- 상품 API — 목록 조회, 상세 조회, 검색, CRUD
- 북마크 API — 북마크 토글, 목록 조회
- 매거진 API — 발행 콘텐츠 조회, 관리자 CRUD
- 이미지 업로드 API — Hero 이미지 / 상품 이미지 / 매거진 이미지 관리 (R2 연동)
- 관리자 API — 로그인, 계정 관리, 회원 조회, 통계

---

## 배포 환경

- **서버**: iwinv VPS (Ubuntu)
- **웹서버**: Nginx (리버스 프록시)
- **프로세스 관리**: PM2
- **DB**: PostgreSQL 18 (로컬 설치)
- **이미지**: Cloudflare R2 (S3 호환)
- **빌드**: Next.js standalone 모드
- **CI/CD**: GitHub Actions → SSH → 자동 빌드 및 배포

---

<details>
<summary><strong>개발하면서 겪은 문제들 (클릭해서 펼치기)</strong></summary>

### 01. npm 패키지 재설치 후 관리자 페이지가 아무 반응 없이 멈췄습니다

**발견** `node_modules` 삭제 후 재설치 시 `/admin` 접근이 브라우저 무한 대기 상태. 에러 메시지도, 터미널 로그도 없음

**원인** `proxy.ts`(미들웨어)가 `/admin` 경로 처리 시 NextAuth를 초기화하는데, `auth.config.ts`에 크리덴셜 없는 Apple OAuth 프로바이더가 등록되어 초기화 중 멈춤

**해결** Apple 프로바이더 제거, Google OAuth만 유지. 설정하지 않은 프로바이더가 아무 에러 없이 무응답을 만들 수 있다는 것을 확인

---

</details>
