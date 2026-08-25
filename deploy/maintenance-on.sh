#!/bin/bash
# 점검 모드 켜기 — 서버에서 실행 (예: ssh로 접속 후 bash deploy/maintenance-on.sh [분])
# 플래그 파일만 만들면 nginx가 곧바로 점검 페이지로 응답을 바꿈 (reload 불필요)
#
# 인자로 예상 점검 시간(분)을 줄 수 있음 — 점검 페이지의 카운트다운에 사용됨
# 예: bash deploy/maintenance-on.sh 5   → 5분짜리 카운트다운
#     bash deploy/maintenance-on.sh     → 인자 없으면 카운트다운 없이 "점검 중" 안내만
set -e
mkdir -p /var/www/hypepig

MINUTES="${1:-}"
if [ -n "$MINUTES" ]; then
  END_EPOCH=$(($(date +%s) + MINUTES * 60))
  echo "$END_EPOCH" > /var/www/hypepig/maintenance-end.txt
  echo "점검 모드 ON — ${MINUTES}분 카운트다운으로 점검 페이지가 보여요."
else
  rm -f /var/www/hypepig/maintenance-end.txt
  echo "점검 모드 ON — 카운트다운 없이 점검 페이지가 보여요."
fi

touch /var/www/hypepig/maintenance.flag
