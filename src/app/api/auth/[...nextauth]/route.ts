import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      fullName?: string | null
      email?: string | null
      role: 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'
    }
  }
  interface User {
    id: string
    fullName?: string | null
    email: string
    role: 'REGULAR' | 'SHOP' | 'ADMIN' | 'OWNER'
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          // Create a test user if it doesn't exist
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            const newUser = await prisma.user.create({
              data: {
                email: "test@example.com",
                fullName: "Test User",
                password: await bcrypt.hash("password", 10),
                role: "ADMIN",
                governorate: "Test Governorate",
                town: "Test Town",
                phonePrefix: "+1",
                phoneNumber: "1234567890"
              }
            })
            return {
              id: newUser.id,
              email: newUser.email,
              fullName: newUser.fullName,
              role: newUser.role
            }
          }
          throw new Error('User not found')
        }

        // For existing users, verify password
        if (!user.password) {
          throw new Error('Invalid password')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST } 