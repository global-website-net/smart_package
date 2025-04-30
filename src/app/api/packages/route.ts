import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { trackingNumber, status, shopId, currentLocation, userId, scannerCode } = await req.json();

    const { data: packageData, error } = await supabase
      .from('Package')
      .insert([
        {
          trackingNumber,
          status,
          shopId,
          currentLocation,
          userId,
          scannerCode,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(packageData);
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
} 