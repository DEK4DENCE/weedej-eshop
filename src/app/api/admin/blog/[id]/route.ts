import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

interface Context { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const { title, excerpt, content, coverImage, published } = body

  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const slug = body.slug || (title ? toSlug(title) : existing.slug)

  const wasPublished = existing.published
  const publishedAt =
    published && !wasPublished
      ? new Date()
      : published
      ? existing.publishedAt
      : null

  const post = await db.blogPost.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug,
      excerpt: excerpt ?? existing.excerpt,
      content: content ?? existing.content,
      coverImage: coverImage !== undefined ? coverImage || null : existing.coverImage,
      published: Boolean(published),
      publishedAt,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.blogPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
