import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'

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
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        try {
          // Use the pool directly to find the user
          const client = await pool.connect()
          try {
            const result = await client.query(
              'SELECT * FROM "User" WHERE email = $1',
              [credentials.email]
            )
            
            const user = result.rows[0]
            
            if (!user) {
              throw new Error('البريد الإلكتروني غير موجود')
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

            if (!isPasswordValid) {
              throw new Error('كلمة المرور غير صحيحة')
            }

            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role
            }
          } finally {
            client.release()
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
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
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 