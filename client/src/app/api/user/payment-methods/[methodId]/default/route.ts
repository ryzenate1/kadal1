import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    methodId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { methodId } = params;

    if (!methodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Verify the user's authentication
    // 2. Check if the payment method belongs to the authenticated user
    // 3. Update all other payment methods to set isDefault: false
    // 4. Update the specified payment method to set isDefault: true

    // For now, simulate a successful default payment method update
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      methodId,
      message: 'Default payment method updated successfully'
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}
