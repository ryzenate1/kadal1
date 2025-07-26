"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemPoints = exports.getLoyaltyActivity = exports.getLoyaltyInfo = void 0;
const index_1 = require("../index");
// Get user's loyalty information
const getLoyaltyInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = yield index_1.prisma.user.findUnique({
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
        }
        else if (user.loyaltyTier === 'Silver') {
            nextTier = 'Gold';
            pointsToNextTier = tierThresholds.Gold - user.loyaltyPoints;
        }
        else if (user.loyaltyTier === 'Gold') {
            nextTier = 'Platinum';
            pointsToNextTier = tierThresholds.Platinum - user.loyaltyPoints;
        }
        // Calculate progress percentage
        let progressPercentage = 0;
        if (nextTier) {
            const currentTierThreshold = tierThresholds[user.loyaltyTier];
            const nextTierThreshold = tierThresholds[nextTier];
            const pointsInCurrentTier = user.loyaltyPoints - currentTierThreshold;
            const pointsRequiredForNextTier = nextTierThreshold - currentTierThreshold;
            progressPercentage = Math.min(100, Math.round((pointsInCurrentTier / pointsRequiredForNextTier) * 100));
        }
        else {
            progressPercentage = 100; // Already at highest tier
        }
        res.status(200).json(Object.assign(Object.assign({}, user), { nextTier,
            pointsToNextTier,
            progressPercentage }));
    }
    catch (error) {
        console.error('Get loyalty info error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getLoyaltyInfo = getLoyaltyInfo;
// Get user's loyalty activity
const getLoyaltyActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        // Get loyalty activities from the dedicated table
        const loyaltyActivities = yield index_1.prisma.loyaltyActivity.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit to most recent 10 activities
        });
        // Get orders that earned points
        const orders = yield index_1.prisma.order.findMany({
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
    }
    catch (error) {
        console.error('Get loyalty activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getLoyaltyActivity = getLoyaltyActivity;
// Redeem loyalty points
const redeemPoints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield index_1.prisma.user.findUnique({
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
        const updatedUser = yield index_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                loyaltyPoints: user.loyaltyPoints - points
            }
        });
        // Record the redemption
        yield index_1.prisma.loyaltyActivity.create({
            data: {
                userId: req.user.id,
                points: -points, // Negative to indicate redemption
                type: 'redeemed',
                description
            }
        });
        // Update user's tier if needed
        yield updateUserTier(req.user.id);
        res.status(200).json({
            message: 'Points redeemed successfully',
            currentPoints: updatedUser.loyaltyPoints
        });
    }
    catch (error) {
        console.error('Redeem points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.redeemPoints = redeemPoints;
// Helper function to update user's loyalty tier
function updateUserTier(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield index_1.prisma.user.findUnique({
                where: { id: userId },
                select: { loyaltyPoints: true }
            });
            if (!user)
                return;
            let newTier = 'Bronze';
            if (user.loyaltyPoints >= 5000) {
                newTier = 'Platinum';
            }
            else if (user.loyaltyPoints >= 2000) {
                newTier = 'Gold';
            }
            else if (user.loyaltyPoints >= 1000) {
                newTier = 'Silver';
            }
            yield index_1.prisma.user.update({
                where: { id: userId },
                data: { loyaltyTier: newTier }
            });
        }
        catch (error) {
            console.error('Update tier error:', error);
        }
    });
}
