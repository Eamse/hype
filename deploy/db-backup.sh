#!/bin/bash
# DB 백업 — 서버 cron으로 매일 실행
# .env의 DATABASE_URL을 그대로 읽어서 pg_dump, 30일 지난 백업은 자동 삭제
set -e

BACKUP_DIR=/root/db-backups
mkdir -p "$BACKUP_DIR"

DATABASE_URL=$(grep -oP '(?<=DATABASE_URL=").*(?=")' /root/hypepig/.env)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump "$DATABASE_URL" > "$BACKUP_DIR/hypewedding_$TIMESTAMP.sql"

# 30일 지난 백업 파일 정리
find "$BACKUP_DIR" -name "hypewedding_*.sql" -mtime +30 -delete

echo "[$TIMESTAMP] 백업 완료: $BACKUP_DIR/hypewedding_$TIMESTAMP.sql"
