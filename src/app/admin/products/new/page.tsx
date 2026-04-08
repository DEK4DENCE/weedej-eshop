export const dynamic = 'force-dynamic'

import { ProductForm } from "@/components/admin/ProductForm"
import { db } from "@/lib/db"

export const metadata = { title: "New Product — Admin" }

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}