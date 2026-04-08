export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { CategoryManager } from "@/components/admin/CategoryManager"

export const metadata = { title: "Categories — Admin" }

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">Categories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}