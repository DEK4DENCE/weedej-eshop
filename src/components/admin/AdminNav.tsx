"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings, ArrowLeft, Warehouse, BookOpen } from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === href || (href !== "/admin" && pathname.startsWith(href))
              ? "bg-green-500/10 text-green-400"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
      <div className="mt-4 pt-4 border-t border-border/40">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Shop
        </Link>
      </div>
    </nav>
  )
}
