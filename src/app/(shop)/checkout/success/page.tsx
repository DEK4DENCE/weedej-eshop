import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Objednávka potvrzena — Weedej" }

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  // Only read — never create. Order creation is the Stripe webhook's exclusive job.
  // If the webhook fires before this page loads, we show the ESH number.
  // If not yet, we show a generic confirmation (webhook will send the email).
  const order = sessionId
    ? await db.order.findUnique({
        where: { stripeSessionId: sessionId },
        select: { id: true, erpOrderNumber: true },
      })
    : null

  const displayNumber = order?.erpOrderNumber ?? null

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-[#2E7D32] mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 font-playfair text-[#1d1d1f]">Objednávka potvrzena!</h1>
      <p className="text-[#6e6e73] mb-8">
        Děkujeme za vaši objednávku. Potvrzovací e-mail s fakturou vám bude brzy odeslán.
      </p>
      {displayNumber && (
        <p className="text-sm font-mono font-semibold text-[#2E7D32] mb-6">
          Číslo objednávky: {displayNumber}
        </p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Zobrazit objednávky
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/10 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Pokračovat v nákupu
        </Link>
      </div>
    </div>
  )
}
