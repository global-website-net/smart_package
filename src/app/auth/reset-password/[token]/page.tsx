import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

type Props = {
  params: { token: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page(props: Props) {
  return <ResetPasswordForm token={props.params.token} />
} 