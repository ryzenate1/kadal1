import { NextRequest, NextResponse } from 'next/server';

// Mock payment methods data
let mockPaymentMethods = [
  {
    id: "pm_001",
    type: "card",
    cardNumber: "4567",
    cardBrand: "Visa",
    cardHolderName: "Test User",
    expiryDate: "12/28",
    nickname: "Primary Card",
    isDefault: true
  },
  {
    id: "pm_002",
    type: "upi",
    upiId: "testuser@paytm",
    nickname: "Paytm UPI",
    isDefault: false
  }
];

// GET /api/user/payment-methods - Get user payment methods
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockPaymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { type, nickname, isDefault = false, ...otherFields } = body;
    
    if (!type || !nickname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this is set as default, make all others non-default
    if (isDefault) {
      mockPaymentMethods = mockPaymentMethods.map(pm => ({ ...pm, isDefault: false }));
    }

    const newMethod = {
      id: `pm_${Date.now()}`,
      type,
      nickname,
      isDefault,
      ...otherFields
    };

    // For card, store only last 4 digits
    if (type === 'card' && otherFields.cardNumber) {
      newMethod.cardNumber = otherFields.cardNumber.slice(-4);
    }

    mockPaymentMethods.push(newMethod);

    return NextResponse.json(newMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
