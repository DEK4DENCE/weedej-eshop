import type { Metadata } from "next"
import { Truck, CreditCard, Package, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Doprava a platba — Weedej",
  description: "Informace o možnostech doručení a platbách v Weedej. Dopravujeme diskrétně po celé ČR.",
  alternates: { canonical: 'https://weedej.cz/doprava' },
  openGraph: {
    title: "Doprava a platba — Weedej",
    description: "Informace o možnostech doručení a platbách v Weedej. Dopravujeme diskrétně po celé ČR.",
    url: 'https://weedej.cz/doprava',
    locale: 'cs_CZ',
  },
}

function formatPrice(price: number): string {
  if (price === 0) return "Zdarma"
  return `${price.toLocaleString("cs-CZ")} Kč`
}

export default async function DopravaPage() {
  const shippingMethods = await db.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-2">Informace</p>
      <h1 className="text-3xl font-bold font-playfair text-[#1d1d1f] mb-2">Doprava a platba</h1>
      <p className="text-[#6e6e73] mb-10">Doručujeme diskrétně po celé České republiky.</p>

      {/* Shipping */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Truck className="h-5 w-5 text-[#2E7D32]" />
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Možnosti dopravy</h2>
        </div>
        <div className="grid gap-4">
          {shippingMethods.map((method) => {
            const price = Number(method.price)
            const freeThreshold = method.freeThreshold ? Number(method.freeThreshold) : null
            const isFree = price === 0

            return (
              <div
                key={method.id}
                className={`flex items-start justify-between p-4 rounded-2xl border ${
                  isFree
                    ? "border-[#2E7D32] bg-[#E8F5E9]"
                    : "border-[#DEE2E6] bg-white"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-[#1d1d1f]">{method.name}</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">{method.description}</p>
                  {freeThreshold && freeThreshold > 0 && !isFree && (
                    <p className="text-xs text-[#2E7D32] mt-0.5">
                      Zdarma při objednávce nad {freeThreshold.toLocaleString("cs-CZ")} Kč
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="h-3 w-3 text-[#aeaeb2]" />
                    <span className="text-xs text-[#aeaeb2]">{method.estimatedDays}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold font-mono shrink-0 ml-4 ${isFree ? "text-[#2E7D32]" : "text-[#8B6914]"}`}>
                  {formatPrice(price)}
                </span>
              </div>
            )
          })}

          {shippingMethods.length === 0 && (
            <p className="text-sm text-[#6e6e73]">Momentálně nejsou dostupné žádné způsoby dopravy.</p>
          )}
        </div>
      </section>

      {/* Discretion */}
      <section className="mb-10 bg-[#F8F9FA] rounded-2xl p-5 border border-[#DEE2E6]">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-[#2E7D32]" />
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Diskrétní balení</h2>
        </div>
        <p className="text-sm text-[#6e6e73]">
          Každá zásilka je balena do neutrálního obalu bez jakéhokoli označení obsahu nebo loga e-shopu.
          Na zásilce je uvedena pouze adresa odesílatele a příjemce. Obsah zásilky je plně diskrétní.
        </p>
      </section>

      {/* Payment */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="h-5 w-5 text-[#2E7D32]" />
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Způsoby platby</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Platební karta", desc: "Visa, Mastercard", icon: "💳" },
            { name: "Apple Pay", desc: "Rychlá platba na iOS", icon: "" },
            { name: "Google Pay", desc: "Rychlá platba na Android", icon: "🤖" },
            { name: "Bankovní převod", desc: "Na vyžádání", icon: "🏦" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 p-4 rounded-xl border border-[#DEE2E6] bg-white">
              <span className="text-xl">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">{p.name}</p>
                <p className="text-xs text-[#6e6e73]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 mt-4 p-4 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/20">
          <Shield className="h-4 w-4 text-[#2E7D32] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#2E7D32]">
            Platby jsou zpracovávány bezpečně přes <strong>Stripe</strong> — certifikovaného poskytovatele
            plateb (PCI DSS Level 1). Vaše platební údaje nikdy neprochází naším serverem.
          </p>
        </div>
      </section>

      {/* Returns */}
      <section>
        <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Vrácení zboží</h2>
        <p className="text-sm text-[#6e6e73] mb-3">
          Máte právo vrátit neotevřené zboží do <strong>14 dnů</strong> od doručení bez udání důvodu.
          Napište nám na{" "}
          <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a> a
          my vám poskytneme instrukce. Více v{" "}
          <Link href="/obchodni-podminky" className="text-[#2E7D32] hover:underline">
            Obchodních podmínkách
          </Link>.
        </p>
      </section>
    </div>
  )
}
