import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"

export const metadata = { title: "Checkout — Weedej" }
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const session = await auth()
  if (!session) redirect("/login?callbackUrl=/checkout")

  const [user, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { name: true, phone: true, email: true },
    }),
    db.address.findMany({
      where: { userId: (session.user as any).id },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    }),
  ])

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 font-playfair">Checkout</h1>
      <CheckoutForm user={user} addresses={addresses} />
    </div>
  )
}
