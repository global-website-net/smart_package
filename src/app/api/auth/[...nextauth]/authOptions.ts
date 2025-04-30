import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Define UserRole type
type UserRole = 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          console.log('Attempting to authenticate:', credentials.email)
          
          // First, authenticate with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError) {
            console.error('Detailed Supabase Auth error:', {
              message: authError.message,
              status: authError.status,
              name: authError.name
            })
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          if (!authData.user) {
            console.error('No user data returned from Supabase Auth')
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('Supabase Auth successful, user ID:', authData.user.id)

          // Now get the user data from our database
          const { data: userData, error: userError } = await supabase
            .from('User')
            .select('id, email, fullName, role')
            .or(`id.eq.${authData.user.id},email.eq.${credentials.email}`)
            .single()

          if (userError) {
            console.error('Database error details:', {
              message: userError.message,
              code: userError.code,
              details: userError.details,
              hint: userError.hint
            })
            throw new Error('حدث خطأ أثناء محاولة تسجيل الدخول')
          }

          if (!userData) {
            console.error('No matching user found in database for ID:', authData.user.id)
            throw new Error('حدث خطأ أثناء محاولة تسجيل الدخول')
          }

          console.log('Successfully found user in database:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          })

          return {
            id: userData.id,
            email: userData.email,
            name: userData.fullName,
            role: userData.role
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
} 