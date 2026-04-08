"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(({ id, title, description, variant, open }) =>
        open ? (
          <div
            key={id}
            className={[
              "flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-lg text-sm",
              variant === "destructive"
                ? "border-red-500/30 bg-red-950/80 text-red-100"
                : "border-[#1F3D1F] bg-[#111714] text-[#F0F5F0]",
            ].join(" ")}
          >
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-xs opacity-80">{description}</p>}
          </div>
        ) : null
      )}
    </div>
  )
}
