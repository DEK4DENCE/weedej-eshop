"use client"

import { useEffect, useState } from "react"
import { Shield } from "lucide-react"

const STORAGE_KEY = "weedejna_age_verified"

export function AgeGate() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem(STORAGE_KEY)
    if (!verified) setShow(true)
  }, [])

  if (!show) return null

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setShow(false)
  }

  const handleDeny = () => {
    // Redirect to a safe page / show rejection message
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        background:#0A0D0A;
        color:#F0F5F0;
        font-family:system-ui,sans-serif;
        text-align:center;
        padding:2rem;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1.5rem">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:1rem">Access Denied</h1>
        <p style="color:#6B8A6B;font-size:1.1rem;max-width:400px">
          You must be 18 years of age or older to enter this website.<br><br>
          This site contains content related to cannabis products which may only be purchased by adults.
        </p>
      </div>
    `
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-white border border-[#DEE2E6] rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-[#2E7D32]" />
          <span className="text-xl font-bold text-[#2E7D32] tracking-tight">Weedejna</span>
        </div>

        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-3 font-playfair">
          Age Verification
        </h1>
        <p className="text-[#6e6e73] text-sm mb-2">
          This website contains cannabis products intended for adults only.
        </p>
        <p className="text-[#1d1d1f] font-semibold mb-8">
          Are you 18 years of age or older?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
          >
            Yes, I am 18+
          </button>
          <button
            onClick={handleDeny}
            className="flex-1 bg-[#F8F9FA] hover:bg-[#ebebed] border border-[#DEE2E6] text-[#6e6e73] hover:text-[#1d1d1f] font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            No, I am under 18
          </button>
        </div>

        <p className="mt-6 text-[10px] text-[#aeaeb2] leading-relaxed">
          By clicking &ldquo;Yes, I am 18+&rdquo; you confirm you are of legal age to access this content.
          We use a cookie to remember your age verification.
        </p>
      </div>
    </div>
  )
}
