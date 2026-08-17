#!/bin/bash
# 점검 모드 켜기 — 서버에서 실행 (예: ssh로 접속 후 bash deploy/maintenance-on.sh)
# 플래그 파일만 만들면 nginx가 곧바로 점검 페이지로 응답을 바꿈 (reload 불필요)
set -e
touch /var/www/hypepig/maintenance.flag
echo "점검 모드 ON — 이제 사이트 접속 시 점검 페이지가 보여요."
