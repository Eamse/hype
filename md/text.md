Hype Wedding 홈페이지
폰트 스케일 브레이크포인트 전환 + 전체 통합 스펙 (v3)
작성일: 2026-08-30 (v2 대비 변경: 3단계 브레이크포인트 확정, Giant Stat 실사용처 확인)

0. v2 → v3 변경 요약 (부록 질문 결론)

- 브레이크포인트: 2단계(모바일/데스크탑) → **3단계(모바일/태블릿/데스크탑)로 확정**
- Giant Stat(44px/96px) 토큰: "적용 대상 없음(예비)" → **실사용처 확인됨**. About Us > Achievement 섹션(`stats-bar.tsx`)의 통계 숫자 4개(70+/16/116%/2025)가 여기 해당. 현재 Tailwind `text-5xl md:text-6xl`(48px/60px 고정 2단계)로 되어있는데, 이번 통합 스케일 적용 시 이 컴포넌트도 같이 맞춤
- 적용 범위: **전체 페이지 한 번에 일괄 적용** (페이지별 분할 PR 아님)
- 태블릿 값은 모바일/데스크탑 중간값으로 초안 작성 — 아래 표 검토 후 확정

1. 최종 통합 타입 스케일 — 브레이크포인트 고정값 (3단계)

| 역할                       | 모바일 (≤767px) | 태블릿 (768~1024px) | 데스크탑 (≥1025px) | 비고                                              |
| -------------------------- | --------------- | ------------------- | ------------------ | ------------------------------------------------- |
| 1. Hero Display            | 46px            | 64px                | 84px               | 페이지 최상단 메인 타이틀                         |
| 2. Section Header          | 32px            | 42px                | 52px               | 페이지 내 개별 섹션 타이틀                        |
| 3. Giant Stat              | 44px            | 68px                | 96px               | 통계 숫자 전용 — StatsBar 70+/16/116%/2025에 적용 |
| 4. Sub-headline            | 20px            | 36px                | 53px               | 섹션 내 중간 헤드라인                             |
| 5. Eyebrow / Chapter Label | 24px            | 30px                | 37px               | 캡스 라벨                                         |
| 6. Section Number          | 20px            | 24px                | 28px               | 01/02/03... — 기존과 동일                         |
| 7. Body — Large            | 20px            | 27px                | 34px               | 인용구, 강조 바디                                 |
| 8. Body                    | 16px            | 20px                | 25px               | 일반 본문                                         |
| 9. Caption / Small Label   | 14px            | 16px                | 18px               | 버튼, 배지, 캡션                                  |

※ 태블릿 열은 모바일/데스크탑의 대략적인 중간값으로 초안 작성한 것 — 실제 화면에서 확인 후 조정 필요.

조정 사항 — Giant Stat 범위 축소 (v2에서 확정)
What We Offer의 "Photographers / Transparency / On-Day Support / All-Inclusive"는 기존 clamp(44px, 6vw, 96px)로 통계 숫자와 같은 크기였는데, 실제로는 통계 숫자가 아니라 섹션 강조 단어라 너무 큽니다. 이 4개 텍스트는 "3. Giant Stat"에서 빼서 "4. Sub-headline"(20px/36px/53px)으로 재분류했습니다.

Giant Stat 실사용처 (v3에서 확정)
`app/about/_components/stats-bar.tsx` — About Us > Achievement 섹션의 통계 숫자 4개:

- 70+ (Couples), 16 (Countries), 116% (Year-over-year revenue growth), 2025 (est, 설립연도)
- 현재: Tailwind `text-5xl md:text-6xl` (48px 모바일 / 60px 데스크탑, 고정 2단계, 이 문서의 통합 스케일과 별개로 관리되고 있었음)
- 변경 후: 44px / 68px / 96px (Giant Stat 역할로 통합)

2. 페이지별 적용 매핑

About Us
| 요소 | 기존 값 (clamp) | 새 값 (모바일/태블릿/데스크탑) | 매핑 역할 |
|---|---|---|---|
| Your story deserves... 등 4개 헤드라인 | clamp(46,2.5vw,80) | 46 / 64 / 84px | Hero Display |
| 섹션 번호 01~05 | clamp(20,1.7vw,28) | 20 / 24 / 28px | Section Number |
| ABOUT US 등 챕터 라벨 5개 | clamp(20,2.5vw,33) | 24 / 30 / 37px | Eyebrow |
| 본문 장문 5개 | clamp(15,2vw,25) | 16 / 20 / 25px | Body |
| The Korean Edit 등 서브헤드라인 4개 | clamp(20,4.2vw,53) | 20 / 36 / 53px | Sub-headline |
| 본문 단문 4개 (기존 반응형 버그) | clamp(20,0.8vw,41) | 16 / 20 / 25px | Body (버그 수정 겸 통합) |
| "Bringing Korea's finest..." | clamp(17,2.5vw,37) | 20 / 27 / 34px | Body Large |
| "What if I could connect..." 블록쿼트 | clamp(23,2.05vw,34) | 20 / 27 / 34px | Body Large |
| Co-founder 캡션 | clamp(13,1vw,16) | 14 / 16 / 18px | Caption |
| THE GOAL | clamp(31,2.9vw,48) | 32 / 42 / 52px | Section Header |
| "Top Korean artists..." | clamp(25,2.35vw,40) | 20 / 27 / 34px | Body Large |
| Four principles... | clamp(15,1.5vw,20) | 14 / 16 / 18px | Caption |
| "From a single photo shoot..." (기존 버그) | clamp(17,1.4vw,17) | 16 / 20 / 25px | Body (버그 수정 겸 통합) |
| **70+ / 16 / 116% / 2025 (Achievement 통계 숫자, 신규 편입)** | Tailwind text-5xl md:text-6xl | **44 / 68 / 96px** | **Giant Stat** |

What We Offer
| 요소 | 기존 값 (clamp) | 새 값 (모바일/태블릿/데스크탑) | 매핑 역할 |
|---|---|---|---|
| 섹션 번호 01~03 | clamp(20,1.7vw,28) | 20 / 24 / 28px | Section Number |
| WHY HYPE WEDDING? / SERVICE DETAILS | clamp(28,2.5vw,41) | 24 / 30 / 37px | Eyebrow |
| What makes us different / Our Service / Shoot Schedule | clamp(46,5vw,84) | 46 / 64 / 84px | Hero Display |
| Photographers / Transparency / On-Day Support / All-Inclusive | clamp(44,6vw,96) | 20 / 36 / 53px | Sub-headline (조정됨) |
| 본문 4개 | clamp(16,1.6vw,24) | 16 / 20 / 25px | Body |
| Photography/Styling/Support/Add-ons | clamp(20,1.7vw,26) | 변경 없음 (컴포넌트 전용) | 9개 역할 밖 — 부록 참고 |
| Before the Shoot/The Day Before/Shoot Day | clamp(20,1.8vw,26) | 변경 없음 (컴포넌트 전용) | 9개 역할 밖 — 부록 참고 |
| Shoot day timeline | clamp(22,3.5vw,49) | 32 / 42 / 52px | Section Header |
| 고정 micro 텍스트 전체 (12~15px) | 고정값 | 변경 없음 | Micro — 그대로 유지 |

Inquiry (Inquiry / Booking Process)ㄴㅁㅇ
| 요소 | 기존 값 | 새 값 (모바일/태블릿/데스크탑) | 매핑 역할 |
|---|---|---|---|
| Start your Inquiry | clamp(32,4.2vw,56) | 32 / 42 / 52px | Section Header |
| Inquiry 서브카피 | clamp(14,1.1vw,16) | 16 / 20 / 25px | Body |
| YOUR NEXT STEP | 12px 고정 | 변경 없음 | Micro — 그대로 유지 |
| HYPE WEDDING/SNAP 버튼 | 14px 고정 | 14 / 16 / 18px | Caption |
| How to book your slot | clamp(32,4.2vw,56) | 32 / 42 / 52px | Section Header |
| 7단계 타이틀 | clamp(15,1.2vw,18) | 14 / 16 / 18px | Caption |
| 7단계 설명, LET'S GET STARTED!, Secure Date, 단계 번호 | 12~14px 고정/clamp | 변경 없음 | Micro — 그대로 유지 |
| Inquiry Now 버튼 | 16px 고정 | 14 / 16 / 18px | Caption |

FAQ
FAQ는 이미 브레이크포인트 고정값 방식(52/72px 등 자체 값)이라 전환 자체는 필요 없습니다. 통합 여부만 선택하면 됩니다.

- FAQ 타이틀(52px/72px) — 통합 시 Hero Display(46/64/84px)로 흡수 가능, 다만 폰트 굵기/자간이 달라서 그대로 유지 권장
- Q(22px)/A(18px)/탭(16px)/Search(14px) — 9개 역할 밖 컴포넌트, 변경 없음

Partnership (Business Collaboration)
| 요소 | 기존 값 | 새 값 (모바일/태블릿/데스크탑) | 매핑 역할 |
|---|---|---|---|
| EN 섹션 소제목 4개 | clamp(32,4vw,52) | 32 / 42 / 52px | Section Header (정확히 일치) |
| KR 섹션 소제목 4개 | clamp(20,2.3vw,28) | 변경 없음 (국문 전용 유지) | 9개 역할 밖 — 국문 병기 규칙 |
| 히어로 EN "Business Collaboration" | clamp(44,5.2vw,72) | 46 / 64 / 84px | Hero Display |
| 히어로 KR "비즈니스 협업" | clamp(25,3vw,36) | 변경 없음 (국문 전용 유지) | 9개 역할 밖 |
| EN 히어로 소개글 | clamp(17,1.4vw,20) | 16 / 20 / 25px | Body |
| KR 히어로 소개글 외 국문 바디 | clamp(15,1.2vw,17) | 변경 없음 (국문 전용 유지) | 9개 역할 밖 |
| 부킹프로세스 EN 타이틀 4개 | clamp(18,1.5vw,20) | 14 / 16 / 18px | Caption |
| 부킹프로세스 KR 타이틀 4개 | clamp(15,1.2vw,16) | 변경 없음 (국문 전용 유지) | 9개 역할 밖 |
| 섹션 라벨 13px, 브로슈어 버튼 18px/14px, contact 17px 등 | 고정값 | 14 / 16 / 18px | Caption (근접 통합) |

3. 9개 역할 밖 — 그대로 유지하는 요소
   아래는 편집형 콘텐츠 스케일이 아니라 UI 컴포넌트 성격이 강해 9개 역할로 통합하지 않고 그대로 유지할 것을 권장하는 항목입니다.

- 헤더/푸터 전체 (로고 16px/13px, 네비 14px, 약관 12px, 사업자정보 11px) — 브랜드 UI 크롬, 편집 콘텐츠와 별개
- Home 히어로 CTA(12px), Photographers 섹션 타이틀(16px), Editorial 미리보기 일체(10~30px) — Home 전용 컴포넌트
- Service-Package 페이지 전체 (16px/14px) — 상품 카드 컴포넌트
- Editorial(/magazine) 페이지 전체 — 이미 자체 브레이크포인트 체계(40px/28px) 보유, 카드·라벨류도 별도 유지
- What We Offer의 카드 타이틀 2종(Photography/Styling/Support/Add-ons, Before the Shoot 등) — 20~26px 범위의 컴포넌트 전용 타이틀, 9개 역할과 크기가 겹치지 않아 별도 유지
- 국문 병기 텍스트 전체(Partnership 페이지) — 영문 대비 한 단계 작게 유지하는 기존 규칙 그대로

4. 부록 — 확인 필요 사항 (v3 기준 잔여 항목)

- 태블릙 값(중간값 초안)이 실제 화면에서 자연스러운지 검토 필요 — 특히 Hero Display(64px), Giant Stat(68px) 구간
- clamp() → 고정값 전환은 코드 레벨에서 전체 CSS 리팩터링이 필요한 작업 — 전체 페이지 일괄 적용으로 확정됐으므로, 작업 시작 전 영향 범위(globals.css 전체 + 컴포넌트 파일 다수) 최종 확인
- StatsBar(`stats-bar.tsx`)는 Tailwind 유틸리티 클래스(`text-5xl md:text-6xl`) 기반이라, 다른 페이지(인라인 style/CSS 클래스)와 전환 방식이 다름 — 별도로 처리 필요
