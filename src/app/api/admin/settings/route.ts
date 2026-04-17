import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { invalidateEmailSettingsCache } from "@/lib/email/send"
import { encryptSetting, decryptSetting, SENSITIVE_SETTING_KEYS } from "@/lib/encrypt"

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

  const body = await req.json()
  const updates = Object.entries(body as Record<string, string>)

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
  return NextResponse.json({ ok: true })
}
