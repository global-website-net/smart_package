import { PrismaClient, UserRole } from '@prisma/client'
import { Pool } from 'pg'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
})

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error'],
})

// Database operations using direct PostgreSQL queries
export const db = {
  // Check if a user exists by email
  async userExists(email: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT id FROM "User" WHERE email = $1',
        [email]
      )
      return result.rows.length > 0
    } finally {
      client.release()
    }
  },

  // Create a new user
  async createUser(userData: {
    email: string
    password: string
    fullName: string
    governorate: string
    town: string
    phonePrefix: string
    phoneNumber: string
    role: UserRole
  }) {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO "User" (
          "email", "password", "fullName", "governorate", "town", 
          "phonePrefix", "phoneNumber", "role", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          userData.email,
          userData.password,
          userData.fullName,
          userData.governorate,
          userData.town,
          userData.phonePrefix,
          userData.phoneNumber,
          userData.role,
        ]
      )
      return result.rows[0]
    } finally {
      client.release()
    }
  },

  // Delete a user by ID
  async deleteUser(id: string) {
    const client = await pool.connect()
    try {
      await client.query('DELETE FROM "User" WHERE id = $1', [id])
    } finally {
      client.release()
    }
  },

  // Test database connection
  async testConnection() {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT 1 as test')
      return result.rows[0]
    } finally {
      client.release()
    }
  }
}

// Export Prisma client for other operations
export { prisma } 