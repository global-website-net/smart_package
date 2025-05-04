import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: shops, error } = await supabase
      .from('User')
      .select('id, email')
      .eq('role', 'SHOP')
      .order('email', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(shops)
  } catch (error) {
    console.error('Error fetching shops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    )
  }
} 