import { resend } from '@/lib/resend'
import { ReactElement } from 'react'

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  // Resend requires a verified domain. Until your domain is verified,
  // use onboarding@resend.dev (only sends to the Resend account owner's email).
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, react })
    if (error) {
      console.error('Email send error:', JSON.stringify(error))
    } else {
      console.log('Email sent:', data?.id, '→', to)
    }
  } catch (e) {
    console.error('sendEmail exception:', e)
  }
}
