"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Shield } from "lucide-react"
import { Suspense } from "react"

const AGE_COOKIE = "age_verified"

function AgeGatePage() {
  const searchParams = useSearchParams()
  const [denied, setDenied] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = searchParams.get("from") || "/"
  // Ensure the destination is a relative path to prevent open redirect
  const destination = from.startsWith("/") ? from : "/"

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // Set cookie server-side so it is enforced by middleware (C5).
      // The POST action returns a redirect — following it reloads the destination page.
      const formData = new FormData()
      formData.append("from", destination)
      const res = await fetch("/api/age-gate/verify", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        // The API sets the cookie; now navigate to the intended destination
        window.location.href = destination
      } else {
        // Fallback: set cookie client-side and navigate
        document.cookie = `${AGE_COOKIE}=true; path=/; max-age=31536000; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`
        window.location.href = destination
      }
    } catch {
      // Fallback on network error
      document.cookie = `${AGE_COOKIE}=true; path=/; max-age=31536000; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`
      window.location.href = destination
    }
  }

  const handleDeny = () => {
    setDenied(true)
  }

  if (denied) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0D0A",
          color: "#F0F5F0",
          fontFamily: "system-ui,sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E53E3E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: "1.5rem" }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Přístup zamítnut
        </h1>
        <p style={{ color: "#6B8A6B", fontSize: "1.1rem", maxWidth: "400px" }}>
          Pro vstup na tuto stránku musíte být starší 18 let.
          <br />
          <br />
          Tato stránka obsahuje obsah související s konopnými produkty, které
          mohou nakupovat pouze dospělí.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-white border border-[#DEE2E6] rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-[#2E7D32]" />
          <span className="text-xl font-bold text-[#2E7D32] tracking-tight">Weedej</span>
        </div>

        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-3 font-playfair">
          Ověření věku
        </h1>
        <p className="text-[#6e6e73] text-sm mb-2">
          Tato webová stránka obsahuje konopné produkty určené pouze pro dospělé.
        </p>
        <p className="text-[#1d1d1f] font-semibold mb-8">
          Je vám 18 let nebo více?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Ano, je mi 18+"}
          </button>
          <button
            onClick={handleDeny}
            className="flex-1 bg-[#F8F9FA] hover:bg-[#ebebed] border border-[#DEE2E6] text-[#6e6e73] hover:text-[#1d1d1f] font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            Ne, je mi méně než 18
          </button>
        </div>

        <p className="mt-6 text-[10px] text-[#aeaeb2] leading-relaxed">
          Kliknutím na &ldquo;Ano, je mi 18+&rdquo; potvrzujete, že jste plnoletí a máte právo
          přistoupit k tomuto obsahu. Ověření věku si zapamatujeme pomocí cookies.
        </p>
      </div>
    </div>
  )
}

export default function AgeGateRoute() {
  return (
    <Suspense>
      <AgeGatePage />
    </Suspense>
  )
}
