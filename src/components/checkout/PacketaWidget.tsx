"use client"

// Loads Packeta Widget to let user select a Zásilkovna pick-up point or Z-BOX.
// Requires NEXT_PUBLIC_PACKETA_API_KEY env var (get from app.packeta.com).
// Widget docs: https://docs.packeta.com/docs/widget/

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PickupPoint {
  id: string
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
          options: { country: string; language: string; vendors?: string[] },
          callback: (point: PickupPoint | null) => void
        ) => void
      }
    }
  }
}

const SCRIPT_SRC = "https://widget.packeta.com/v6/www/js/library.js"
const SCRIPT_ID = "packeta-widget-script"

export function PacketaWidget({ onSelect, selectedPoint, className }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_PACKETA_API_KEY ?? ""
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current || document.getElementById(SCRIPT_ID)) {
      scriptLoaded.current = true
      return
    }
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => {
      scriptLoaded.current = true
    }
    document.body.appendChild(script)
  }, [])

  function openWidget() {
    if (!window.Packeta?.Widget) {
      console.warn("Packeta widget script not yet loaded")
      return
    }
    // Remove any lingering Packeta overlay so the widget can be reopened
    document.getElementById("packeta-widget")?.remove()
    document.getElementById("packeta-widget-overlay")?.remove()
    document.querySelectorAll('[id^="packeta"]').forEach((el) => el.remove())
    window.Packeta.Widget.pick(
      apiKey,
      { country: "cz", language: "cs" },
      (point) => {
        if (point) onSelect(point)
      }
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
                <p className="text-sm font-semibold text-[#1d1d1f]">{selectedPoint.name}</p>
                <p className="text-xs text-gray-500">{selectedPoint.nameStreet}</p>
                <p className="text-xs text-gray-500">
                  {selectedPoint.zip} {selectedPoint.city}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={openWidget}
              disabled={!apiKey}
            >
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
          disabled={!apiKey}
        >
          <MapPin className="h-4 w-4" />
          Vybrat výdejní místo
        </Button>
      )}
    </div>
  )
}
