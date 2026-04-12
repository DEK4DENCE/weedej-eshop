"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, User, LogOut, Settings, Package, Menu, X } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { Logo } from "@/components/ui/Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"

const navLinks = [
  { href: "/products", label: "Vše" },
  { href: "/products?category=kvety", label: "Květy" },
  { href: "/products?category=extrakty", label: "Extrakty" },
  { href: "/products?category=edibles", label: "Edibles" },
  { href: "/doprava", label: "Doprava" },
  { href: "/contact", label: "Kontakt" },
  { href: "/blog", label: "Blog" },
]

export function Header() {
  const { data: session } = useSession()
  const { totalItems, toggleSidebar } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/products") return pathname.startsWith("/products")
    if (href === "/blog") return pathname.startsWith("/blog")
    if (href === "/contact") return pathname === "/contact"
    if (href === "/doprava") return pathname === "/doprava"
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DEE2E6] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div onClick={() => setMobileOpen(false)}>
          <Logo variant="dark" size="md" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-[#2E7D32] font-semibold border-b-2 border-[#2E7D32] pb-0.5"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSidebar}
            className="relative flex items-center gap-1.5 px-3 py-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors rounded-lg hover:bg-[#F8F9FA]"
            aria-label="Nákupní košík"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden md:inline text-sm font-medium">Košík</span>
            <AnimatePresence mode="popLayout">
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32] text-xs text-white font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors" aria-label="User menu">
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-[#DEE2E6]">
                <div className="px-2 py-1.5 text-sm font-medium text-[#6e6e73]">{session.user?.email}</div>
                <DropdownMenuSeparator className="bg-[#DEE2E6]" />
                <DropdownMenuItem className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer" onClick={() => router.push("/account")}>
                  <User className="mr-2 h-4 w-4" />Můj účet
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer" onClick={() => router.push("/account/orders")}>
                  <Package className="mr-2 h-4 w-4" />Objednávky
                </DropdownMenuItem>
                {(session.user as any)?.role === "ADMIN" && (
                  <DropdownMenuItem className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer" onClick={() => router.push("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#DEE2E6]" />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />Odhlásit se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/login" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors px-3 py-2 rounded-xl hover:bg-[#F8F9FA]">
                Přihlásit se
              </Link>
              <Link href="/register" className="text-sm font-semibold text-white bg-[#2E7D32] hover:bg-[#1a9020] transition-colors px-3 py-2 rounded-xl">
                Registrovat se
              </Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <motion.button
            className="md:hidden p-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
          className="md:hidden border-t border-[#DEE2E6] bg-white/98 backdrop-blur overflow-hidden"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#1d1d1f] hover:text-[#2E7D32] hover:bg-[#E8F5E9] px-3 py-2.5 rounded-xl transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-[#DEE2E6] mt-2 pt-3">
              {session ? (
                <>
                  <div className="text-xs text-[#6e6e73] px-3 pb-2">{session.user?.email}</div>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] hover:text-[#2E7D32] hover:bg-[#E8F5E9] px-3 py-2.5 rounded-xl transition-colors">
                    <User className="h-4 w-4" />Můj účet
                  </Link>
                  <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] hover:text-[#2E7D32] hover:bg-[#E8F5E9] px-3 py-2.5 rounded-xl transition-colors">
                    <Package className="h-4 w-4" />Objednávky
                  </Link>
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f] hover:text-[#2E7D32] hover:bg-[#E8F5E9] px-3 py-2.5 rounded-xl transition-colors">
                      <Settings className="h-4 w-4" />Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                    className="flex items-center gap-2 w-full text-sm font-medium text-[#6e6e73] hover:text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />Odhlásit se
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 text-sm font-medium text-[#2E7D32] border-2 border-[#2E7D32] hover:bg-[#2E7D32]/5 px-4 py-2.5 rounded-xl transition-colors">
                    Přihlásit se
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#2E7D32] hover:bg-[#1a9020] px-4 py-2.5 rounded-xl transition-colors">
                    Registrovat se
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  )
}
