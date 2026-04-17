#!/usr/bin/env bash
# Database backup script — run via cron or CI.
# Requires: pg_dump, DATABASE_URL env var, optional BACKUP_DEST dir.
# Usage: DATABASE_URL=postgres://... ./scripts/db-backup.sh

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi

BACKUP_DEST="${BACKUP_DEST:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DEST}/weedej_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DEST"

echo "[Backup] Dumping database to ${FILENAME}..."
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$FILENAME"
echo "[Backup] Done: ${FILENAME} ($(du -sh "$FILENAME" | cut -f1))"

# Retain last 30 backups, delete older ones
ls -t "${BACKUP_DEST}"/weedej_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
echo "[Backup] Cleanup complete (kept last 30)."
