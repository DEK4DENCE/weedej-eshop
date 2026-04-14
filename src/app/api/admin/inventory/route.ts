import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const products = await db.product.findMany({
    where: { variants: { some: {} } },
    select: {
      id: true,
      name: true,
      erpStock: true,
      erpUnit: true,
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          variantValue: true,
          variantUnit: true,
        },
        orderBy: { variantValue: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(products)
}
