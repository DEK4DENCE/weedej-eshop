"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Package, Settings } from "lucide-react"

const links = [
  { href: "/account", label: "Profil", icon: User },
  { href: "/account/orders", label: "Objednávky", icon: Package },
  { href: "/account/settings", label: "Nastavení", icon: Settings },
]

export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-green-500/10 text-green-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
