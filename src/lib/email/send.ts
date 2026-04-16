import { resend } from '@/lib/resend'
import { ReactElement } from 'react'
import { db } from '@/lib/db'

export type EmailType =
  | 'registration'
  | 'orderConfirmation'
  | 'orderShipped'
  | 'orderDelivered'
  | 'orderCancelled'
  | 'forgotPassword'
  | 'contactForm'

interface EmailAttachment {
  filename:    string
  content:     string   // base64-encoded
  contentType: string
  encoding:    'base64'
}

interface SendEmailOptions {
  to:          string
  subject:     string
  react:       ReactElement
  emailType?:  EmailType
  attachments?: EmailAttachment[]
}

// Simple in-memory cache for email settings (60s TTL)
let settingsCache: Record<string, string> | null = null
let settingsCacheAt = 0
const CACHE_TTL = 60_000

async function getEmailSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (settingsCache && now - settingsCacheAt < CACHE_TTL) return settingsCache

  try {
    const rows = await db.setting.findMany({
      where: {
        key: {
          in: [
            'emailFromAddress',
            'emailReplyTo',
            'emailEnabled_registration',
            'emailEnabled_orderConfirmation',
            'emailEnabled_orderShipped',
            'emailEnabled_orderDelivered',
            'emailEnabled_orderCancelled',
            'emailEnabled_forgotPassword',
            'emailEnabled_contactForm',
          ],
        },
      },
    })
    settingsCache = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    settingsCacheAt = now
  } catch {
    settingsCache = {}
    settingsCacheAt = now
  }

  return settingsCache!
}

export function invalidateEmailSettingsCache() {
  settingsCache = null
}

export async function sendEmail({ to, subject, react, emailType, attachments }: SendEmailOptions) {
  const settings = await getEmailSettings()

  // Check if this email type is disabled
  if (emailType) {
    const key = `emailEnabled_${emailType}`
    // Default: enabled (only disabled if explicitly set to 'false')
    if (settings[key] === 'false') {
      console.log(`[Email] Skipped (disabled in settings): type=${emailType} to=${to}`)
      return
    }
  }

  // From address: DB setting → env var → fallback
  const from =
    settings.emailFromAddress?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'noreply@weedej.cz'

  const replyTo = settings.emailReplyTo?.trim() || undefined

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(replyTo ? { reply_to: replyTo } : {}),
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content:  a.content,
      })),
    })
    if (error) {
      console.error('Email send error:', JSON.stringify(error))
    } else {
      console.log('Email sent:', data?.id, '→', to, emailType ? `[${emailType}]` : '')
    }
  } catch (e) {
    console.error('sendEmail exception:', e)
  }
}
