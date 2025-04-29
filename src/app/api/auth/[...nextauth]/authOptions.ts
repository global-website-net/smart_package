import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for authentication
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
          console.error('Missing credentials')
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          console.log('Attempting to authenticate user:', credentials.email)

          // First try exact match
          let { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', credentials.email)
            .single()

          // If no exact match, try case-insensitive
          if (!user || error) {
            console.log('No exact match found, trying case-insensitive match')
            const { data: ilikeUser, error: ilikeError } = await supabase
              .from('User')
              .select('*')
              .ilike('email', credentials.email)
              .single()

            if (ilikeError) {
              console.error('Database error during case-insensitive search:', ilikeError)
              throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            }

            user = ilikeUser
          }

          if (!user) {
            console.error('No user found with email:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('User found, verifying password')

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.error('Invalid password for user:', credentials.email)
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
          }

          console.log('Password verified, authentication successful')

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role
          }
        } catch (error) {
          console.error('Authentication error:', error)
          // Log the full error object for debugging
          console.error('Full error object:', JSON.stringify(error, null, 2))
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
  debug: true // Enable debug mode for more detailed logs
} 