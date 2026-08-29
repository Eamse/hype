#!/bin/bash
# 점검 모드 켜기 — 서버에서 실행 (예: ssh로 접속 후 bash deploy/maintenance-on.sh [분])
# 플래그 파일만 만들면 nginx가 곧바로 점검 페이지로 응답을 바꿈 (reload 불필요)
#
# 인자로 예상 점검 시간(분)을 줄 수 있음 — 점검 페이지의 카운트다운에 사용됨
# 예: bash deploy/maintenance-on.sh 5   → 5분짜리 카운트다운
#     bash deploy/maintenance-on.sh     → 인자 없으면 카운트다운 없이 "점검 중" 안내만
# 이 스크립트는 배포 파이프라인(set -e) 안에서 호출되는데, nginx 점검 모드
# 설정이 아직 안 돼있는 서버(/var/www/hypepig 생성 권한 없음 등)에서 여기가
# 실패하면 배포 전체가 막혀버림 — 그래서 실패해도 항상 exit 0으로 끝냄
if ! mkdir -p /var/www/hypepig 2>/dev/null; then
  echo "⚠️  /var/www/hypepig 생성 실패 — 점검 모드 nginx 설정이 안 돼있는 것 같아요. 건너뜁니다."
  exit 0
fi

MINUTES="${1:-}"
if [ -n "$MINUTES" ]; then
  END_EPOCH=$(($(date +%s) + MINUTES * 60))
  echo "$END_EPOCH" > /var/www/hypepig/maintenance-end.txt
  echo "점검 모드 ON — ${MINUTES}분 카운트다운으로 점검 페이지가 보임."
else
  rm -f /var/www/hypepig/maintenance-end.txt
  echo "점검 모드 ON"
fi

touch /var/www/hypepig/maintenance.flag || echo "점검 플래그 생성 실패 — 무시하고 배포 계속 진행"
