import { NextRequest, NextResponse } from 'next/server';

// Mock loyalty data
const mockLoyaltyData = {
  summary: {
    currentPoints: 750,
    totalEarned: 1250,
    totalRedeemed: 500,
    currentTier: 'Silver',
    nextTier: 'Gold',
    pointsToNextTier: 750
  },
  activities: [
    {
      id: "la_001",
      type: "earned",
      points: 45,
      description: "Points earned from order #KT2025001",
      createdAt: "2025-06-10T15:45:00Z",
      orderId: "ord_001"
    },
    {
      id: "la_002",
      type: "redeemed",
      points: -100,
      description: "Redeemed for ₹10 discount",
      createdAt: "2025-06-05T12:30:00Z"
    },
    {
      id: "la_003",
      type: "earned",
      points: 65,
      description: "Points earned from order #KT2025002",
      createdAt: "2025-06-15T11:20:00Z",
      orderId: "ord_002"
    },
    {
      id: "la_004",
      type: "earned",
      points: 20,
      description: "Birthday bonus points",
      createdAt: "2025-06-01T00:00:00Z"
    }
  ]
};

// GET /api/user/loyalty - Get user loyalty data
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd:
    // const session = await getServerSession(authOptions);
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   include: { loyaltyActivities: { orderBy: { createdAt: 'desc' } } }
    // });

    return NextResponse.json(mockLoyaltyData);
  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
