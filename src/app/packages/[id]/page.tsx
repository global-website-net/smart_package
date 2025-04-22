import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import PackageDetails from '@/components/PackageDetails'

// For Next.js 15.3.1, params should be a Promise
type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Record<string, string | string[] | undefined>
}

export default async function PackagePage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Await the params to get the id
  const { id } = await params

  const packageData = await prisma.package.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      shop: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  })

  if (!packageData) {
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