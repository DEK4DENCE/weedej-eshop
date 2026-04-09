'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'

export interface ImageAdjustment {
  x: number    // 0–100, background-position X%
  y: number    // 0–100, background-position Y%
  zoom: number // fraction of container width: 0.3–3.0
}

interface Props {
  url: string
  initial: ImageAdjustment
  onSave: (adj: ImageAdjustment) => void
  onClose: () => void
}

const CONTAINER_SIZE = 320 // preview square px

export function ImagePositionEditor({ url, initial, onSave, onClose }: Props) {
  const [adj, setAdj] = useState<ImageAdjustment>(initial)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Load natural image dimensions
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [url])

  // Autosize: scale image to fill container (cover behaviour — no white bars)
  const handleAutosize = () => {
    if (!imgSize.w || !imgSize.h) return
    // rendered width = zoom * CONTAINER_SIZE, rendered height = zoom * CONTAINER_SIZE * (imgH/imgW)
    // For cover: we want BOTH dimensions >= CONTAINER_SIZE
    const aspect = imgSize.w / imgSize.h
    // cover zoom = max(1, 1/aspect) since container is square
    const zoom = aspect >= 1 ? 1 : 1 / aspect
    setAdj({ x: 50, y: 50, zoom: parseFloat(zoom.toFixed(3)) })
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setAdj((prev) => {
      // rendered image size in px
      const renderedW = prev.zoom * CONTAINER_SIZE
      const renderedH = imgSize.h && imgSize.w ? renderedW * (imgSize.h / imgSize.w) : renderedW
      // movable range (image extends beyond container)
      const rangeX = renderedW - CONTAINER_SIZE
      const rangeY = renderedH - CONTAINER_SIZE
      // if image smaller than container, invert so drag still feels natural
      const sensX = rangeX !== 0 ? 100 / rangeX : 0.5
      const sensY = rangeY !== 0 ? 100 / rangeY : 0.5
      return {
        ...prev,
        x: Math.max(0, Math.min(100, prev.x - dx * sensX)),
        y: Math.max(0, Math.min(100, prev.y - dy * sensY)),
      }
    })
  }, [imgSize])

  const stopDrag = () => { dragging.current = false }

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragging.current = true
    lastPos.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const t = e.touches[0]
    const dx = t.clientX - lastPos.current.x
    const dy = t.clientY - lastPos.current.y
    lastPos.current = { x: t.clientX, y: t.clientY }
    setAdj((prev) => {
      const renderedW = prev.zoom * CONTAINER_SIZE
      const renderedH = imgSize.h && imgSize.w ? renderedW * (imgSize.h / imgSize.w) : renderedW
      const rangeX = renderedW - CONTAINER_SIZE
      const rangeY = renderedH - CONTAINER_SIZE
      const sensX = rangeX !== 0 ? 100 / rangeX : 0.5
      const sensY = rangeY !== 0 ? 100 / rangeY : 0.5
      return {
        ...prev,
        x: Math.max(0, Math.min(100, prev.x - dx * sensX)),
        y: Math.max(0, Math.min(100, prev.y - dy * sensY)),
      }
    })
  }

  const resetAdj = () => {
    setAdj({ x: 50, y: 50, zoom: 1 })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1d1d1f] text-sm">Upravit pozici obrázku</h3>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#6e6e73]">Přetáhněte obrázek pro změnu pozice. Použijte posuvník pro zoom.</p>

        {/* Preview — background-image approach for correct zoom behaviour */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrag}
          className="relative overflow-hidden rounded-xl border border-[#DEE2E6] cursor-move select-none"
          style={{
            width: CONTAINER_SIZE,
            height: CONTAINER_SIZE,
            backgroundImage: `url(${url})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${adj.zoom * 100}%`,
            backgroundPosition: `${adj.x}% ${adj.y}%`,
            backgroundColor: '#F8F9FA',
          }}
        >
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-0.5 bg-white/60" />
            <div className="absolute w-0.5 h-6 bg-white/60" />
          </div>
        </div>

        {/* Autosize button */}
        <button
          type="button"
          onClick={handleAutosize}
          disabled={!imgSize.w}
          className="w-full flex items-center justify-center gap-2 py-2 border border-[#DEE2E6] text-[#6e6e73] hover:text-[#2E7D32] hover:border-[#2E7D32] rounded-xl text-sm transition-colors disabled:opacity-40"
        >
          <Maximize2 size={14} />
          Automatická velikost
        </button>

        {/* Zoom slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#6e6e73]">Zoom</span>
            <span className="text-xs font-mono text-[#1d1d1f]">{adj.zoom.toFixed(2)}×</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomOut size={13} className="text-[#aeaeb2] flex-shrink-0" />
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.05"
              value={adj.zoom}
              onChange={(e) => setAdj((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
              className="flex-1 accent-[#2E7D32]"
            />
            <ZoomIn size={13} className="text-[#aeaeb2] flex-shrink-0" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={resetAdj}
            className="flex items-center gap-1 px-3 py-2 border border-[#DEE2E6] text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl text-sm transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={() => onSave(adj)}
            className="flex-1 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold py-2 rounded-xl text-sm transition-colors"
          >
            Použít
          </button>
        </div>
      </div>
    </div>
  )
}
