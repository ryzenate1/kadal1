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
exports.deleteTrustedBadge = exports.updateTrustedBadge = exports.createTrustedBadge = exports.getTrustedBadgeById = exports.getAllTrustedBadges = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Default trusted badges data
const defaultBadges = [
    {
        title: 'Fresh Guarantee',
        description: 'All seafood is guaranteed fresh',
        iconName: 'Shield',
        order: 1,
        isActive: true,
    },
    {
        title: 'Fast Delivery',
        description: 'Same day delivery available',
        iconName: 'Clock',
        order: 2,
        isActive: true,
    },
    {
        title: 'Quality Assured',
        description: 'Premium quality seafood',
        iconName: 'BadgeCheck',
        order: 3,
        isActive: true,
    },
    {
        title: 'Sustainably Sourced',
        description: 'Environmentally responsible practices',
        iconName: 'Star',
        order: 4,
        isActive: true,
    }
];
// Function to seed default badges if none exist
const seedDefaultBadges = () => __awaiter(void 0, void 0, void 0, function* () {
    const badgeCount = yield prisma.trustedBadge.count();
    if (badgeCount === 0) {
        console.log('No trusted badges found, seeding defaults...');
        try {
            yield prisma.trustedBadge.createMany({
                data: defaultBadges
            });
            console.log('Default trusted badges created successfully');
        }
        catch (error) {
            console.error('Error seeding default trusted badges:', error);
        }
    }
});
// Get all trusted badges
const getAllTrustedBadges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try to seed default badges if needed
        yield seedDefaultBadges();
        const badges = yield prisma.trustedBadge.findMany({
            orderBy: { order: 'asc' }
        });
        return res.json(badges);
    }
    catch (error) {
        console.error("Error fetching trusted badges:", error);
        return res.status(500).json({ message: "Failed to fetch trusted badges", error: error.message });
    }
});
exports.getAllTrustedBadges = getAllTrustedBadges;
// Get single trusted badge by ID
const getTrustedBadgeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const badge = yield prisma.trustedBadge.findUnique({
            where: { id }
        });
        if (!badge) {
            return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
        }
        return res.json(badge);
    }
    catch (error) {
        console.error(`Error fetching trusted badge ${id}:`, error);
        return res.status(500).json({ message: "Failed to fetch trusted badge", error: error.message });
    }
});
exports.getTrustedBadgeById = getTrustedBadgeById;
// Create a new trusted badge
const createTrustedBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, iconName, order, isActive } = req.body;
    // Validation
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const newBadge = yield prisma.trustedBadge.create({
            data: {
                title,
                description: description || "",
                iconName: iconName || "Shield",
                order: order !== undefined ? order : 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        return res.status(201).json(newBadge);
    }
    catch (error) {
        console.error("Error creating trusted badge:", error);
        return res.status(500).json({ message: "Failed to create trusted badge", error: error.message });
    }
});
exports.createTrustedBadge = createTrustedBadge;
// Update an existing trusted badge
const updateTrustedBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, iconName, order, isActive } = req.body;
    // Validation
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        // First check if the badge exists
        const existingBadge = yield prisma.trustedBadge.findUnique({
            where: { id }
        });
        if (!existingBadge) {
            return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
        }
        // Update the badge
        const updatedBadge = yield prisma.trustedBadge.update({
            where: { id },
            data: {
                title,
                description: description !== undefined ? description : existingBadge.description,
                iconName: iconName !== undefined ? iconName : existingBadge.iconName,
                order: order !== undefined ? order : existingBadge.order,
                isActive: isActive !== undefined ? isActive : existingBadge.isActive
            }
        });
        return res.json(updatedBadge);
    }
    catch (error) {
        console.error(`Error updating trusted badge ${id}:`, error);
        return res.status(500).json({ message: "Failed to update trusted badge", error: error.message });
    }
});
exports.updateTrustedBadge = updateTrustedBadge;
// Delete a trusted badge
const deleteTrustedBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // First check if the badge exists
        const existingBadge = yield prisma.trustedBadge.findUnique({
            where: { id }
        });
        if (!existingBadge) {
            return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
        }
        // Delete the badge
        yield prisma.trustedBadge.delete({
            where: { id }
        });
        return res.json({ message: `Trusted badge with ID ${id} has been deleted` });
    }
    catch (error) {
        console.error(`Error deleting trusted badge ${id}:`, error);
        return res.status(500).json({ message: "Failed to delete trusted badge", error: error.message });
    }
});
exports.deleteTrustedBadge = deleteTrustedBadge;
