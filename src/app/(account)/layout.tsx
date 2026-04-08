import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AccountNav } from "@/components/account/AccountNav"
import { Toaster } from "@/components/ui/toaster"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <AccountNav />
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
