'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setServerError('')
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
      })
      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push('/login?reset=true')
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  if (!token) {
    return (
      <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-[#F0F5F0] mb-2">Invalid link</h1>
        <p className="text-[#6B8F6B] text-sm mb-6">
          This reset link is invalid or missing. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold rounded-xl px-6 py-3 transition-colors"
        >
          Request New Link
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#F0F5F0] mb-1">Choose a New Password</h1>
        <p className="text-[#6B8F6B] text-sm">Your new password must be at least 8 characters</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="bg-red-950/40 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-3">
            {serverError}
          </div>
        )}

        <input type="hidden" {...register('token')} value={token} />

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[#A8C5A0] text-sm">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
              autoComplete="new-password"
              className="bg-[#1A2219] border border-[#1F3D1F] focus:border-[#2E7D32] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#F0F5F0] placeholder:text-[#3D5C3D] rounded-xl h-11 pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8F6B] hover:text-[#A8C5A0] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-[#A8C5A0] text-sm">
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="bg-[#1A2219] border border-[#1F3D1F] focus:border-[#2E7D32] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#F0F5F0] placeholder:text-[#3D5C3D] rounded-xl h-11 pr-11"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8F6B] hover:text-[#A8C5A0] transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold rounded-xl h-11 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </div>
  )
}
