'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImagesProps {
  images: string[]
  productName: string
  adjustments?: string | null
}

export function ProductImages({ images, productName, adjustments }: ProductImagesProps) {
  const allImages = images.length > 0 ? images : ['/images/placeholder-product.webp']
  const displayImages = allImages.slice(0, 5)
  const adjMap = adjustments ? JSON.parse(adjustments) : {}

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  function selectImage(index: number) {
    setDirection(index > selectedIndex ? 1 : -1)
    setSelectedIndex(index)
  }

  function prev() {
    const newIndex = (selectedIndex - 1 + displayImages.length) % displayImages.length
    setDirection(-1)
    setSelectedIndex(newIndex)
  }

  function next() {
    const newIndex = (selectedIndex + 1) % displayImages.length
    setDirection(1)
    setSelectedIndex(newIndex)
  }

  function getStyle(url: string) {
    const adj = adjMap[url] ?? { x: 50, y: 50, zoom: 1 }
    return {
      objectFit: 'cover' as const,
      objectPosition: `${adj.x}% ${adj.y}%`,
      transform: `scale(${adj.zoom})`,
      transformOrigin: `${adj.x}% ${adj.y}%`,
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f5f7] border border-[#e8e8ed] group">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[selectedIndex]}
              alt={`${productName} — image ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={getStyle(displayImages[selectedIndex])}
              priority={selectedIndex === 0}
              unoptimized={displayImages[selectedIndex].startsWith('/images/')}
            />
          </motion.div>
        </AnimatePresence>

        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-[#d2d2d7] text-[#6e6e73] hover:text-[#22A829] hover:border-[#22A829] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-[#d2d2d7] text-[#6e6e73] hover:text-[#22A829] hover:border-[#22A829] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3">
          {displayImages.map((src, i) => (
            <button
              key={i}
              onClick={() => selectImage(i)}
              aria-label={`View image ${i + 1}`}
              className={[
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 bg-[#f5f5f7]',
                i === selectedIndex
                  ? 'border-[#22A829]'
                  : 'border-[#d2d2d7] hover:border-[#22A829]/50 opacity-70 hover:opacity-100',
              ].join(' ')}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                style={getStyle(src)}
                unoptimized={src.startsWith('/images/')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
