"use client"

// Status is driven exclusively by ERP — no manual changes from e-shop admin.
// Zaplaceno → Odesláno (ERP ships) → Doručeno (ERP confirms delivery)

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  PENDING:    { label: "Čeká na platbu",  classes: "bg-gray-100 text-gray-600 border-gray-200" },
  PAID:       { label: "Zaplaceno",        classes: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  PROCESSING: { label: "Zaplaceno",        classes: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  SHIPPED:    { label: "Odesláno",         classes: "bg-purple-100 text-purple-700 border-purple-200" },
  DELIVERED:  { label: "Doručeno",         classes: "bg-green-100 text-green-700 border-green-200" },
  CANCELLED:  { label: "Zrušeno",          classes: "bg-red-100 text-red-700 border-red-200" },
  REFUNDED:   { label: "Vráceno",          classes: "bg-gray-100 text-gray-600 border-gray-200" },
}

interface Props { currentStatus: string }

export function AdminOrderStatusClient({ currentStatus }: Props) {
  const s = STATUS_MAP[currentStatus] ?? { label: currentStatus, classes: "bg-gray-100 text-gray-600 border-gray-200" }
  return (
    <div className="space-y-2">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${s.classes}`}>
        {s.label}
      </span>
      <p className="text-xs text-muted-foreground">
        Status řídí ERP — mění se automaticky při expedici a doručení.
      </p>
    </div>
  )
}
