import { NextRequest, NextResponse } from 'next/server';

// Mock user data - in a real app, this would come from a database
const mockUsers: Record<string, any> = {
  'testuser@kadalthunai.com': {
    id: 'user_123',
    name: 'Test User',
    email: 'testuser@kadalthunai.com',
    phoneNumber: '9876543210',
    profileImage: null,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    totalOrders: 5,
    savedAmount: 250,
    loyaltyPoints: 150,
    notificationsEnabled: true,
    isActive: true
  }
};

// PATCH /api/user/update - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    // In a real app, you'd get the user from the session/token
    const userEmail = 'testuser@kadalthunai.com'; // Mock authentication
    
    const user = mockUsers[userEmail];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phoneNumber } = body;

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    
    if (email && typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    
    if (phoneNumber && typeof phoneNumber !== 'string') {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Update user data
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Update the mock database
    mockUsers[userEmail] = user;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
