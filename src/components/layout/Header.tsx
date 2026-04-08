"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, User, LogOut, Settings, Package } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session } = useSession()
  const { totalItems, toggleSidebar } = useCart()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DEE2E6] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#2E7D32] font-playfair">
            Weedejna
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            All
          </Link>
          <Link href="/products?category=flowers" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            Flowers
          </Link>
          <Link href="/products?category=extracts" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            Extracts
          </Link>
          <Link href="/products?category=edibles" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            Edibles
          </Link>
          <Link href="/contact" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            Kontakt
          </Link>
          <Link href="/blog" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="relative p-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32] text-xs text-white font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors" aria-label="User menu">
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-[#DEE2E6]">
                <div className="px-2 py-1.5 text-sm font-medium text-[#6e6e73]">{session.user?.email}</div>
                <DropdownMenuSeparator className="bg-[#DEE2E6]" />
                <DropdownMenuItem
                  className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer"
                  onClick={() => router.push("/account")}
                >
                  <User className="mr-2 h-4 w-4" />Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer"
                  onClick={() => router.push("/account/orders")}
                >
                  <Package className="mr-2 h-4 w-4" />Orders
                </DropdownMenuItem>
                {(session.user as any)?.role === "ADMIN" && (
                  <DropdownMenuItem
                    className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer"
                    onClick={() => router.push("/admin")}
                  >
                    <Settings className="mr-2 h-4 w-4" />Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#DEE2E6]" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
