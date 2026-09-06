#!/bin/bash
# DB 백업 — 서버 cron으로 매일 실행
# .env의 DATABASE_URL을 그대로 읽어서 pg_dump, 로컬본 30일 지나면 자동 삭제 + R2(오프사이트)에도 업로드
set -e

APP_DIR=/root/hypepig
BACKUP_DIR=/root/db-backups
mkdir -p "$BACKUP_DIR"

DATABASE_URL=$(grep -oP '(?<=DATABASE_URL=").*(?=")' "$APP_DIR/.env")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/hypewedding_$TIMESTAMP.sql"

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# 30일 지난 로컬 백업 파일 정리 (R2에는 별도 보관되므로 로컬은 최근 것만 유지)
find "$BACKUP_DIR" -name "hypewedding_*.sql" -mtime +30 -delete

echo "[$TIMESTAMP] 로컬 백업 완료: $BACKUP_FILE"

# R2(private 버킷)에도 업로드 — 서버 디스크 손상 등에 대비한 오프사이트 백업
export R2_BACKUP_BUCKET=$(grep -oP '(?<=R2_BACKUP_BUCKET=).*' "$APP_DIR/.env")
export R2_BACKUP_ENDPOINT=$(grep -oP '(?<=R2_BACKUP_ENDPOINT=).*' "$APP_DIR/.env")
export R2_BACKUP_ACCESS_KEY_ID=$(grep -oP '(?<=R2_BACKUP_ACCESS_KEY_ID=).*' "$APP_DIR/.env")
export R2_BACKUP_SECRET_ACCESS_KEY=$(grep -oP '(?<=R2_BACKUP_SECRET_ACCESS_KEY=).*' "$APP_DIR/.env")

node "$APP_DIR/deploy/upload-backup-to-r2.mjs" "$BACKUP_FILE"
