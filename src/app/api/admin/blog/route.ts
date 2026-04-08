import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
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
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, excerpt, content, coverImage, published } = body
  const authorId = (session?.user as any)?.id as string

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
