import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { trackingNumber } = body

    if (!trackingNumber) {
      return NextResponse.json(
        { message: 'Tracking number is required' },
        { status: 400 }
      )
    }

    // Find the package
    const client = await pool.connect()
    try {
      // Get package details
      const packageResult = await client.query(
        `SELECT p.*, s.name as status_name 
         FROM "Package" p 
         JOIN "Status" s ON p.status_id = s.id 
         WHERE p.tracking_number = $1`,
        [trackingNumber]
      )

      if (packageResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'Package not found' },
          { status: 404 }
        )
      }

      const packageData = packageResult.rows[0]

      // Get package history
      const historyResult = await client.query(
        `SELECT h.*, s.name as status_name 
         FROM "PackageHistory" h 
         JOIN "Status" s ON h.status_id = s.id 
         WHERE h.package_id = $1 
         ORDER BY h.timestamp DESC`,
        [packageData.id]
      )

      // Format the response
      const formattedResponse = {
        trackingNumber: packageData.tracking_number,
        status: packageData.status_name,
        currentLocation: packageData.current_location,
        lastUpdated: packageData.updated_at,
        history: historyResult.rows.map(item => ({
          status: item.status_name,
          location: item.location,
          timestamp: item.timestamp,
        })),
      }

      return NextResponse.json(formattedResponse)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error tracking package:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 