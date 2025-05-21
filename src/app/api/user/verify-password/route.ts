import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in verify-password:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من كلمة المرور' },
      { status: 500 }
    );
  }
} 