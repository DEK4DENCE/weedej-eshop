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

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req)
  if (authError) return authError

  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
    take: 200,
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const { session: adminSession, error: authError } = await requireAdmin(req)
  if (authError) return authError

  const body = await req.json()
  const { title, excerpt, content, coverImage, published } = body
  const authorId = adminSession.user.id

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }
  if (title.length > 255) return NextResponse.json({ error: "title max 255 chars" }, { status: 400 })
  if (!excerpt || typeof excerpt !== "string" || !excerpt.trim()) {
    return NextResponse.json({ error: "excerpt is required" }, { status: 400 })
  }
  if (excerpt.length > 500) return NextResponse.json({ error: "excerpt max 500 chars" }, { status: 400 })
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }
  if (content.length > 100_000) return NextResponse.json({ error: "content max 100 000 chars" }, { status: 400 })

  const slug = body.slug || toSlug(title)

  const post = await db.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
      authorId,
    },
  })

  revalidatePath("/blog")
  return NextResponse.json(post, { status: 201 })
}
