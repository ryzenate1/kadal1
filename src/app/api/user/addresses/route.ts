import { NextRequest, NextResponse } from 'next/server';

// Mock addresses data - in a real app, this would come from Prisma database
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

// GET /api/user/addresses - Get user addresses
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd:
    // const session = await getServerSession(authOptions);
    // const addresses = await prisma.address.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { isDefault: 'desc' }
    // });

    return NextResponse.json(mockAddresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, address, city, state, pincode, type = 'home', isDefault = false } = body;
    
    if (!name || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this is set as default, make all others non-default
    if (isDefault) {
      mockAddresses = mockAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const newAddress = {
      id: `addr_${Date.now()}`,
      name,
      address,
      city,
      state,
      pincode,
      type,
      isDefault
    };

    mockAddresses.push(newAddress);    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/addresses - Update address (bulk operation, but we'll use the individual route)
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Use PUT /api/user/addresses/{id} for updates' }, { status: 400 });
}
