import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PackageDetails from '@/components/PackageDetails'

// For Next.js 15.3.1, both params and searchParams should be Promises
type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PackagePage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  // Get user from Supabase
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('email', session.user.email)
    .single()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Await the params to get the id
  const { id } = await params
  // Await the searchParams (even though we're not using them)
  await searchParams

  // Get package from Supabase
  const { data: packageData, error: packageError } = await supabase
    .from('Package')
    .select(`
      *,
      user:userId (
        fullName,
        email
      ),
      shop:shopId (
        fullName,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (packageError || !packageData) {
    return <div>Package not found</div>
  }

  // Check if user has permission to view this package
  if (
    user.role !== 'ADMIN' &&
    user.role !== 'OWNER' &&
    packageData.userId !== user.id &&
    packageData.shopId !== user.id
  ) {
    return <div>You don't have permission to view this package</div>
  }

  return <PackageDetails package={packageData} userRole={user.role} />
} 