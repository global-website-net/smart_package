import { PrismaClient } from '@prisma/client'

// This is a workaround for the "prepared statement already exists" error in serverless environments
// See: https://github.com/prisma/prisma/issues/5001
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    // Use connection pooling in production
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 