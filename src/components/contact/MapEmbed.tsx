"use client"
import { useEffect, useRef } from "react"

// Benešovská 432/3, 405 02 Děčín 2
const LAT  = 50.7780
const LNG  = 14.2100
const ZOOM = 16

export function MapEmbed() {
  const mapRef     = useRef<HTMLDivElement>(null)
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current || !mapRef.current) return
    initialised.current = true

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!).setView([LAT, LNG], ZOOM)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      L.marker([LAT, LNG])
        .addTo(map)
        .bindPopup("<b>Weedej</b><br>Benešovská 432/3<br>405 02 Děčín 2")
        .openPopup()
    })
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: 260, width: "100%" }} />
    </>
  )
}
