#!/bin/bash
# 점검 모드 끄기 — 서버에서 실행
set -e
rm -f /var/www/hypepig/maintenance.flag
echo "점검 모드 OFF — 사이트가 다시 정상 노출돼요."
