import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 