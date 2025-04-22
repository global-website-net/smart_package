import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's packages
    const client = await pool.connect()
    try {
      // First get the user ID
      const userResult = await client.query(
        'SELECT id FROM "User" WHERE email = $1',
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      const userId = userResult.rows[0].id

      // Get user's packages
      const packagesResult = await client.query(
        `SELECT p.*, s.name as status_name 
         FROM "Package" p 
         LEFT JOIN "Status" s ON p.status = s.name 
         WHERE p."userId" = $1 
         ORDER BY p."createdAt" DESC`,
        [userId]
      )

      // Format the response
      const packages = packagesResult.rows.map(pkg => ({
        id: pkg.id,
        trackingNumber: pkg.trackingNumber,
        status: pkg.status,
        currentLocation: pkg.description || 'Not specified',
        lastUpdated: pkg.updatedAt
      }))

      return NextResponse.json(packages)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user packages:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 