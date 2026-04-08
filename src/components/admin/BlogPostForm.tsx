"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { Loader2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  published: boolean
}

interface Props {
  authorId: string
  post?: BlogPost
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function BlogPostForm({ authorId, post }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = Boolean(post)

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "")
  const [published, setPublished] = useState(post?.published ?? false)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit || slug === toSlug(post?.title ?? "")) {
      setSlug(toSlug(val))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !excerpt || !content) {
      toast({ title: "Validation error", description: "Title, excerpt, and content are required.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/blog/${post!.id}` : "/api/admin/blog"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, excerpt, content, coverImage, published }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Request failed")
      }

      toast({ title: isEdit ? "Post updated" : "Post created", description: title })
      router.push("/admin/blog")
      router.refresh()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="border-[#DEE2E6]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="post-slug"
          className="border-[#DEE2E6]"
        />
        <p className="text-xs text-[#6e6e73]">Auto-generated from title. Used in the URL.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short description shown in the blog list..."
          className="border-[#DEE2E6] min-h-[80px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Full post content..."
          className="border-[#DEE2E6] min-h-[240px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="border-[#DEE2E6]"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-[#2E7D32]"
        />
        <Label htmlFor="published" className="cursor-pointer">Published</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#2E7D32] hover:bg-[#1a9020] text-white"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
          className="border-[#DEE2E6]"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
