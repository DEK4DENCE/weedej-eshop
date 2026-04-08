'use client'

import { useState, useRef, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

export interface ImageAdjustment {
  x: number   // 0–100, objectPosition X
  y: number   // 0–100, objectPosition Y
  zoom: number // 1.0–3.0, scale factor
}

interface Props {
  url: string
  initial: ImageAdjustment
  onSave: (adj: ImageAdjustment) => void
  onClose: () => void
}

export function ImagePositionEditor({ url, initial, onSave, onClose }: Props) {
  const [adj, setAdj] = useState<ImageAdjustment>(initial)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    const w = containerRef.current.offsetWidth
    const h = containerRef.current.offsetHeight
    setAdj((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, prev.x - (dx / w) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / h) * 100)),
    }))
  }, [])

  const stopDrag = () => { dragging.current = false }

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragging.current = true
    lastPos.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || !containerRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - lastPos.current.x
    const dy = t.clientY - lastPos.current.y
    lastPos.current = { x: t.clientX, y: t.clientY }
    const w = containerRef.current.offsetWidth
    const h = containerRef.current.offsetHeight
    setAdj((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, prev.x - (dx / w) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / h) * 100)),
    }))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1d1d1f] text-sm">Adjust Image Position</h3>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#6e6e73]">Drag image to reposition. Use slider to zoom.</p>

        {/* Preview frame — drag here */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrag}
          className="relative overflow-hidden rounded-xl border border-[#d2d2d7] cursor-move select-none bg-[#f5f5f7]"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Preview"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${adj.x}% ${adj.y}%`,
              transform: `scale(${adj.zoom})`,
              transformOrigin: `${adj.x}% ${adj.y}%`,
              pointerEvents: 'none',
            }}
          />
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-0.5 bg-white/60" />
            <div className="absolute w-0.5 h-6 bg-white/60" />
          </div>
        </div>

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
              min="1"
              max="3"
              step="0.05"
              value={adj.zoom}
              onChange={(e) => setAdj((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
              className="flex-1 accent-[#22A829]"
            />
            <ZoomIn size={13} className="text-[#aeaeb2] flex-shrink-0" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setAdj({ x: 50, y: 50, zoom: 1 })}
            className="flex items-center gap-1 px-3 py-2 border border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl text-sm transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={() => onSave(adj)}
            className="flex-1 bg-[#22A829] hover:bg-[#1a9020] text-white font-semibold py-2 rounded-xl text-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
