export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"

export const metadata = { title: "Produkty — Admin" }

export default async function AdminProductsPage() {
  const raw = await db.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: 'asc' },
  })

  const products = raw.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? null,
    variantCount: p.variants.length,
    isActive: p.isActive,
    basePrice: Number(p.basePrice),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-playfair">Produkty</h1>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Nový produkt
          </Link>
        </Button>
      </div>
      <AdminProductsTable products={products} />
    </div>
  )
}
