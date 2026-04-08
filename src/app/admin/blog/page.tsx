export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil } from "lucide-react"
import { AdminBlogDeleteButton } from "@/components/admin/AdminBlogDeleteButton"

export const metadata = { title: "Blog — Admin" }

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-playfair">Blog</h1>
        <Button asChild className="bg-[#2E7D32] hover:bg-[#1a9020] text-white">
          <Link href="/admin/blog/new"><Plus className="mr-2 h-4 w-4" />New Post</Link>
        </Button>
      </div>

      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No blog posts yet.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.author.name ?? post.author.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/blog/${post.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <AdminBlogDeleteButton id={post.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
