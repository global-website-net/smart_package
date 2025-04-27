import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

export default function Page({
  params,
}: {
  params: { token: string }
}) {
  return <ResetPasswordForm token={params.token} />
} 