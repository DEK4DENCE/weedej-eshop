import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export const metadata = { title: "Platba zrušena — Weedej" }

export default function CheckoutCancelledPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <XCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 font-playfair">Platba zrušena</h1>
      <p className="text-muted-foreground mb-8">
        Vaše platba byla zrušena. Váš košík je stále uložen — můžete to zkusit znovu, kdykoli budete připraveni.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
          <Link href="/checkout">Zkusit znovu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Pokračovat v nákupu</Link>
        </Button>
      </div>
    </div>
  )
}
