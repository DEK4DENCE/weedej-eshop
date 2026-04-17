"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // TODO: Replace with Sentry.captureException(error) once @sentry/nextjs is installed
    console.error('[RouteError]', error.digest ? `digest=${error.digest}` : '', error)
  }, [error])
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold">Něco se nepovedlo</h2>
      <p className="text-muted-foreground">Omlouváme se za potíže. Zkuste to prosím znovu.</p>
      <Button onClick={reset}>Zkusit znovu</Button>
    </div>
  )
}
