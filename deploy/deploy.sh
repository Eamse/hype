#!/bin/bash
# 배포 스크립트 — 서버에서 실행 (예: ssh hype 접속 후 bash /root/hypepig/deploy/deploy.sh)
set -e

cd /root/hypepig

echo "1) 최신 코드 받기"
git pull

echo "2) 의존성 설치"
npm install

echo "3) DB 스키마 반영"
npx prisma db push

echo "4) 빌드"
NODE_OPTIONS="--max-old-space-size=3072" npm run build

echo "5) standalone 폴더에 static/public/env 반영"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp .env .next/standalone/.env

echo "6) 앱 재시작"
pm2 restart hypepig

echo "배포 완료"
