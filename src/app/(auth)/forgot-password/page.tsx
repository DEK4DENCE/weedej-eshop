import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Obnovit heslo — Weedej',
  description: 'Zadejte svůj e-mail a my vám pošleme odkaz pro reset hesla.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
