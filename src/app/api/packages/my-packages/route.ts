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
         JOIN "Status" s ON p.status_id = s.id 
         WHERE p.user_id = $1 
         ORDER BY p.created_at DESC`,
        [userId]
      )

      // Format the response
      const packages = packagesResult.rows.map(pkg => ({
        id: pkg.id,
        trackingNumber: pkg.tracking_number,
        status: pkg.status_name,
        currentLocation: pkg.current_location,
        lastUpdated: pkg.updated_at
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