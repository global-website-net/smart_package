import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth.config'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتنفيذ هذا الإجراء' },
        { status: 401 }
      )
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ غير صالح' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المحفظة' },
        { status: 404 }
      )
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: {
        userId: session.user.id
      },
      data: {
        balance: wallet.balance + amount
      }
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'CREDIT',
        reason: 'إضافة رصيد إلى المحفظة'
      }
    })

    return NextResponse.json({
      success: true,
      newBalance: updatedWallet.balance
    })
  } catch (error) {
    console.error('Error in add-balance route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الرصيد' },
      { status: 500 }
    )
  }
}