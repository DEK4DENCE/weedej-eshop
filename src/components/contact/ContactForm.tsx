'use client'
import { useState } from 'react'

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
      if (res.ok) { setSuccess(true); form.reset() }
      else { const j = await res.json(); setError(j.error || 'Nastala chyba') }
    } catch { setError('Nepodařilo se odeslat zprávu') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="p-6 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-center">
      <p className="text-2xl mb-2">✓</p>
      <p className="font-semibold">Zpráva odeslána!</p>
      <p className="text-sm mt-1 text-[#4CAF50]">Ozveme se vám co nejdříve.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wider">Jméno *</label>
          <input name="name" type="text" required placeholder="Vaše jméno" className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] text-[#212121] text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wider">E-mail *</label>
          <input name="email" type="email" required placeholder="vas@email.cz" className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] text-[#212121] text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wider">Telefon</label>
        <input name="phone" type="tel" placeholder="+420 000 000 000" className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] text-[#212121] text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wider">Zpráva *</label>
        <textarea name="message" required rows={5} placeholder="Popište váš dotaz..." className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] text-[#212121] text-sm outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all resize-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
        {loading ? 'Odesílám...' : 'Odeslat zprávu'}
      </button>
    </form>
  )
}
