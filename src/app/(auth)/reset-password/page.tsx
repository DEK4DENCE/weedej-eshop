import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Zvolte nové heslo — Weedej',
  description: 'Nastavte nové heslo pro svůj účet Weedej.',
}

interface ResetPasswordPageProps {
  searchParams: { token?: string }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={searchParams.token ?? ''} />
}
