import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
export const dynamic = 'force-dynamic'

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

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0 || title.length > 255)) {
    return NextResponse.json({ error: "title must be 1-255 chars" }, { status: 400 })
  }
  if (excerpt !== undefined && (typeof excerpt !== "string" || excerpt.length > 500)) {
    return NextResponse.json({ error: "excerpt max 500 chars" }, { status: 400 })
  }
  if (content !== undefined && (typeof content !== "string" || content.length > 100_000)) {
    return NextResponse.json({ error: "content max 100 000 chars" }, { status: 400 })
  }

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

  revalidatePath("/blog")
  revalidatePath(`/blog/${post.slug}`)
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.blogPost.delete({ where: { id } })
  revalidatePath("/blog")
  revalidatePath(`/blog/${existing.slug}`)
  return NextResponse.json({ success: true })
}
