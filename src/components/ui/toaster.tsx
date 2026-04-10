"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence initial={false}>
        {toasts.filter((t) => t.open).map(({ id, title, description, variant }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={[
              "flex flex-col gap-1 rounded-xl border px-4 py-3 shadow-lg text-sm",
              variant === "destructive"
                ? "border-red-500/30 bg-red-950/80 text-red-100"
                : "border-[#1F3D1F] bg-[#111714] text-[#F0F5F0]",
            ].join(" ")}
          >
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-xs opacity-80">{description}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
