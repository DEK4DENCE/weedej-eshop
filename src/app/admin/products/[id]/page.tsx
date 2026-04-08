export const dynamic = 'force-dynamic'

import { ProductForm } from "@/components/admin/ProductForm"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Edit Product — Admin" }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!product) notFound()
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">Edit Product</h1>
      <ProductForm categories={categories} product={product as any} />
    </div>
  )
}