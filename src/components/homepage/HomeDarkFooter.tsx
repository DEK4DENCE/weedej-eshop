import Link from "next/link"

export function HomeDarkFooter() {
  return (
    <footer className="bg-white border-t border-[#DEE2E6] py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#aeaeb2] text-sm">
          &copy; {new Date().getFullYear()} Weedej. Všechna práva vyhrazena.
        </p>
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
              className="text-[#aeaeb2] text-sm hover:text-[#1d1d1f] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
