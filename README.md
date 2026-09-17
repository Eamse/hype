hypewedding.kr
Next.js (App Router) + Prisma + PostgreSQL 기반 hypewedding.kr / HYPE SNAP 웹사이트 & 어드민.

실행
npm install
npm run dev # http://localhost:3000
.env 필요 (레포에 커밋 안 됨, 별도 전달받아야 함): DATABASE_URL, ADMIN_JWT_SECRET, ENCRYPTION_KEY 등. 전체 목록은 HANDOFF.md 참고.

npm run test # vitest
npx tsc --noEmit # 타입체크
npm run lint # eslint

더 자세한 내용
배포 파이프라인, 데이터 모델, 알아둬야 할 함정들은 HANDOFF.md에 정리되어 있습니다.
