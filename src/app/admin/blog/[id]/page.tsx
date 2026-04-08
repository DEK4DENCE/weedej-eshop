export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { auth } from "@/lib/auth"

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Blog Post — Admin" }

export default async function AdminBlogPostPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as any)?.id as string

  if (id === "new") {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold font-playfair">New Blog Post</h1>
        <BlogPostForm authorId={userId} />
      </div>
    )
  }

  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">Edit Blog Post</h1>
      <BlogPostForm authorId={userId} post={post} />
    </div>
  )
}
