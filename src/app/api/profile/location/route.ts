import { NextRequest, NextResponse } from 'next/server';

// PUT /api/profile/location - Update the current user's active location
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.addressId) {
      return NextResponse.json(
        { error: 'Missing required field: addressId' }, 
        { status: 400 }
      );
    }
    
    // In a real app, we would update the user's current address in the database
    // For our mock, we're just returning success
    
    // Save to localStorage on the client side instead
    
    return NextResponse.json({ 
      success: true,
      message: `Location updated to address ID: ${body.addressId}`
    });
  } catch (error) {
    console.error('Error updating current location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
