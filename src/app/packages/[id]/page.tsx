import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import PackageDetails from '@/components/PackageDetails'

export default async function PackagePage({
  params,
}: {
  params: { id: string }
}) {
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

  const packageData = await prisma.package.findUnique({
    where: { id: params.id },
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