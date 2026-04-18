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
          callback: (point: PickupPoint | null) => void,
          containerEl?: HTMLElement | null
        ) => void
        close?: () => void
      }
    }
    // Global callback slot required by some Packeta v6 builds
    __packetaWidgetCallback?: (point: PickupPoint | null) => void
  }
}

const SCRIPT_SRC = "https://widget.packeta.com/v6/www/js/library.js"
const SCRIPT_ID = "packeta-widget-script"

export function PacketaWidget({ onSelect, selectedPoint, className }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY ?? ""
  const [scriptReady, setScriptReady] = useState(false)
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  // Load Packeta script
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

  // Backup: listen for postMessage from Packeta iframe directly
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.origin !== "string") return
      if (!event.origin.includes("packeta.com") && !event.origin.includes("zasilkovna.cz")) return
      const data = event.data
      if (!data) return
      // Packeta may send the point as { point: {...} } or directly as the point object
      const point: PickupPoint | null = data.point ?? (data.id ? data : null)
      if (point) onSelectRef.current(point)
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  function openWidget() {
    if (!window.Packeta?.Widget) return
    // Register callback globally — some Packeta v6 builds call via window reference
    window.__packetaWidgetCallback = (point: PickupPoint | null) => {
      if (point) onSelectRef.current(point)
      delete window.__packetaWidgetCallback
    }
    window.Packeta.Widget.pick(
      apiKey,
      { country: "cz", language: "cs" },
      window.__packetaWidgetCallback
    )
  }

  return (
    <div className={className}>
      {!apiKey && (
        <div className="mb-3 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Packeta API klíč není nastaven
        </div>
      )}

      {selectedPoint ? (
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
      ) : (
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
