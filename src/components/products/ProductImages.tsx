'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (displayImages.length <= 1) return
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, displayImages.length])

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

  function getBgStyle(url: string): React.CSSProperties {
    const saved = adjMap[url]
    const adj = saved ?? { x: 50, y: 50, zoom: 1 }
    return {
      backgroundImage: `url(${url})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: saved ? `${adj.zoom * 100}%` : 'contain',
      backgroundPosition: `${adj.x}% ${adj.y}%`,
      backgroundColor: '#ffffff',
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#DEE2E6] group">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
            style={getBgStyle(displayImages[selectedIndex])}
            aria-label={`${productName} — image ${selectedIndex + 1}`}
          />
        </AnimatePresence>

        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Předchozí obrázek"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#DEE2E6] text-[#6e6e73] hover:text-[#2E7D32] hover:border-[#2E7D32] flex items-center justify-center transition-all shadow-sm z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              aria-label="Další obrázek"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-[#DEE2E6] text-[#6e6e73] hover:text-[#2E7D32] hover:border-[#2E7D32] flex items-center justify-center transition-all shadow-sm z-10"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <>
          <div className="flex gap-3">
            {displayImages.map((src, i) => (
              <button
                key={i}
                onClick={() => selectImage(i)}
                aria-label={`Zobrazit obrázek ${i + 1}`}
                className={[
                  'w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
                  i === selectedIndex
                    ? 'border-[#2E7D32]'
                    : 'border-[#DEE2E6] hover:border-[#2E7D32]/50 opacity-70 hover:opacity-100',
                ].join(' ')}
                style={getBgStyle(src)}
              />
            ))}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => selectImage(i)}
                aria-label={`Obrázek ${i + 1}`}
                className={[
                  'rounded-full transition-all duration-200',
                  i === selectedIndex
                    ? 'w-4 h-2 bg-[#2E7D32]'
                    : 'w-2 h-2 bg-[#DEE2E6] hover:bg-[#2E7D32]/50',
                ].join(' ')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
