import { PrismaClient } from '@prisma/client'

// This is a workaround for the "prepared statement already exists" error in serverless environments
// See: https://github.com/prisma/prisma/issues/5001
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production, create a new client for each request
  prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
} else {
  // In development, use a singleton to avoid too many connections
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }
  prisma = (global as any).prisma
}

export default prisma 