import type { Metadata } from "next"

export const metadata: Metadata = { title: "Ochrana osobních údajů — Weedej" }

export default function OchranaOsobnichUdajuPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold font-playfair text-[#1d1d1f] mb-2">Ochrana osobních údajů</h1>
      <p className="text-sm text-[#aeaeb2] mb-8">Zásady zpracování osobních údajů — platné od 1. 1. 2024</p>

      <div className="prose prose-sm max-w-none text-[#1d1d1f] space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">1. Správce osobních údajů</h2>
          <p className="text-[#6e6e73]">
            Správcem osobních údajů je provozovatel e-shopu Weedej se sídlem Benešovská 432/3, Děčín 2.
            Kontaktní e-mail: <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">2. Jaké údaje zpracováváme</h2>
          <ul className="text-[#6e6e73] space-y-1 list-disc list-inside">
            <li>Jméno, příjmení a e-mailová adresa (registrace, objednávky)</li>
            <li>Doručovací a fakturační adresa</li>
            <li>Telefonní číslo</li>
            <li>Údaje o objednávkách a zakoupených produktech</li>
            <li>IP adresa a technická data při návštěvě webu</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">3. Účel zpracování</h2>
          <ul className="text-[#6e6e73] space-y-1 list-disc list-inside">
            <li>Vyřízení objednávky a doručení zboží</li>
            <li>Zákaznická podpora a komunikace</li>
            <li>Plnění zákonných povinností (daňové doklady, účetnictví)</li>
            <li>Provoz zákaznického účtu</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">4. Právní základ zpracování</h2>
          <p className="text-[#6e6e73]">
            Zpracování probíhá na základě plnění smlouvy (čl. 6 odst. 1 písm. b GDPR), plnění zákonných
            povinností (čl. 6 odst. 1 písm. c GDPR) a oprávněného zájmu správce (čl. 6 odst. 1 písm. f GDPR).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">5. Předávání třetím stranám</h2>
          <p className="text-[#6e6e73]">
            Osobní údaje mohou být předány přepravním společnostem (za účelem doručení) a platebním
            zprostředkovatelům (Stripe, Inc., za účelem platby). Stripe zpracovává platební údaje dle
            vlastních zásad ochrany soukromí a certifikace PCI DSS. Vaše platební údaje nepředáváme
            dalším třetím stranám.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">6. Doba uchovávání</h2>
          <p className="text-[#6e6e73]">
            Údaje jsou uchovávány po dobu nezbytně nutnou pro splnění účelu zpracování, nejdéle však
            5 let od posledního nákupu. Účetní a daňové doklady jsou uchovávány dle zákonných lhůt
            (10 let).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">7. Vaše práva</h2>
          <ul className="text-[#6e6e73] space-y-1 list-disc list-inside">
            <li>Právo na přístup k osobním údajům</li>
            <li>Právo na opravu nepřesných údajů</li>
            <li>Právo na výmaz („právo být zapomenut")</li>
            <li>Právo na omezení zpracování</li>
            <li>Právo na přenositelnost údajů</li>
            <li>Právo vznést námitku proti zpracování</li>
          </ul>
          <p className="text-[#6e6e73] mt-3">
            Pro uplatnění svých práv nás kontaktujte na{" "}
            <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a>.
            Máte také právo podat stížnost u dozorového orgánu — Úřadu pro ochranu osobních údajů
            (uoou.cz).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">8. Soubory cookie</h2>
          <p className="text-[#6e6e73]">
            Web využívá pouze nezbytné cookies pro zajištění funkčnosti (přihlášení, košík). Nepoužíváme
            sledovací ani reklamní cookies třetích stran.
          </p>
        </section>

      </div>
    </div>
  )
}
