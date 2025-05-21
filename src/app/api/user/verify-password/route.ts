import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة.' }, { status: 400 });
    }
    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('User')
      .select('id, password')
      .eq('email', email)
      .single();
    if (error || !user || !user.password) {
      return NextResponse.json({ error: 'المستخدم غير موجود أو لا يملك كلمة مرور.' }, { status: 404 });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة.' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ أثناء التحقق من كلمة المرور.' }, { status: 500 });
  }
} 