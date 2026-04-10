"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { Loader2, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Link2, Quote, Minus } from "lucide-react"
import { MarkdownContent } from "@/components/blog/MarkdownContent"

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

type ToolbarAction = {
  icon: React.ReactNode
  label: string
  action: (selected: string, before: string, after: string) => { prefix: string; suffix: string; placeholder: string }
}

const TOOLBAR: ToolbarAction[] = [
  { icon: <Heading1 size={15} />, label: "H1", action: () => ({ prefix: "# ", suffix: "", placeholder: "Nadpis 1" }) },
  { icon: <Heading2 size={15} />, label: "H2", action: () => ({ prefix: "## ", suffix: "", placeholder: "Nadpis 2" }) },
  { icon: <Heading3 size={15} />, label: "H3", action: () => ({ prefix: "### ", suffix: "", placeholder: "Nadpis 3" }) },
  { icon: <Bold size={15} />, label: "Tučně", action: () => ({ prefix: "**", suffix: "**", placeholder: "tučný text" }) },
  { icon: <Italic size={15} />, label: "Kurzíva", action: () => ({ prefix: "_", suffix: "_", placeholder: "kurzíva" }) },
  { icon: <Quote size={15} />, label: "Citace", action: () => ({ prefix: "> ", suffix: "", placeholder: "Citace" }) },
  { icon: <List size={15} />, label: "Odrážky", action: () => ({ prefix: "- ", suffix: "", placeholder: "položka seznamu" }) },
  { icon: <ListOrdered size={15} />, label: "Číslovaný", action: () => ({ prefix: "1. ", suffix: "", placeholder: "položka seznamu" }) },
  { icon: <Link2 size={15} />, label: "Odkaz", action: (sel) => ({ prefix: "[", suffix: `](url)`, placeholder: sel || "text odkazu" }) },
  { icon: <Minus size={15} />, label: "Oddělovač", action: () => ({ prefix: "\n---\n", suffix: "", placeholder: "" }) },
]

function applyFormat(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder: string,
  onChange: (val: string) => void
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const selected = value.substring(start, end) || placeholder

  const newValue = value.substring(0, start) + prefix + selected + suffix + value.substring(end)
  onChange(newValue)

  requestAnimationFrame(() => {
    textarea.focus()
    const newStart = start + prefix.length
    const newEnd = newStart + selected.length
    textarea.setSelectionRange(newStart, newEnd)
  })
}

export function BlogPostForm({ authorId, post }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = Boolean(post)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
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

  function handleToolbar(action: ToolbarAction["action"]) {
    const ta = textareaRef.current
    if (!ta) return
    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd)
    const { prefix, suffix, placeholder } = action(selected, ta.value.substring(0, ta.selectionStart), ta.value.substring(ta.selectionEnd))
    applyFormat(ta, prefix, suffix, placeholder, setContent)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !excerpt || !content) {
      toast({ title: "Chyba validace", description: "Titulek, výtah a obsah jsou povinné.", variant: "destructive" })
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
      toast({ title: isEdit ? "Příspěvek uložen" : "Příspěvek vytvořen", description: title })
      router.push("/admin/blog")
      router.refresh()
    } catch (err: any) {
      toast({ title: "Chyba", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "border-[#DEE2E6] focus:border-[#2E7D32] focus-visible:ring-0"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Titulek *</Label>
        <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Titulek příspěvku" className={inputClass} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" className={inputClass} />
        <p className="text-xs text-[#6e6e73]">Automaticky generováno z titulku. Použito v URL.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Výtah *</Label>
        <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Krátký popis zobrazovaný v přehledu blogu..." className={`${inputClass} min-h-[80px]`} required />
      </div>

      {/* Content editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Obsah * <span className="text-xs font-normal text-[#6e6e73]">(Markdown)</span></Label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs text-[#2E7D32] hover:underline font-medium"
          >
            {preview ? "← Editovat" : "Náhled →"}
          </button>
        </div>

        {preview ? (
          <div className="min-h-[320px] border border-[#DEE2E6] rounded-xl p-4 bg-white overflow-auto">
            {content ? <MarkdownContent content={content} /> : <p className="text-[#aeaeb2] text-sm">Nic k zobrazení...</p>}
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-[#F8F9FA] border border-[#DEE2E6] border-b-0 rounded-t-xl">
              {TOOLBAR.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  title={tool.label}
                  onClick={() => handleToolbar(tool.action)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-[#515154] hover:bg-white hover:text-[#2E7D32] hover:shadow-sm transition-all border border-transparent hover:border-[#DEE2E6]"
                >
                  {tool.icon}
                </button>
              ))}
            </div>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# Nadpis\n\nZačněte psát obsah...\n\n## Podnadpis\n\nText odstavce s **tučným** a _kurzívním_ textem.`}
              className={`${inputClass} min-h-[320px] rounded-t-none font-mono text-sm resize-y`}
              required
            />
            <p className="text-xs text-[#aeaeb2]">
              Podporuje Markdown: **tučně**, _kurzíva_, # Nadpisy, - Odrážky, [text](url)
            </p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">URL titulního obrázku</Label>
        <Input id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className={inputClass} />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[#2E7D32]" />
        <Label htmlFor="published" className="cursor-pointer">Publikováno</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-[#2E7D32] hover:bg-[#1a9020] text-white">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Uložit změny" : "Vytvořit příspěvek"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")} className="border-[#DEE2E6]">
          Zrušit
        </Button>
      </div>
    </form>
  )
}
