# Security Audit Report

총 **25개** 취약점 중 **14개 수정 완료** — 미해결 11개

---

## CRITICAL (미해결) <- 이건 나중에 올려놓고 파일 삭제할 거임 그래서 일부로 하드코딩해놓고 나중에 비번 변경하게 둔 거

### C1. 어드민 비밀번호 전부 `qwer1234!!` 로 동일

- **파일:** `.env`
- 마스터 계정 3개 비밀번호가 `qwer1234!!`로 동일. **즉시 변경 필요.**

---

## HIGH (미해결)

### H4. CSP에 `unsafe-inline` 잔존

- **파일:** `next.config.ts`
- `unsafe-eval`은 제거했으나 `unsafe-inline`은 Next.js 구조상 제거 어려움. nonce 기반 CSP로 전환 필요.

### H5. OAuth 토큰 DB에 평문 저장

- **파일:** `prisma/schema.prisma:75-76`
- access_token, refresh_token 암호화 없이 저장.

### H10. 분산 환경에서 인메모리 레이트리미터 우회 가능

- **파일:** `lib/rate-limit.ts`
- Vercel 멀티 인스턴스 환경에서 인스턴스별 카운트 분리. Upstash Redis로 교체 필요.

---

## MEDIUM (미해결)

### M1. CSRF 토큰 없음

- 어드민 로그인/로그아웃 등 POST 요청에 CSRF 보호 없음.

### M3. 타이밍 어택 — 어드민 조회 실패 vs 비밀번호 오류 응답 속도 다름

- **파일:** `app/api/admin/me/password/route.ts:29-36`

---

## LOW (미해결)

### L3. 개인정보(이름, 생년월일, 전화번호) 평문 저장

- **파일:** `prisma/schema.prisma:45-54`

### L6. 어드민 비밀번호 미설정 시 seed 스킵만 하고 경고 없음

- **파일:** `prisma/seed.ts`

---

## 수정 완료 목록

| 항목     | 내용                                                    |
| -------- | ------------------------------------------------------- |
| C2       | `/api/images` GET 인증 추가                             |
| C3       | `types/.env` 삭제                                       |
| H1       | 회원가입 비밀번호 8자 이상 강제                         |
| H2       | 온보딩 전 필드 타입/길이/범위 검증                      |
| H3       | 어드민 로그아웃 인증 추가                               |
| H6       | `admin-auth.ts` role 추출 + `requireMaster()` 추가      |
| H7       | 비밀번호 변경 시 토큰 즉시 만료 (재로그인 강제)         |
| H8+H9    | 이메일 중복 시 동일 응답 반환 (열거 방지 + TOCTOU 해결) |
| H4(일부) | CSP `unsafe-eval` 제거                                  |
| M2       | 어드민 쿠키 `sameSite: strict` 변경                     |
| M6       | 온보딩 입력값 sanitize 추가                             |
| L1       | 파일명 `crypto.randomUUID()` 사용                       |
| L2       | R2 환경변수 미설정 시 즉시 에러                         |
| L5       | 온보딩 레이트리밋 IP 기반 유지 (현재 구조 내 최선)      |
