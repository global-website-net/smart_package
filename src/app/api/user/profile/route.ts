import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'

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

    // Get user profile
    const client = await pool.connect()
    try {
      console.log('Fetching user profile for:', session.user.email)
      
      // Get full user profile
      const result = await client.query(
        'SELECT id, email, "fullName", role, "createdAt" FROM "User" WHERE email = $1',
        [session.user.email]
      )

      if (result.rows.length === 0) {
        console.log('User not found in database')
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      const user = result.rows[0]
      console.log('User profile fetched successfully:', user)
      
      return NextResponse.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      })
    } catch (dbError) {
      console.error('Database error in GET profile:', dbError)
      throw dbError
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { fullName, currentPassword, newPassword } = body

    // Get user profile
    const client = await pool.connect()
    try {
      // Get current user data
      const userResult = await client.query(
        'SELECT * FROM "User" WHERE email = $1',
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      const user = userResult.rows[0]

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { message: 'Current password is required' },
            { status: 400 }
          )
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
          return NextResponse.json(
            { message: 'Current password is incorrect' },
            { status: 400 }
          )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user with new password
        await client.query(
          `UPDATE "User" 
           SET "fullName" = $1, password = $2, "updatedAt" = NOW() 
           WHERE email = $3`,
          [fullName, hashedPassword, session.user.email]
        )
      } else {
        // Update user without changing password
        await client.query(
          `UPDATE "User" 
           SET "fullName" = $1, "updatedAt" = NOW() 
           WHERE email = $2`,
          [fullName, session.user.email]
        )
      }

      // Get updated user data
      const updatedResult = await client.query(
        'SELECT id, email, "fullName", role, "createdAt" FROM "User" WHERE email = $1',
        [session.user.email]
      )

      return NextResponse.json(updatedResult.rows[0])
    } catch (dbError) {
      console.error('Database error in PUT profile:', dbError)
      throw dbError
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 