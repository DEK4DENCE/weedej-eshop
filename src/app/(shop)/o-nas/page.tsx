import type { Metadata } from "next"
import Link from "next/link"
import { Leaf, Shield, FlaskConical, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "O nás — Weedej",
  description: "Jsme česká firma specializující se na prémiové CBD a konopné produkty. Laboratořemi testováno, přírodou inspirováno. Zjistěte více o naší misi.",
  alternates: { canonical: 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app/o-nas' },
  openGraph: {
    title: "O nás — Weedej",
    description: "Jsme česká firma specializující se na prémiové CBD a konopné produkty.",
    url: 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app/o-nas',
    locale: 'cs_CZ',
  },
}

export default function ONasPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-2">Náš příběh</p>
      <h1 className="text-3xl font-bold font-playfair text-[#1d1d1f] mb-4">O nás</h1>
      <p className="text-[#6e6e73] mb-10 text-lg leading-relaxed">
        Weedej vznikl z vášně pro legální konopnou kulturu a přesvědčení, že prémiové produkty musí být dostupné každému.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { value: "500+", label: "Spokojených zákazníků" },
          { value: "50+", label: "Prémiových produktů" },
          { value: "2022", label: "Rok založení" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
            <p className="text-2xl font-bold text-[#2E7D32] font-playfair">{value}</p>
            <p className="text-xs text-[#6e6e73] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-sm max-w-none text-[#1d1d1f] space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Kdo jsme</h2>
          <p className="text-[#6e6e73]">
            Jsme tým nadšenců z Děčína, kteří věří v sílu přírodních produktů. Weedej byl založen s jasným cílem:
            nabízet výhradně produkty, které bychom sami rádi používali — laboratořemi testované, legální a skutečně prémiové.
            Každý produkt v našem katalogu prochází pečlivým výběrem a splňuje přísné standardy kvality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Náš příběh</h2>
          <div className="relative border-l-2 border-[#DEE2E6] ml-3 space-y-6">
            {[
              { year: "2022", title: "Začátek", desc: "Weedej vznikl v Děčíně jako malý online obchod s jasnou vizí — nabízet pouze produkty, které sami věříme a používáme." },
              { year: "2023", title: "Rozšíření nabídky", desc: "Přidali jsme extrakty a edibles. Zavedli jsme přísný výběrový proces a každý produkt testujeme v akreditované laboratoři." },
              { year: "2024", title: "Vlastní e-shop", desc: "Spustili jsme nový e-shop s plnou podporou online plateb, sledováním zásilek a věrnostním programem pro stálé zákazníky." },
            ].map(({ year, title, desc }) => (
              <div key={year} className="pl-6 relative">
                <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-[#2E7D32] border-2 border-white shadow" />
                <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">{year}</p>
                <p className="font-semibold text-[#1d1d1f] mt-0.5">{title}</p>
                <p className="text-sm text-[#6e6e73] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Naše hodnoty</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: FlaskConical, title: "Laboratořemi testováno", desc: "Každý produkt má certifikát o obsahu kanabinoidů a čistotě." },
              { icon: Shield, title: "100 % legální", desc: "Všechny produkty splňují požadavky EU i českého práva." },
              { icon: Leaf, title: "Přírodní původ", desc: "Preferujeme produkty bez zbytečných přísad a s transparentním složením." },
              { icon: Heart, title: "Diskrétnost", desc: "Vaše soukromí chráníme — zásilky jsou diskrétní, data zabezpečená." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
                <div className="flex-shrink-0 p-2 rounded-lg bg-[#E8F5E9]">
                  <Icon className="h-4 w-4 text-[#2E7D32]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{title}</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Kde nás najdete</h2>
          <p className="text-[#6e6e73]">
            Sídlíme v Děčíně v severních Čechách a doručujeme diskrétně po celé České republice.
            Máte otázky? Rádi vám poradíme — osobně, telefonicky nebo e-mailem.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
            >
              Kontaktovat nás
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
