#!/bin/bash
# 점검 모드 카운트다운 자동 종료 — 서버 cron으로 1분마다 실행
# maintenance-on.sh [분]으로 종료 예정 시각(maintenance-end.txt)이 저장돼 있을 때만 동작.
# 그 시각이 지나면 maintenance.flag를 지워서 점검 모드를 자동으로 풀어줌.
set -e

END_FILE=/var/www/hypepig/maintenance-end.txt
FLAG_FILE=/var/www/hypepig/maintenance.flag

# 카운트다운 없이 켜둔 점검(인자 없이 maintenance-on.sh 실행)이거나,
# 애초에 점검 모드가 아니면 할 일 없음
[ -f "$END_FILE" ] || exit 0

END_EPOCH=$(cat "$END_FILE")
NOW_EPOCH=$(date +%s)

if [ "$NOW_EPOCH" -ge "$END_EPOCH" ]; then
  rm -f "$FLAG_FILE" "$END_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 점검 모드 카운트다운 종료 — 자동으로 해제됨"
fi
