import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور',
  description: 'إعادة تعيين كلمة المرور الخاصة بك',
}

type PageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page(props: PageProps) {
  const [{ token }, searchParams] = await Promise.all([
    props.params,
    props.searchParams
  ])
  return <ResetPasswordForm token={token} />
} 