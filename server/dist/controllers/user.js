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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const index_1 = require("../index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = yield index_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                loyaltyPoints: true,
                loyaltyTier: true,
                addresses: {
                    where: { isDefault: true },
                    take: 1
                }
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProfile = getProfile;
// Update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { name, email, phoneNumber } = req.body;
        // Validate input
        if (!name && !email && !phoneNumber) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        // Check if email or phone is already taken by another user
        if (email || phoneNumber) {
            const existingUser = yield index_1.prisma.user.findFirst({
                where: {
                    OR: [
                        email ? { email } : {},
                        phoneNumber ? { phoneNumber } : {}
                    ],
                    NOT: { id: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Email or phone number already in use'
                });
            }
        }
        // Update user
        const updatedUser = yield index_1.prisma.user.update({
            where: { id: req.user.id },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (email && { email })), (phoneNumber && { phoneNumber })),
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                loyaltyPoints: true,
                loyaltyTier: true
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProfile = updateProfile;
// Change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { currentPassword, newPassword } = req.body;
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required'
            });
        }
        // Get user with password
        const user = yield index_1.prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        yield index_1.prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.changePassword = changePassword;
// Get user addresses
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const addresses = yield index_1.prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { isDefault: 'desc' }
        });
        res.status(200).json(addresses);
    }
    catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAddresses = getAddresses;
// Add a new address
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { name, address, city, state, pincode, isDefault } = req.body;
        // Validate input
        if (!name || !address || !city || !state || !pincode) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // If this is the default address, unset any existing default
        if (isDefault) {
            yield index_1.prisma.address.updateMany({
                where: { userId: req.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }
        // Create address
        const newAddress = yield index_1.prisma.address.create({
            data: {
                userId: req.user.id,
                name,
                address,
                city,
                state,
                pincode,
                isDefault: isDefault || false
            }
        });
        res.status(201).json(newAddress);
    }
    catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addAddress = addAddress;
// Update an address
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { id } = req.params;
        const { name, address, city, state, pincode, isDefault } = req.body;
        // Check if address exists and belongs to user
        const existingAddress = yield index_1.prisma.address.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existingAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // If this is being set as default, unset any existing default
        if (isDefault) {
            yield index_1.prisma.address.updateMany({
                where: { userId: req.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }
        // Update address
        const updatedAddress = yield index_1.prisma.address.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (address && { address })), (city && { city })), (state && { state })), (pincode && { pincode })), (isDefault !== undefined && { isDefault }))
        });
        res.status(200).json(updatedAddress);
    }
    catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateAddress = updateAddress;
// Delete an address
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { id } = req.params;
        // Check if address exists and belongs to user
        const address = yield index_1.prisma.address.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // Delete address
        yield index_1.prisma.address.delete({ where: { id } });
        // If this was the default address, set another as default if available
        if (address.isDefault) {
            const anotherAddress = yield index_1.prisma.address.findFirst({
                where: { userId: req.user.id }
            });
            if (anotherAddress) {
                yield index_1.prisma.address.update({
                    where: { id: anotherAddress.id },
                    data: { isDefault: true }
                });
            }
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    }
    catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteAddress = deleteAddress;
