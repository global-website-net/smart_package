import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'رقم التتبع مطلوب' },
        { status: 400 }
      )
    }

    // Get package details using Supabase
    const { data: packageData, error: packageError } = await supabase
      .from('Package')
      .select(`
        *,
        Status:status_id (
          name,
          description
        ),
        User:user_id (
          fullName,
          email
        )
      `)
      .eq('tracking_number', trackingNumber)
      .single()

    if (packageError) {
      console.error('Error fetching package:', packageError)
      return NextResponse.json(
        { error: 'لم يتم العثور على الشحنة' },
        { status: 404 }
      )
    }

    if (!packageData) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الشحنة' },
        { status: 404 }
      )
    }

    // Get package history using Supabase
    const { data: historyData, error: historyError } = await supabase
      .from('PackageHistory')
      .select(`
        *,
        Status:status_id (
          name,
          description
        )
      `)
      .eq('package_id', packageData.id)
      .order('timestamp', { ascending: false })

    if (historyError) {
      console.error('Error fetching package history:', historyError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب سجل الشحنة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      package: {
        ...packageData,
        status: packageData.Status,
        user: packageData.User
      },
      history: historyData?.map(record => ({
        ...record,
        status: record.Status
      }))
    })
  } catch (error) {
    console.error('Error tracking package:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تتبع الشحنة' },
      { status: 500 }
    )
  }
} 