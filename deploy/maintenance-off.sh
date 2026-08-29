#!/bin/bash
# 점검 모드 끄기 — 서버에서 실행
set -e
rm -f /var/www/hypepig/maintenance.flag
rm -f /var/www/hypepig/maintenance-end.txt
echo "점검 모드 OFF"
