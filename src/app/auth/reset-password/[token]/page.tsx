import ResetPasswordForm from './ResetPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string }
}) {
  return <ResetPasswordForm token={params.token} />
} 