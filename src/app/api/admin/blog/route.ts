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

export async function GET() {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const { session: adminSession, error: authError } = await requireAdmin()
  if (authError) return authError

  const body = await req.json()
  const { title, excerpt, content, coverImage, published } = body
  const authorId = adminSession.user.id

  if (!title || !excerpt || !content) {
    return NextResponse.json({ error: "title, excerpt, and content are required" }, { status: 400 })
  }

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

  return NextResponse.json(post, { status: 201 })
}
