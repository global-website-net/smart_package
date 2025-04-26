import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if user is admin or owner
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      return NextResponse.json({ error: 'حدث خطأ في التحقق من الصلاحيات' }, { status: 500 })
    }

    if (userData.role !== 'ADMIN' && userData.role !== 'OWNER') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
    }

    // Read the SQL script
    const sqlFilePath = path.join(process.cwd(), 'src', 'app', 'api', 'shops', 'create_shop_table.sql')
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8')

    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript })

    if (error) {
      console.error('Error executing SQL script:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'تم إنشاء جدول المتاجر بنجاح' })
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 