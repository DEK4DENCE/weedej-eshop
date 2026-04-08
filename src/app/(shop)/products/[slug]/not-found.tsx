import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-4 font-playfair">Product not found</h1>
      <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
      <Button asChild><Link href="/products">Browse Products</Link></Button>
    </div>
  )
}
