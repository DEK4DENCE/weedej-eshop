"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function DarkModeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-9 h-9" />

  const dark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] ${dark ? "bg-[#1e1b4b] border border-[#8b5cf6]" : "bg-[#DEE2E6] border border-[#c8ced4]"} ${className}`}
    >
      {/* Track icons */}
      <Sun  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400 transition-opacity duration-200" style={{ opacity: dark ? 0.3 : 1 }} />
      <Moon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b5cf6] transition-opacity duration-200" style={{ opacity: dark ? 1 : 0.3 }} />
      {/* Thumb */}
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${dark ? "translate-x-7 bg-[#0d0d2b]" : "translate-x-0.5 bg-white"}`}
      />
    </button>
  )
}
