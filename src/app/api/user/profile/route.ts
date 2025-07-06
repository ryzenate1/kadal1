import { NextRequest, NextResponse } from 'next/server';

// Mock user data - in a real app, this would come from a database
let mockUsers = {
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

// GET /api/user/profile - Get user profile data
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user from the session/token
    const userEmail = 'testuser@kadalthunai.com'; // Mock authentication
    
    const user = mockUsers[userEmail as keyof typeof mockUsers];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/user/profile - Update user profile data
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Valid 10-digit phone number is required' },
        { status: 400 }
      );
    }

    // In a real app, you'd get the user from the session/token
    const userEmail = 'testuser@kadalthunai.com'; // Mock authentication
    
    const user = mockUsers[userEmail as keyof typeof mockUsers];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user data
    mockUsers = {
      ...mockUsers,
      [userEmail]: {
        ...user,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.replace(/\D/g, ''),
      }
    };

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockUsers[userEmail]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
