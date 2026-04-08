import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP or GIF." }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${id}-${Date.now()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "images", "products")

  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, fileName), buffer)

  const url = `/images/products/${fileName}`

  // Append to imageUrls
  await db.product.update({
    where: { id },
    data: { imageUrls: { push: url } },
  })

  return NextResponse.json({ url }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: "No url" }, { status: 400 })

  const product = await db.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const newUrls = product.imageUrls.filter((u) => u !== url)
  await db.product.update({ where: { id }, data: { imageUrls: newUrls } })

  // Delete file from disk if it's a local file
  if (url.startsWith("/images/products/")) {
    const { unlink } = await import("fs/promises")
    const filePath = join(process.cwd(), "public", url)
    unlink(filePath).catch(() => {}) // ignore if already gone
  }

  return NextResponse.json({ ok: true })
}
