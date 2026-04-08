import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Choose a New Password — Weedejna',
  description: 'Set a new password for your Weedejna account.',
}

interface ResetPasswordPageProps {
  searchParams: { token?: string }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={searchParams.token ?? ''} />
}
