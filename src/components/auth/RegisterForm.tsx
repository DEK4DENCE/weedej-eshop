'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-[#d2d2d7]', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-[#22A829]']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength] : 'bg-[#d2d2d7]'}`}
          />
        ))}
      </div>
      <p className="text-xs text-[#6e6e73]">{labels[strength]}</p>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const passwordValue = watch('password', '')

  async function onSubmit(data: RegisterInput) {
    setServerError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="bg-white border border-[#d2d2d7] rounded-2xl p-8 w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-1">Create Your Account</h1>
        <p className="text-[#6e6e73] text-sm">Join thousands of satisfied customers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[#515154] text-sm">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Adam Smith"
            autoComplete="name"
            className="bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#22A829] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-11"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#515154] text-sm">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#22A829] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-11"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth" className="text-[#515154] text-sm">
            Date of birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            autoComplete="bday"
            className="bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#22A829] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#1d1d1f] rounded-xl h-11"
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[#515154] text-sm">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
              autoComplete="new-password"
              className="bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#22A829] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-11 pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-[#515154] text-sm">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#22A829] focus-visible:ring-0 focus-visible:ring-offset-0 text-[#1d1d1f] placeholder:text-[#aeaeb2] rounded-xl h-11 pr-11"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#22A829] hover:bg-[#1a9020] text-white font-semibold rounded-xl h-11 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6e6e73]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#22A829] hover:text-[#1a9020] font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
