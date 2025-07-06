import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    addressId: string;
  }>;
}

// Mock addresses data (shared with main route)
let mockAddresses = [
  {
    id: "addr_001",
    name: "Home",
    address: "123 Main Street, Apartment 4B",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    type: "home",
    isDefault: true
  },
  {
    id: "addr_002",
    name: "Office",
    address: "456 Tech Park, 3rd Floor",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600113",
    type: "work",
    isDefault: false
  }
];

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const { addressId } = params;
    const body = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { name, address, city, state, pincode, type = 'home', isDefault = false } = body;
    
    if (!name || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the address to update
    const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If this is set as default, make all others non-default
    if (isDefault) {
      mockAddresses = mockAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    // Update the address
    const updatedAddress = {
      ...mockAddresses[addressIndex],
      name,
      address,
      city,
      state,
      pincode,
      type,
      isDefault
    };

    mockAddresses[addressIndex] = updatedAddress;

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Find and remove the address
    const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const deletedAddress = mockAddresses[addressIndex];
    mockAddresses.splice(addressIndex, 1);

    // If the deleted address was default and there are other addresses, make the first one default
    if (deletedAddress.isDefault && mockAddresses.length > 0) {
      mockAddresses[0].isDefault = true;
    }

    return NextResponse.json({
      success: true,
      addressId,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
