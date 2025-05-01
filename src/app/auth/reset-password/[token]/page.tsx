import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
}

// This is a dynamic route, so we need to tell Next.js that params will be handled at runtime
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  )
} 