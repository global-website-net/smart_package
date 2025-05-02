import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: Request) {
  try {
    // Get email from query parameter
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    console.log('Testing user:', email)

    // Check Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: 'test-password' // This will fail but we'll get the user info
    })

    // Check Prisma
    const prismaUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    return NextResponse.json({
      auth: {
        exists: !!authData?.user,
        error: authError?.message,
        user: authData?.user ? {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at,
          lastSignIn: authData.user.last_sign_in_at
        } : null
      },
      prisma: {
        exists: !!prismaUser,
        user: prismaUser ? {
          id: prismaUser.id,
          email: prismaUser.email,
          fullName: prismaUser.fullName,
          role: prismaUser.role
        } : null
      }
    })
  } catch (error) {
    console.error('Test user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 