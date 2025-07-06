import { NextRequest, NextResponse } from 'next/server';

// Mock data for development/testing
const mockAddresses = [
  {
    id: '1',
    user_id: 'user-1',
    lat: 13.0827,
    lng: 80.2707,
    address_string: '123 Anna Nagar, Chennai, Tamil Nadu 600040',
    door_no: '123',
    building: 'Green Valley Apartments',
    landmark: 'Near Anna Nagar Tower',
    tag: 'Home',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    lat: 13.0569,
    lng: 80.2425,
    address_string: '45 Mount Road, Chennai, Tamil Nadu 600002',
    door_no: '45',
    building: 'Ascendas Tech Park',
    landmark: 'Opposite to Spencer Plaza',
    tag: 'Work',
    created_at: new Date().toISOString()
  }
];

// GET /api/addresses - Get all addresses for the current user
export async function GET(req: NextRequest) {
  try {
    // For demo purposes, always return the mock addresses
    return NextResponse.json(mockAddresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/addresses - Create a new address
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.lat || !body.lng || !body.door_no) {
      return NextResponse.json(
        { error: 'Missing required fields (lat, lng, door_no)' }, 
        { status: 400 }
      );
    }
    
    // Create a mock address
    const newAddress = {
      id: `mock-${Date.now()}`,
      user_id: 'user-1',
      lat: body.lat,
      lng: body.lng,
      address_string: body.address_string || '',
      door_no: body.door_no,
      building: body.building || '',
      landmark: body.landmark || '',
      tag: body.tag || 'Home',
      created_at: new Date().toISOString()
    };
    
    // In a real app, this would be saved to a database
    // For our mock, we're just returning it
    
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
