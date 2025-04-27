import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

type Props = {
  params: { token: string }
}

export default function Page({ params }: Props) {
  return <ResetPasswordForm token={params.token} />
} 