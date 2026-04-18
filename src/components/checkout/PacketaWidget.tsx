"use client"

import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
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
    __packetaHandler?: (point: Record<string, unknown> | null) => void
  }
}

const SCRIPT_SRC = "https://widget.packeta.com/v6/www/js/library.js"
const SCRIPT_ID = "packeta-widget-script"

function normalizePoint(raw: Record<string, unknown>): PickupPoint {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    nameStreet: String(raw.nameStreet ?? raw.street ?? raw.name ?? ""),
    city: String(raw.city ?? ""),
    zip: String(raw.zip ?? raw.zipCode ?? ""),
  }
}

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

  // Backup: catch ALL postMessages and look for Packeta point data
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const d = event.data
      if (!d || typeof d !== "object") return
      // Packeta may send {point: {...}} or the point object directly
      const raw: Record<string, unknown> | null =
        (d.point && typeof d.point === "object" ? d.point as Record<string, unknown> : null) ??
        (d.id && d.name ? d as Record<string, unknown> : null)
      if (raw?.name) {
        flushSync(() => { onSelectRef.current(normalizePoint(raw)) })
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  function openWidget() {
    if (!window.Packeta?.Widget) return

    // Register as global — some Packeta builds resolve callback by name
    window.__packetaHandler = (raw) => {
      if (!raw) return
      flushSync(() => { onSelectRef.current(normalizePoint(raw)) })
    }

    window.Packeta.Widget.pick(
      apiKey,
      { country: "cz", language: "cs" },
      window.__packetaHandler
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
