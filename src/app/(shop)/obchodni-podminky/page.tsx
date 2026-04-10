import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Obchodní podmínky — Weedej" }

export default function ObchodniPodminkyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold font-playfair text-[#1d1d1f] mb-2">Obchodní podmínky</h1>
      <p className="text-sm text-[#aeaeb2] mb-8">Platné od 1. 1. 2024</p>

      <div className="prose prose-sm max-w-none text-[#1d1d1f] space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">1. Provozovatel a kontaktní údaje</h2>
          <p className="text-[#6e6e73]">
            Provozovatelem e-shopu Weedej je fyzická/právnická osoba se sídlem Benešovská 432/3, Děčín 2.
            Kontaktní e-mail: <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a>.
            Telefon: <a href="tel:+420792342324" className="text-[#2E7D32] hover:underline">+420 792 342 324</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">2. Věkové omezení</h2>
          <p className="text-[#6e6e73]">
            Veškeré produkty nabízené v e-shopu Weedej jsou určeny výhradně pro osoby starší 18 let.
            Odesláním objednávky zákazník potvrzuje, že dosáhl věku 18 let. Prodávající si vyhrazuje
            právo odmítnout objednávku nebo požadovat ověření věku.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">3. Objednávka a uzavření smlouvy</h2>
          <p className="text-[#6e6e73]">
            Objednávku lze učinit prostřednictvím webového formuláře na stránce weedej.cz. Odesláním
            objednávky zákazník závazně objednává uvedené zboží. Prodávající potvrdí přijetí objednávky
            e-mailem. Kupní smlouva je uzavřena okamžikem potvrzení objednávky prodávajícím.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">4. Ceny a platba</h2>
          <p className="text-[#6e6e73]">
            Všechny ceny jsou uvedeny v českých korunách (Kč) včetně DPH. Platba probíhá prostřednictvím
            platební brány Stripe (kreditní/debetní karta, Apple Pay, Google Pay). Platba je zpracována
            bezpečně šifrovaným spojením.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">5. Dodání zboží</h2>
          <p className="text-[#6e6e73]">
            Objednávky jsou expedovány do 1–2 pracovních dnů od přijetí platby. Doručení zajišťuje
            Česká pošta nebo zásilková služba PPL. Standardní dodací lhůta je 2–3 pracovní dny.
            Zásilky jsou baleny diskrétně bez označení obsahu.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">6. Odstoupení od smlouvy</h2>
          <p className="text-[#6e6e73]">
            Zákazník má právo odstoupit od smlouvy bez udání důvodu do 14 dnů od převzetí zboží (§1829
            občanského zákoníku). Zboží musí být vráceno nepoškozené, v původním obalu, neotevřené.
            Náklady na vrácení zboží nese zákazník. Peníze budou vráceny do 14 dnů od obdržení vráceného zboží.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">7. Reklamace</h2>
          <p className="text-[#6e6e73]">
            Reklamace zboží uplatňujte e-mailem na <a href="mailto:info@weedej.cz" className="text-[#2E7D32] hover:underline">info@weedej.cz</a> s
            popisem závady a fotografií. Záruční doba je 24 měsíců. Reklamace bude vyřízena do 30 dnů.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">8. Legálnost produktů</h2>
          <p className="text-[#6e6e73]">
            Všechny produkty splňují požadavky právních předpisů České republiky a Evropské unie.
            Produkty s obsahem THC nepřekračují zákonem stanovenou hranici. Prodávající nenese
            odpovědnost za způsob použití produktů zákazníkem.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">9. Ochrana osobních údajů</h2>
          <p className="text-[#6e6e73]">
            Zpracování osobních údajů se řídí{" "}
            <Link href="/ochrana-osobnich-udaju" className="text-[#2E7D32] hover:underline">
              Zásadami ochrany osobních údajů
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">10. Závěrečná ustanovení</h2>
          <p className="text-[#6e6e73]">
            Tyto obchodní podmínky jsou platné a účinné od 1. 1. 2024. Prodávající si vyhrazuje právo
            podmínky měnit. Aktuální znění je vždy dostupné na této stránce. Veškeré spory se řídí
            právem České republiky.
          </p>
        </section>

      </div>
    </div>
  )
}
