export async function POST(req: Request) {
  try {
    const { trackingNumber, status, shopId, currentLocation, userId, scannerCode } = await req.json();

    const { data: package, error } = await supabase
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

    return NextResponse.json(package);
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
} 