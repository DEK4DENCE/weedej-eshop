import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send'
import React from 'react'

/** Strip CR/LF characters to prevent email header injection */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json()
    if (!name || !email || !message) return NextResponse.json({ error: 'Vyplňte povinná pole' }, { status: 400 })
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Neplatné jméno' }, { status: 400 })
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Neplatná e-mailová adresa' }, { status: 400 })
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
      return NextResponse.json({ error: 'Zpráva musí mít 10–5000 znaků' }, { status: 400 })
    }

    const safeName = sanitizeHeader(name)
    const safeEmail = sanitizeHeader(email)

    const adminEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    await sendEmail({
      to: adminEmail,
      subject: sanitizeHeader(`Nová zpráva z kontaktního formuláře — ${safeName}`),
      emailType: 'contactForm',
      react: React.createElement('div', null,
        React.createElement('h2', null, `Zpráva od: ${safeName}`),
        React.createElement('p', null, `Email: ${safeEmail}`),
        phone ? React.createElement('p', null, `Telefon: ${sanitizeHeader(String(phone))}`) : null,
        React.createElement('hr', null),
        React.createElement('p', null, message)
      )
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    console.error('Contact form error:', e)
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 })
  }
}
