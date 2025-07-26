import { Request, Response } from 'express';
import { prisma } from '../index';

// Get user's loyalty information
export const getLoyaltyInfo = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        loyaltyPoints: true,
        loyaltyTier: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get tier thresholds
    const tierThresholds = {
      Bronze: 0,
      Silver: 1000,
      Gold: 2000,
      Platinum: 5000
    };

    // Calculate next tier
    let nextTier = null;
    let pointsToNextTier = 0;

    if (user.loyaltyTier === 'Bronze') {
      nextTier = 'Silver';
      pointsToNextTier = tierThresholds.Silver - user.loyaltyPoints;
    } else if (user.loyaltyTier === 'Silver') {
      nextTier = 'Gold';
      pointsToNextTier = tierThresholds.Gold - user.loyaltyPoints;
    } else if (user.loyaltyTier === 'Gold') {
      nextTier = 'Platinum';
      pointsToNextTier = tierThresholds.Platinum - user.loyaltyPoints;
    }

    // Calculate progress percentage
    let progressPercentage = 0;
    if (nextTier) {
      const currentTierThreshold = tierThresholds[user.loyaltyTier as keyof typeof tierThresholds];
      const nextTierThreshold = tierThresholds[nextTier as keyof typeof tierThresholds];
      const pointsInCurrentTier = user.loyaltyPoints - currentTierThreshold;
      const pointsRequiredForNextTier = nextTierThreshold - currentTierThreshold;
      progressPercentage = Math.min(100, Math.round((pointsInCurrentTier / pointsRequiredForNextTier) * 100));
    } else {
      progressPercentage = 100; // Already at highest tier
    }

    res.status(200).json({
      ...user,
      nextTier,
      pointsToNextTier,
      progressPercentage
    });
  } catch (error) {
    console.error('Get loyalty info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's loyalty activity
export const getLoyaltyActivity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get loyalty activities from the dedicated table
    const loyaltyActivities = await prisma.loyaltyActivity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to most recent 10 activities
    });

    // Get orders that earned points
    const orders = await prisma.order.findMany({
      where: { 
        userId: req.user.id,
        pointsEarned: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        pointsEarned: true,
        createdAt: true,
        status: true
      },
      take: 5 // Limit to most recent 5 orders
    });

    res.status(200).json({
      activities: loyaltyActivities,
      orders
    });
  } catch (error) {
    console.error('Get loyalty activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Redeem loyalty points
export const redeemPoints = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { points, description } = req.body;

    // Validate input
    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Valid points amount required' });
    }

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough points
    if (user.loyaltyPoints < points) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }

    // Update user's points
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        loyaltyPoints: user.loyaltyPoints - points
      }
    });

    // Record the redemption
    await prisma.loyaltyActivity.create({
      data: {
        userId: req.user.id,
        points: -points, // Negative to indicate redemption
        type: 'redeemed',
        description
      }
    });

    // Update user's tier if needed
    await updateUserTier(req.user.id);

    res.status(200).json({
      message: 'Points redeemed successfully',
      currentPoints: updatedUser.loyaltyPoints
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update user's loyalty tier
async function updateUserTier(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true }
    });

    if (!user) return;

    let newTier = 'Bronze';
    if (user.loyaltyPoints >= 5000) {
      newTier = 'Platinum';
    } else if (user.loyaltyPoints >= 2000) {
      newTier = 'Gold';
    } else if (user.loyaltyPoints >= 1000) {
      newTier = 'Silver';
    }

    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyTier: newTier }
    });
  } catch (error) {
    console.error('Update tier error:', error);
  }
}
