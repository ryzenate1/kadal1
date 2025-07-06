import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    methodId: string;
  }>;
}

export async function DELETE(
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
    // 3. Ensure it's not the only payment method (if required)
    // 4. Delete the payment method from the database
    // 5. If it was the default payment method, set another as default

    // For now, simulate a successful deletion
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      methodId,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
