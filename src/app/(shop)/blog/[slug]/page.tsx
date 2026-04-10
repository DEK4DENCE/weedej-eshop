export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ArrowLeft } from "lucide-react"
import { MarkdownContent } from "@/components/blog/MarkdownContent"

interface Props { params: Promise<{ slug: string }> }

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

const BASE_URL = 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app'

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) return { title: "Článek nenalezen — Weedej Blog" }
  return {
    title: `${post.title} — Weedej Blog`,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'cs_CZ',
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage ? { images: [{ url: post.coverImage, alt: post.title }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({
    where: { slug, published: true },
    include: { author: { select: { name: true } } },
  })

  if (!post) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-[#6e6e73] hover:text-[#2E7D32] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Zpět na blog
      </Link>

      {post.coverImage && (
        <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-8 bg-[#F8F9FA]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <h1 className="text-4xl font-bold font-playfair text-[#212121] mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#DEE2E6]">
        <span className="flex items-center gap-1 text-sm text-[#6e6e73]">
          <CalendarDays className="h-4 w-4" />
          {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
        </span>
        {post.author.name && (
          <span className="text-sm text-[#6e6e73]">
            Autor: <span className="font-medium text-[#212121]">{post.author.name}</span>
          </span>
        )}
      </div>

      <p className="text-lg text-[#6e6e73] mb-8 italic">{post.excerpt}</p>

      <div className="max-w-none">
        <MarkdownContent content={post.content} />
      </div>
    </div>
  )
}
