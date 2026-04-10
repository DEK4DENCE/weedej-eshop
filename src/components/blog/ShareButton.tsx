"use client"
import { Share2 } from "lucide-react"

interface Props { title: string; url: string }

export function ShareButton({ title, url }: Props) {
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
    }
  }
  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 text-sm font-medium text-[#6e6e73] hover:text-[#2E7D32] border border-[#DEE2E6] hover:border-[#2E7D32] px-4 py-2 rounded-xl transition-colors"
    >
      <Share2 className="h-4 w-4" />
      Sdílet článek
    </button>
  )
}
