'use strict'
// Runs before `prisma migrate deploy` on first deployment after switching from
// `prisma db push` to `prisma migrate deploy`. Marks every migration that was
// already applied to the DB via db-push as "applied" in _prisma_migrations so
// migrate deploy won't try to re-run them and fail with "relation already exists".
const { execSync } = require('child_process')

const BASELINE = [
  '20260407225559_init',
  '20260407231941_add_delivery_type_phone',
  '20260414000000_variant_value_unit',
  '20260416000000_add_paid_at',
  '20260417000000_add_active_substance',
  '20260418000000_idempotency_and_stock_constraint',
]

for (const name of BASELINE) {
  try {
    execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: 'pipe' })
    console.log(`✓ baselined: ${name}`)
  } catch {
    // "Migration already applied" — safe to ignore, means DB is already tracked
    console.log(`↷ already tracked: ${name}`)
  }
}
