/**
 * DB-backed sliding-window rate limiter using the Setting model.
 *
 * Why not in-memory? Serverless runtimes (Vercel) spin up a fresh process
 * per cold start, so a Map<> resets on every deploy / new instance — making
 * the limit completely ineffective across concurrent instances.
 *
 * Trade-off: one DB read + one upsert per checked request.  For high-traffic
 * endpoints consider replacing with Upstash Redis (@upstash/ratelimit).
 *
 * Key format stored in Setting: `rl:{key}`
 * Value format: JSON array of timestamps (ms) within the current window.
 */

import { db } from './db'

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now()
  const settingKey = `rl:${key}`

  try {
    // Read current timestamps for this key
    const record = await db.setting.findUnique({ where: { key: settingKey } })
    const timestamps: number[] = record ? JSON.parse(record.value) : []

    // Sliding window: keep only timestamps within the current window
    const windowStart = now - windowMs
    const recent = timestamps.filter((t) => t >= windowStart)

    if (recent.length >= maxRequests) {
      // Oldest timestamp in window tells us when the slot frees up
      const oldestInWindow = recent[0]
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000)
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) }
    }

    // Add current timestamp and persist
    recent.push(now)
    await db.setting.upsert({
      where: { key: settingKey },
      create: { key: settingKey, value: JSON.stringify(recent) },
      update: { value: JSON.stringify(recent) },
    })

    return { allowed: true }
  } catch (err) {
    // On DB error, fail open — do not block legitimate traffic
    console.error('[rateLimit] DB error, failing open:', err)
    return { allowed: true }
  }
}
