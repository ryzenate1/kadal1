import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    addressId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { addressId } = params;

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Verify the user's authentication
    // 2. Check if the address belongs to the authenticated user
    // 3. Update all other addresses to set isDefault: false
    // 4. Update the specified address to set isDefault: true

    // For now, simulate a successful default address update
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      addressId,
      message: 'Default address updated successfully'
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    );
  }
}
