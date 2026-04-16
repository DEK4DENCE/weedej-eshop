import { resend } from '@/lib/resend'
import { ReactElement } from 'react'

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
  attachments?: EmailAttachment[]
}

export async function sendEmail({ to, subject, react, attachments }: SendEmailOptions) {
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@weedej.cz'
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content:  a.content,   // Resend accepts base64 string
      })),
    })
    if (error) {
      console.error('Email send error:', JSON.stringify(error))
    } else {
      console.log('Email sent:', data?.id, '→', to)
    }
  } catch (e) {
    console.error('sendEmail exception:', e)
  }
}
