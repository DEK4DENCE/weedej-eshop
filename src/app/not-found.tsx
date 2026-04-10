import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-6 px-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground/20 font-playfair">404</h1>
      <h2 className="text-2xl font-bold">Stránka nenalezena</h2>
      <p className="text-muted-foreground">Stránka, kterou hledáte, neexistuje.</p>
      <Button asChild><Link href="/">Zpět na hlavní stránku</Link></Button>
    </div>
  )
}
