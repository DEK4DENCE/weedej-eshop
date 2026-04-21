import { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Kontakt — Weedej' }

export default function ContactPage() {
  const hours = [
    { day: 'Pondělí',  time: '11:00 – 19:00' },
    { day: 'Úterý',    time: '11:00 – 19:00' },
    { day: 'Středa',   time: '11:00 – 19:00' },
    { day: 'Čtvrtek',  time: '11:00 – 19:00' },
    { day: 'Pátek',    time: '11:00 – 19:00' },
    { day: 'Sobota',   time: '11:00 – 17:00' },
    { day: 'Neděle',   time: 'Zavřeno' },
  ]
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#E8F5E9] text-[#2E7D32] mb-4">Spojte se s námi</span>
          <h1 className="text-4xl font-bold text-[#212121] mb-4">Kontakt</h1>
          <p className="text-[#6B7280] max-w-xl mx-auto">Jsme tu pro vás. Navštivte nás v prodejně nebo nám napište.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-[#DEE2E6] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#212121] mb-6">Napište nám</h2>
            <ContactForm />
          </div>

          {/* Info + Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DEE2E6] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><MapPin className="w-5 h-5 text-[#2E7D32]" /></div>
                <div><p className="text-xs text-[#6B7280] uppercase tracking-wider">Adresa</p><p className="font-semibold text-[#212121]">Benešovská 432/3, 405 02 Děčín 2</p></div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><Phone className="w-5 h-5 text-[#2E7D32]" /></div>
                <div><p className="text-xs text-[#6B7280] uppercase tracking-wider">Telefon</p><a href="tel:+420792342324" className="font-semibold text-[#2E7D32] hover:text-[#1B5E20]">+420 792 342 324</a></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><Mail className="w-5 h-5 text-[#2E7D32]" /></div>
                <div><p className="text-xs text-[#6B7280] uppercase tracking-wider">E-mail</p><a href="mailto:info@weedej.cz" className="font-semibold text-[#2E7D32] hover:text-[#1B5E20]">info@weedej.cz</a></div>
              </div>
            </div>

            {/* Map */}
            <a
              href="https://www.google.com/maps/place/Bene%C5%A1ovsk%C3%A1+432%2F3,+405+02+D%C4%9B%C4%8D%C3%ADn+2"
              target="_blank" rel="noopener noreferrer"
              className="rounded-2xl overflow-hidden border border-[#DEE2E6] shadow-sm block group"
            >
              <div className="relative w-full h-[260px]">
                <Image
                  src="/locationmap.png"
                  alt="Mapa — Weedej, Benešovská 432/3, Děčín"
                  fill
                  className="object-cover object-center group-hover:brightness-90 transition-all duration-200"
                />
              </div>
              <div className="text-center text-xs text-[#2E7D32] hover:text-[#1B5E20] py-2 bg-[#F8F9FA] transition-colors">
                Otevřít v Google Maps →
              </div>
            </a>
          </div>
        </div>

        {/* Opening hours + info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#DEE2E6] p-6 shadow-sm md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><Clock className="w-5 h-5 text-[#2E7D32]" /></div>
              <h3 className="font-bold text-[#212121]">Otevírací doba</h3>
            </div>
            <div className="space-y-2">
              {hours.map(h => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">{h.day}</span>
                  <span className={`font-medium ${h.time === 'Zavřeno' ? 'text-red-500' : 'text-[#212121]'}`}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#2E7D32] rounded-2xl p-6 shadow-sm text-white md:col-span-2 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">Prémiové produkty</h3>
            <p className="text-green-100 mb-4">Navštivte naši prodejnu v Děčíně a nechte se poradit s výběrem produktů.</p>
            <a href="/products" className="inline-flex items-center gap-2 bg-white text-[#2E7D32] font-bold px-6 py-3 rounded-xl w-fit hover:bg-[#E8F5E9] transition-colors">
              Prohlédnout produkty →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
