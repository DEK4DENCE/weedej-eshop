"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { Loader2, Plus, Trash2, Star, MapPin } from "lucide-react"
import { useSession } from "next-auth/react"

interface Address {
  id: string
  fullName: string
  line1: string
  line2?: string | null
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

const EMPTY_ADDR = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "CZ",
}

export function AccountSettingsClient() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [nameLoading, setNameLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [name, setName] = useState((session?.user as any)?.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingAddr, setAddingAddr] = useState(false)
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR)

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses")
      if (res.ok) setAddresses(await res.json())
    } finally {
      setAddrLoading(false)
    }
  }

  useEffect(() => { fetchAddresses() }, [])

  const handleNameSave = async () => {
    setNameLoading(true)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Failed to update name")
      await update({ name })
      toast({ title: "Jméno bylo úspěšně aktualizováno" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setNameLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setPwLoading(true)
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to change password")
      }
      setCurrentPassword("")
      setNewPassword("")
      toast({ title: "Heslo bylo úspěšně změněno" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setPwLoading(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.city || !newAddr.postalCode) {
      toast({ title: "Vyplňte prosím všechna povinná pole", variant: "destructive" })
      return
    }
    setAddingAddr(true)
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      })
      if (!res.ok) throw new Error("Failed to add address")
      setNewAddr(EMPTY_ADDR)
      setShowAddForm(false)
      await fetchAddresses()
      toast({ title: "Adresa přidána" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setAddingAddr(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })
      await fetchAddresses()
      toast({ title: "Výchozí adresa aktualizována" })
    } catch {
      toast({ title: "Nepodařilo se aktualizovat adresu", variant: "destructive" })
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/account/addresses/${id}`, { method: "DELETE" })
      await fetchAddresses()
      toast({ title: "Adresa odstraněna" })
    } catch {
      toast({ title: "Nepodařilo se odstranit adresu", variant: "destructive" })
    }
  }

  const inputClass =
    "bg-[#F8F9FA] border border-[#DEE2E6] focus:border-[#2E7D32] focus-visible:ring-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-10"

  return (
    <div className="space-y-6">
      {/* Display Name */}
      <Card>
        <CardHeader><CardTitle>Zobrazované jméno</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Jméno</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <Button onClick={handleNameSave} disabled={nameLoading}>
            {nameLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ukládání...</> : "Uložit jméno"}
          </Button>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin size={18} />
              Uložené adresy
            </CardTitle>
            {!showAddForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="border-[#DEE2E6] text-[#2E7D32] hover:bg-[#f0faf0] hover:text-[#1a9020]"
              >
                <Plus size={14} className="mr-1" />
                Přidat adresu
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {addrLoading ? (
            <div className="flex items-center gap-2 text-[#6e6e73] py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Načítání adres...</span>
            </div>
          ) : addresses.length === 0 && !showAddForm ? (
            <p className="text-sm text-[#6e6e73]">Zatím žádné uložené adresy.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
                    addr.isDefault ? "border-[#2E7D32]/40 bg-[#f0faf0]" : "border-[#DEE2E6] bg-white"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#1d1d1f] text-sm font-medium">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#2E7D32]/10 text-[#2E7D32] px-2 py-0.5 rounded-full">
                          Výchozí
                        </span>
                      )}
                    </div>
                    <p className="text-[#6e6e73] text-sm leading-relaxed">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                      <br />
                      {addr.postalCode} {addr.city}, {addr.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        title="Nastavit jako výchozí"
                        className="p-1.5 text-[#6e6e73] hover:text-[#b8860b] transition-colors rounded-lg hover:bg-[#fef9ec]"
                      >
                        <Star size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      title="Odstranit adresu"
                      className="p-1.5 text-[#6e6e73] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new address form */}
          {showAddForm && (
            <div className="border border-[#DEE2E6] rounded-xl p-4 space-y-3 bg-[#F8F9FA]">
              <p className="text-sm font-medium text-[#1d1d1f]">Nová adresa</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[#515154] text-xs">Celé jméno *</Label>
                  <Input
                    placeholder="Jan Novák"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[#515154] text-xs">Ulice a číslo domu *</Label>
                  <Input
                    placeholder="Hlavní 123"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr((p) => ({ ...p, line1: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[#515154] text-xs">Upřesnění adresy (nepovinné)</Label>
                  <Input
                    placeholder="Byt, patro, apod."
                    value={newAddr.line2}
                    onChange={(e) => setNewAddr((p) => ({ ...p, line2: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#515154] text-xs">PSČ *</Label>
                  <Input
                    placeholder="110 00"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr((p) => ({ ...p, postalCode: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#515154] text-xs">Město *</Label>
                  <Input
                    placeholder="Praha"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#515154] text-xs">Země *</Label>
                  <select
                    value={newAddr.country}
                    onChange={(e) => setNewAddr((p) => ({ ...p, country: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#DEE2E6] focus:border-[#2E7D32] text-[#1d1d1f] rounded-xl h-10 px-3 text-sm outline-none"
                  >
                    <option value="CZ">Česká republika</option>
                    <option value="SK">Slovensko</option>
                    <option value="DE">Německo</option>
                    <option value="AT">Rakousko</option>
                    <option value="PL">Polsko</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleAddAddress}
                  disabled={addingAddr}
                  className="bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold"
                  size="sm"
                >
                  {addingAddr ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Ukládání...</> : "Uložit adresu"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowAddForm(false); setNewAddr(EMPTY_ADDR) }}
                  className="text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  Zrušit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader><CardTitle>Změna hesla</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Současné heslo</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">Nové heslo</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={pwLoading}>
            {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Změna hesla...</> : "Změnit heslo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
