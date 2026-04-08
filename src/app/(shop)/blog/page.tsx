export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays } from "lucide-react"

export const metadata = { title: "Blog — Weedej" }

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold font-playfair text-[#212121] mb-2">Blog</h1>
      <p className="text-[#6e6e73] mb-10">Novinky, tipy a informace ze světa cannabis</p>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-semibold text-[#212121] mb-2">Coming soon</h2>
          <p className="text-[#6e6e73]">Brzy zde najdete zajímavé články o cannabis.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-[#DEE2E6] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
            >
              {post.coverImage ? (
                <div className="relative h-48 w-full bg-[#F8F9FA]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-[#2E7D32]/10 to-[#66BB6A]/20 flex items-center justify-center">
                  <span className="text-4xl">🌿</span>
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <h2 className="text-lg font-semibold text-[#212121] mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-sm text-[#6e6e73] mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#DEE2E6]">
                  <span className="flex items-center gap-1 text-xs text-[#6e6e73]">
                    <CalendarDays className="h-3 w-3" />
                    {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-[#2E7D32] hover:text-[#1a9020] transition-colors"
                  >
                    Číst dál →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
