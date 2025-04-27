import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface PackageData {
  id: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
  currentLocation?: string | null;
}

interface RawPackageData {
  id: string;
  trackingnumber: string;
  statusid: string;
  recipientname: string;
  recipientphone: string;
  recipientaddress: string;
  weight: number;
  dimensions: string | null;
  description: string | null;
  price: number;
  created_at: string;
  updated_at: string;
  user: {
    fullname: string;
    email: string;
  }[];
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

    // First, fetch the packages
    const { data: packages, error: packagesError } = await supabase
      .from('Package')
      .select(`
        id,
        trackingnumber,
        statusid,
        recipientname,
        recipientphone,
        recipientaddress,
        weight,
        dimensions,
        description,
        price,
        created_at,
        updated_at,
        user:userid (
          fullname,
          email
        )
      `)
      .eq('userid', session.user.id)
      .order('created_at', { ascending: false })

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
      trackingNumber: pkg.trackingnumber,
      status: pkg.statusid,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      user: pkg.user[0] ? {
        fullName: pkg.user[0].fullname,
        email: pkg.user[0].email
      } : {
        fullName: 'Unknown',
        email: 'unknown@example.com'
      },
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