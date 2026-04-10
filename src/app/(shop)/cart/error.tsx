'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CartError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center flex-col gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold text-[#1d1d1f]">Chyba při načítání košíku</h2>
      <p className="text-[#6e6e73] max-w-sm">Nepodařilo se načíst obsah košíku. Zkuste to znovu nebo se vraťte na hlavní stránku.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Zkusit znovu</Button>
        <Button variant="outline" asChild>
          <Link href="/products">Pokračovat v nákupu</Link>
        </Button>
      </div>
    </div>
  )
}
