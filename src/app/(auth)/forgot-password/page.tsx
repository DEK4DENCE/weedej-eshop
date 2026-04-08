import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Reset Your Password — Weedejna',
  description: 'Enter your email and we\'ll send you a reset link.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
