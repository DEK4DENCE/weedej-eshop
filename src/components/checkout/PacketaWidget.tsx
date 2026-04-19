"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PickupPoint {
  id: string | number
  name: string
  nameStreet: string
  city: string
  zip: string
}

interface Props {
  onSelect: (point: PickupPoint) => void
  selectedPoint: PickupPoint | null
  className?: string
}

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          options: object,
          callback: (point: Record<string, unknown> | null) => void,
          containerEl?: HTMLElement | null
        ) => void
        close?: () => void
      }
    }
  }
}

const SCRIPT_SRC = "https://widget.packeta.com/v6/www/js/library.js"
const SCRIPT_ID = "packeta-widget-script"

function fromPacketaPoint(p: Record<string, unknown>): PickupPoint | null {
  if (!p.id || !p.name) return null
  return {
    id: String(p.id),
    name: String(p.place ?? p.name),
    nameStreet: String(p.nameStreet ?? p.street ?? p.name ?? ""),
    city: String(p.city ?? ""),
    zip: String(p.zip ?? ""),
  }
}

export function PacketaWidget({ onSelect, selectedPoint, className }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY ?? ""
  const [scriptReady, setScriptReady] = useState(false)
  const [widgetOpen, setWidgetOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  // Load Packeta library script
  useEffect(() => {
    if (window.Packeta?.Widget) { setScriptReady(true); return }
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      const poll = setInterval(() => {
        if (window.Packeta?.Widget) { setScriptReady(true); clearInterval(poll) }
      }, 100)
      return () => clearInterval(poll)
    }
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => setScriptReady(true)
    document.body.appendChild(script)
  }, [])

  // PRIMARY: Listen for Packeta's postMessage directly.
  // Packeta v6 sends: JSON.stringify({ packetaWidgetMessage: true, packetaPoint: <point>|null })
  // library.js's own receiver calls close() then callback() — but callback may silently fail.
  // We bypass that and capture the raw postMessage ourselves.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      let data: Record<string, unknown>
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data
      } catch {
        return
      }
      if (!data || !data.packetaWidgetMessage) return

      // Close the widget container
      setWidgetOpen(false)

      const p = data.packetaPoint as Record<string, unknown> | null | undefined
      if (!p) return // user closed without selecting

      const point = fromPacketaPoint(p)
      if (point) onSelectRef.current(point)
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Launch inline widget once container is in DOM
  useEffect(() => {
    if (!widgetOpen || !containerRef.current || !window.Packeta?.Widget) return

    const el = containerRef.current
    const timer = setTimeout(() => {
      window.Packeta!.Widget.pick(
        apiKey,
        { country: "cz", language: "cs" },
        // FALLBACK callback — in case library.js does deliver the data here
        (raw) => {
          setWidgetOpen(false)
          if (!raw || typeof raw !== "object") return
          const point = fromPacketaPoint(raw as Record<string, unknown>)
          if (point) setTimeout(() => onSelectRef.current(point), 0)
        },
        el
      )
    }, 150)

    return () => clearTimeout(timer)
  }, [widgetOpen, apiKey])

  function openWidget() {
    if (!window.Packeta?.Widget) return
    setWidgetOpen(true)
  }

  function closeWidget() {
    window.Packeta?.Widget?.close?.()
    setWidgetOpen(false)
  }

  return (
    <div className={className}>
      {!apiKey && (
        <div className="mb-3 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Packeta API klíč není nastaven
        </div>
      )}

      {widgetOpen && (
        <div className="space-y-2">
          <div ref={containerRef} style={{ width: "100%", height: "520px" }} />
          <Button type="button" variant="ghost" size="sm" className="w-full text-xs text-gray-500" onClick={closeWidget}>
            Zrušit
          </Button>
        </div>
      )}

      {!widgetOpen && selectedPoint && (
        <div className="rounded-lg border border-[#2E7D32] bg-[#2E7D32]/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">{String(selectedPoint.name)}</p>
                <p className="text-xs text-gray-500">{String(selectedPoint.nameStreet ?? "")}</p>
                <p className="text-xs text-gray-500">{String(selectedPoint.zip ?? "")} {String(selectedPoint.city ?? "")}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" className="shrink-0 text-xs" onClick={openWidget} disabled={!apiKey}>
              Změnit
            </Button>
          </div>
        </div>
      )}

      {!widgetOpen && !selectedPoint && (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={openWidget}
          disabled={!apiKey || !scriptReady}
        >
          {!scriptReady
            ? <><Loader2 className="h-4 w-4 animate-spin" />Načítám mapu…</>
            : <><MapPin className="h-4 w-4" />Vybrat výdejní místo</>}
        </Button>
      )}
    </div>
  )
}
