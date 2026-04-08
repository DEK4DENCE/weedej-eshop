import { resend } from '@/lib/resend'
import { ReactElement } from 'react'

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      react,
    })
    if (error) {
      console.error('Email send error:', error)
    }
  } catch (e) {
    console.error('sendEmail error:', e)
  }
}
