"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { Loader2 } from "lucide-react"

const inputClass =
  "bg-[#F8F9FA] border border-[#DEE2E6] focus:border-[#2E7D32] focus-visible:ring-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-10"

export function PasswordChangeForm() {
  const { toast } = useToast()
  const [pwLoading, setPwLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

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

  return (
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
  )
}
