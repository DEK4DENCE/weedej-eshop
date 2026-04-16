import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface TimelineStep {
  key: string
  label: string
  timestamp: string | null | undefined
}

interface OrderTimelineProps {
  createdAt: string
  paidAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  status: string
}

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function OrderTimeline({ createdAt, paidAt, shippedAt, deliveredAt, status }: OrderTimelineProps) {
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED'

  // Order is only created after successful payment — so if paidAt is missing
  // (legacy orders before the column was added), createdAt == paid time.
  const resolvedPaidAt = paidAt ?? (status !== 'PENDING' ? createdAt : null)

  const steps: TimelineStep[] = [
    { key: 'ordered',   label: 'Objednáno',  timestamp: createdAt },
    { key: 'paid',      label: 'Zaplaceno',  timestamp: resolvedPaidAt },
    { key: 'shipped',   label: 'Odesláno',   timestamp: shippedAt },
    { key: 'delivered', label: 'Doručeno',   timestamp: deliveredAt },
  ]

  return (
    <div className="bg-white border border-[#DEE2E6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#2E7D32]" />
        Průběh objednávky
      </h3>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[#DEE2E6]" />

        <div className="space-y-6">
          {steps.map((step, i) => {
            const done = !!step.timestamp
            const isLast = i === steps.length - 1

            return (
              <div key={step.key} className="relative flex items-start gap-4 pl-8">
                {/* Icon */}
                <div className="absolute left-0 top-0.5">
                  {done ? (
                    <CheckCircle2 className="w-6 h-6 text-[#2E7D32]" />
                  ) : (
                    <Circle className={`w-6 h-6 ${isCancelled ? 'text-red-300' : 'text-[#DEE2E6]'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}>
                    {step.label}
                  </p>
                  {done && step.timestamp ? (
                    <p className="text-xs text-[#6e6e73] mt-0.5">
                      {formatDateTime(step.timestamp)}
                    </p>
                  ) : (
                    <p className="text-xs text-[#aeaeb2] mt-0.5">
                      {isCancelled && !done ? '—' : 'Čeká se…'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {isCancelled && (
            <div className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-0 top-0.5">
                <CheckCircle2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">
                  {status === 'REFUNDED' ? 'Vráceno' : 'Stornováno'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
