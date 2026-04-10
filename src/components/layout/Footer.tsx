import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#DEE2E6] bg-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#2E7D32] mb-4 font-playfair">Weedej</h3>
            <p className="text-sm text-[#6e6e73] leading-relaxed">
              Prémiové konopné produkty doručené až ke dveřím. Laboratořemi testováno, přírodou inspirováno.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Obchod</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><Link href="/products" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Všechny produkty</Link></li>
              <li><Link href="/products?category=kvety" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Květy</Link></li>
              <li><Link href="/products?category=extrakty" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Extrakty</Link></li>
              <li><Link href="/products?category=edibles" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Edibles</Link></li>
              <li><Link href="/blog" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Účet</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><Link href="/login" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Přihlásit se</Link></li>
              <li><Link href="/register" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Registrace</Link></li>
              <li><Link href="/account/orders" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Moje objednávky</Link></li>
              <li><Link href="/account/settings" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Nastavení účtu</Link></li>
              <li><Link href="/contact" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#1d1d1f] mb-4">Informace</h4>
            <ul className="space-y-2 text-sm text-[#6e6e73]">
              <li><Link href="/doprava" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Doprava a platba</Link></li>
              <li><Link href="/faq" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Časté dotazy (FAQ)</Link></li>
              <li><Link href="/obchodni-podminky" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Obchodní podmínky</Link></li>
              <li><Link href="/ochrana-osobnich-udaju" className="hover:text-[#2E7D32] transition-colors hover:underline underline-offset-2">Ochrana osobních údajů</Link></li>
              <li><span className="text-xs text-[#aeaeb2] mt-1 block">Pouze pro osoby 18+. Produkty splňují EU předpisy.</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#DEE2E6] flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[#aeaeb2]">
          <span>© {new Date().getFullYear()} Weedej. Všechna práva vyhrazena.</span>
          <span>Produkty jsou určeny výhradně pro dospělé 18+.</span>
        </div>
      </div>
    </footer>
  )
}
