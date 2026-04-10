"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold">Něco se nepovedlo</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Zkusit znovu</Button>
    </div>
  )
}
