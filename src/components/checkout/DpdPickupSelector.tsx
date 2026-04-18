"use client"

import { useState, useCallback } from "react"
import { MapPin, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export function DpdPickupSelector({ onSelect, selectedPoint, className }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PickupPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/shipping/dpd-pickup?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("Request failed")
      const data = (await res.json()) as { points: PickupPoint[] }
      setResults(data.points)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    search(query)
  }

  function handleSelect(point: PickupPoint) {
    onSelect(point)
    setShowSearch(false)
    setResults([])
    setSearched(false)
  }

  function openSearch() {
    setShowSearch(true)
    setQuery("")
    setResults([])
    setSearched(false)
    // Load all points by default
    search("")
  }

  if (selectedPoint && !showSearch) {
    return (
      <div className={className}>
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
              onClick={openSearch}
            >
              Změnit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {!showSearch && (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={openSearch}
        >
          <MapPin className="h-4 w-4" />
          Vybrat výdejní místo DPD
        </Button>
      )}

      {showSearch && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Zadejte město nebo PSČ…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hledat"}
            </Button>
          </form>

          {loading && (
            <div className="mt-4 flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#2E7D32]" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Žádná výdejní místa nebyla nalezena.
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul className="mt-3 max-h-60 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-100">
              {results.map((point) => (
                <li key={point.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#2E7D32]/5"
                    onClick={() => handleSelect(point)}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                    <div>
                      <p className="text-sm font-medium text-[#1d1d1f]">{point.name}</p>
                      <p className="text-xs text-gray-500">
                        {point.nameStreet}, {point.zip} {point.city}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-xs text-gray-500"
              onClick={() => setShowSearch(false)}
            >
              Zrušit
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
