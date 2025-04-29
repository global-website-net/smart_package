import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

interface PackageData {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullname: string;
    email: string;
  };
  currentLocation?: string | null;
}

interface RawPackageData {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullname: string;
    email: string;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    // Fetch the packages with user data
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        *,
        user:userId (
          id,
          fullName,
          email
        )
      `)
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب الشحنات' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedPackages = (packages as RawPackageData[]).map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      status: pkg.status,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      user: pkg.user,
      currentLocation: null
    }))

    return NextResponse.json(transformedPackages)
  } catch (error) {
    console.error('Error in my-packages route:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشحنات' },
      { status: 500 }
    )
  }
} 