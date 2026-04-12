import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

export function HomeDarkFooter() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Logo variant="light" size="sm" />
          <p className="text-white/35 text-sm">
            &copy; {new Date().getFullYear()} Weedej. Všechna práva vyhrazena.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {(
            [
              ["Doprava", "/doprava"],
              ["Obchodní podmínky", "/obchodni-podminky"],
              ["Ochrana osobních údajů", "/ochrana-osobnich-udaju"],
              ["Kontakt", "/contact"],
            ] as [string, string][]
          ).map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-white/35 text-sm hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
