"use client"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/hooks/useCart"

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

export function HomeNavbar() {
  const { totalItems, toggleSidebar } = useCart()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-white/95 backdrop-blur border-b border-[#DEE2E6]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="relative w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#1d1d1f]/60">
          <div className="w-3 h-3 rounded-full border border-[#1d1d1f]/60" />
        </div>
        <span className="text-[#1d1d1f] font-bold text-lg tracking-tight">Weedej</span>
      </Link>

      {/* Center nav */}
      <div className="hidden md:flex items-center gap-3 text-sm">
        {([["Produkty", "/products"], ["Doprava", "/doprava"], ["Blog", "/blog"], ["Kontakt", "/contact"]] as [string, string][]).map(([label, href], i) => (
          <span key={href} className="flex items-center gap-3">
            {i > 0 && <span className="text-[#DEE2E6]">•</span>}
            <Link href={href} className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors duration-200">{label}</Link>
          </span>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Auth links — desktop only */}
        <div className="hidden md:flex items-center gap-1 mr-2">
          <Link
            href="/login"
            className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200"
          >
            Přihlásit se
          </Link>
          <Link
            href="/register"
            className="bg-[#2E7D32] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a9020] transition-colors duration-200"
          >
            Registrovat
          </Link>
        </div>
        <a
          href="https://www.instagram.com/weedej.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-[#DEE2E6] flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] hover:border-[#1d1d1f] transition-colors"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://www.facebook.com/weedej.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-[#DEE2E6] flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] hover:border-[#1d1d1f] transition-colors"
        >
          <FacebookIcon />
        </a>
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-full border border-[#DEE2E6] flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] hover:border-[#1d1d1f] transition-colors relative"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2E7D32] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
