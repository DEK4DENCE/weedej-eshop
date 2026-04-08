import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5 MB." }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `products/${id}-${Date.now()}.${ext}`
  let url: string

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Production: use Vercel Blob
    const { put } = await import("@vercel/blob")
    const blob = await put(fileName, file, { access: "public" })
    url = blob.url
  } else {
    // Development: save to local public folder
    const { writeFile, mkdir } = await import("fs/promises")
    const { join } = await import("path")
    const uploadDir = join(process.cwd(), "public", "images", "products")
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    const localName = `${id}-${Date.now()}.${ext}`
    await writeFile(join(uploadDir, localName), buffer)
    url = `/images/products/${localName}`
  }

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

  // Delete from Vercel Blob if it's a blob URL
  if (url.includes("vercel-storage.com") || url.includes("blob.vercel.app")) {
    try {
      const { del } = await import("@vercel/blob")
      await del(url)
    } catch { /* ignore */ }
  } else if (url.startsWith("/images/products/")) {
    // Local dev: delete from disk
    const { unlink } = await import("fs/promises")
    const { join } = await import("path")
    unlink(join(process.cwd(), "public", url)).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
