import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
}

// This is a dynamic route, so we need to tell Next.js that params will be handled at runtime
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageParams {
  token: string;
}

interface Props {
  params: Promise<PageParams>;
}

export default async function ResetPasswordPage({ params }: Props) {
  const resolvedParams = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <ResetPasswordForm token={resolvedParams.token} />
      </div>
    </div>
  )
} 