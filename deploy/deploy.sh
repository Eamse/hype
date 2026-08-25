#!/bin/bash
# 배포 스크립트 — 서버에서 실행 (예: ssh hype 접속 후 bash /root/hypepig/deploy/deploy.sh)
set -e

cd /root/hypepig

echo "0) 점검 모드 켜기"
bash deploy/maintenance-on.sh

echo "1) 최신 코드 받기"
git pull

echo "2) 의존성 설치"
npm install

echo "3) DB 스키마 반영"
npx prisma db push

echo "3.5) 이전 이미지 캐시 백업 (매 빌드마다 .next/standalone이 새로 생성되면서
#      리사이즈된 이미지 캐시가 사라져, 배포할 때마다 콜드 캐시를 반복하던 문제 방지)"
if [ -d .next/standalone/.next/cache/images ]; then
  rm -rf /tmp/next-image-cache-backup
  cp -r .next/standalone/.next/cache/images /tmp/next-image-cache-backup
fi

echo "4) 빌드"
NODE_OPTIONS="--max-old-space-size=3072" npm run build

echo "5) standalone 폴더에 static/public/env 반영"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp .env .next/standalone/.env

echo "5.5) 이미지 캐시 복원"
if [ -d /tmp/next-image-cache-backup ]; then
  mkdir -p .next/standalone/.next/cache
  cp -r /tmp/next-image-cache-backup .next/standalone/.next/cache/images
  rm -rf /tmp/next-image-cache-backup
fi

echo "6) 앱 재시작"
pm2 restart hypepig

echo "7) 점검 모드 끄기"
bash deploy/maintenance-off.sh

echo "배포 완료"
