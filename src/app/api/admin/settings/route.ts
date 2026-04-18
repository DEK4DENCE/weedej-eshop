import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { invalidateEmailSettingsCache } from "@/lib/email/send"
import { encryptSetting, decryptSetting, SENSITIVE_SETTING_KEYS } from "@/lib/encrypt"
import { logAdminAction } from "@/lib/audit"
import { z } from "zod"
export const dynamic = 'force-dynamic'

// Each setting value must be a string; keys are validated against an allowlist
// to prevent mass-assignment of arbitrary DB keys.
const ALLOWED_SETTING_KEYS = new Set([
  "erpApiUrl", "erpApiKey", "resendApiKey", "resendFromEmail",
  "orderNotificationEmail", "stripePublishableKey", "stripeSecretKey",
  "stripeWebhookSecret", "erpWebhookSecret", "shopName", "shopEmail",
  "shopPhone", "shopAddress", "shopCity", "shopPostalCode", "shopCountry",
  "vatNumber", "businessId", "bankAccount", "bankIban",
])

const settingsBodySchema = z.record(z.string(), z.string().max(2048))

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const settings = await db.setting.findMany()
  // SECURITY-5: Decrypt sensitive values before returning to admin UI
  const map = Object.fromEntries(
    settings.map((s) => [s.key, SENSITIVE_SETTING_KEYS.has(s.key) ? decryptSetting(s.value) : s.value])
  )
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const rawBody = await req.json()
  const parsed = settingsBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body", issues: parsed.error.flatten() }, { status: 400 })
  }

  // Drop any keys not in the allowlist to prevent mass-assignment
  const updates = Object.entries(parsed.data).filter(([key]) => ALLOWED_SETTING_KEYS.has(key))

  // SECURITY-5: Encrypt sensitive credentials before persisting
  await Promise.all(
    updates.map(([key, value]) => {
      const storedValue = SENSITIVE_SETTING_KEYS.has(key) ? encryptSetting(value) : value
      return db.setting.upsert({
        where: { key },
        update: { value: storedValue },
        create: { key, value: storedValue },
      })
    })
  )

  invalidateEmailSettingsCache()

  // Redact sensitive keys from audit log — only record which keys were changed, not their values
  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "UPDATE_SETTINGS",
    entityType: "Setting",
    entityId:   "global",
    newValue:   { keys: updates.map(([key]) => key) },
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  return NextResponse.json({ ok: true })
}
