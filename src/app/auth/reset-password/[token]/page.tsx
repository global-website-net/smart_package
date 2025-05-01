import { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
}

interface Props {
  params: {
    token: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ResetPasswordPage({ params }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  )
} 