import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { signOut } from 'next-auth/react'
import { authOptions } from '@/app/api/auth/auth.config'
import prisma from '@/lib/prisma'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتنفيذ هذا الإجراء' },
        { status: 401 }
      )
    }

    // First, delete the user from the database table
    await prisma.user.delete({
      where: {
        email: session.user.email,
      },
    })

    // Sign out the user
    await signOut({ redirect: false })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete account route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحساب' },
      { status: 500 }
    )
  }
} 