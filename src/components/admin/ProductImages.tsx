"use client"

import { useState, useRef } from "react"
import { Upload, Trash2, Star, Loader2, ImagePlus, Move } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { ImagePositionEditor, type ImageAdjustment } from "./ImagePositionEditor"

interface Props {
  productId: string
  initialImages: string[]
  initialAdjustments?: string | null
}

const DEFAULT_ADJ: ImageAdjustment = { x: 50, y: 50, zoom: 1 }

export function ProductImages({ productId, initialImages, initialAdjustments }: Props) {
  const { toast } = useToast()
  const [images, setImages] = useState<string[]>(initialImages)
  const [adjustments, setAdjustments] = useState<Record<string, ImageAdjustment>>(
    initialAdjustments ? JSON.parse(initialAdjustments) : {}
  )
  const [uploading, setUploading] = useState(false)
  const [editingUrl, setEditingUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const getAdj = (url: string): ImageAdjustment => adjustments[url] ?? DEFAULT_ADJ

  const saveAdjustments = async (newAdj: Record<string, ImageAdjustment>) => {
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageAdjustments: JSON.stringify(newAdj) }),
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    setUploading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setImages((prev) => [...prev, data.url])
      toast({ title: "Image uploaded" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error("Delete failed")
      const newImages = images.filter((u) => u !== url)
      setImages(newImages)
      const newAdj = { ...adjustments }
      delete newAdj[url]
      setAdjustments(newAdj)
      await saveAdjustments(newAdj)
      toast({ title: "Image removed" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    }
  }

  const handleSetFirst = async (url: string) => {
    const reordered = [url, ...images.filter((u) => u !== url)]
    setImages(reordered)
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: reordered }),
      })
      toast({ title: "Main image updated" })
    } catch {
      toast({ title: "Failed to update image order", variant: "destructive" })
    }
  }

  const handleSaveAdjustment = async (url: string, adj: ImageAdjustment) => {
    const newAdj = { ...adjustments, [url]: adj }
    setAdjustments(newAdj)
    setEditingUrl(null)
    try {
      await saveAdjustments(newAdj)
      toast({ title: "Position saved" })
    } catch {
      toast({ title: "Failed to save position", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, i) => {
            const adj = getAdj(url)
            return (
              <div
                key={url}
                className={`relative group rounded-xl overflow-hidden border aspect-square ${
                  i === 0 ? "border-[#2E7D32]" : "border-[#DEE2E6]"
                }`}
              >
                {/* Image with stored adjustments */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Product image ${i + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `${adj.x}% ${adj.y}%`,
                      transform: `scale(${adj.zoom})`,
                      transformOrigin: `${adj.x}% ${adj.y}%`,
                    }}
                  />
                </div>

                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-[#2E7D32] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={8} fill="white" /> Main
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingUrl(url)}
                    title="Adjust position & zoom"
                    className="p-1.5 bg-white/90 text-[#1d1d1f] rounded-lg hover:bg-white transition-colors"
                  >
                    <Move size={13} />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetFirst(url)}
                      title="Set as main image"
                      className="p-1.5 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a9020] transition-colors"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(url)}
                    title="Delete image"
                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-[#DEE2E6] bg-[#fafafa] text-[#aeaeb2] text-sm gap-2">
          <ImagePlus size={18} />
          No images yet
        </div>
      )}

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm border border-[#DEE2E6] hover:border-[#2E7D32] text-[#6e6e73] hover:text-[#1d1d1f] bg-white hover:bg-[#F8F9FA] px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? <><Loader2 size={15} className="animate-spin" />Uploading...</> : <><Upload size={15} />Upload Image</>}
        </button>
        <p className="text-[10px] text-[#aeaeb2] mt-1.5">
          JPG, PNG, WebP or GIF — max 5 MB. Hover image to adjust position/zoom. First image is the main photo.
        </p>
      </div>

      {/* Position editor modal */}
      {editingUrl && (
        <ImagePositionEditor
          url={editingUrl}
          initial={getAdj(editingUrl)}
          onSave={(adj) => handleSaveAdjustment(editingUrl, adj)}
          onClose={() => setEditingUrl(null)}
        />
      )}
    </div>
  )
}
