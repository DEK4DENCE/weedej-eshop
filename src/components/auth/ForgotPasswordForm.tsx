'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError('')
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-12 h-12 bg-[#1A2E1A] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[#F0F5F0] mb-2">Check your inbox</h1>
        <p className="text-[#6B8F6B] text-sm mb-6">
          Check your inbox — a reset link is on its way.
        </p>
        <Link
          href="/login"
          className="text-[#2E7D32] hover:text-[#38C424] text-sm font-medium transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-8 w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#F0F5F0] mb-1">Reset Your Password</h1>
        <p className="text-[#6B8F6B] text-sm">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="bg-red-950/40 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-3">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#A8C5A0] text-sm">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="bg-[#1A2219] border border-[#1F3D1F] focus:border-[#2E7D32] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#F0F5F0] placeholder:text-[#3D5C3D] rounded-xl h-11"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2E7D32] hover:bg-[#38C424] text-black font-semibold rounded-xl h-11 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/login" className="text-[#2E7D32] hover:text-[#38C424] text-sm font-medium transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
