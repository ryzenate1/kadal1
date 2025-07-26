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
const express_1 = __importDefault(require("express"));
const index_1 = require("../index");
const router = express_1.default.Router();
// Get all shipping methods
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shippingMethods = yield index_1.prisma.shippingMethod.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ shippingMethods });
    }
    catch (error) {
        console.error('Error fetching shipping methods:', error);
        res.status(500).json({
            message: 'Error fetching shipping methods',
            error: error.message
        });
    }
}));
// Get active shipping methods only
router.get('/active', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shippingMethods = yield index_1.prisma.shippingMethod.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json({ shippingMethods });
    }
    catch (error) {
        console.error('Error fetching active shipping methods:', error);
        res.status(500).json({
            message: 'Error fetching active shipping methods',
            error: error.message
        });
    }
}));
// Get specific shipping method by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const shippingMethod = yield index_1.prisma.shippingMethod.findUnique({
            where: { id }
        });
        if (!shippingMethod) {
            return res.status(404).json({ message: 'Shipping method not found' });
        }
        res.json(shippingMethod);
    }
    catch (error) {
        console.error('Error fetching shipping method:', error);
        res.status(500).json({
            message: 'Error fetching shipping method',
            error: error.message
        });
    }
}));
// Create new shipping method
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, estimatedDeliveryDays, isActive, order } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({
                message: 'Name and price are required'
            });
        }
        const shippingMethod = yield index_1.prisma.shippingMethod.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                estimatedDeliveryDays: parseInt(estimatedDeliveryDays) || 1,
                isActive: isActive !== undefined ? isActive : true,
                order: parseInt(order) || 0
            }
        });
        res.status(201).json({
            message: 'Shipping method created successfully',
            shippingMethod
        });
    }
    catch (error) {
        console.error('Error creating shipping method:', error);
        res.status(500).json({
            message: 'Error creating shipping method',
            error: error.message
        });
    }
}));
// Update shipping method
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price, estimatedDeliveryDays, isActive, order } = req.body;
        const updateData = {
            updatedAt: new Date()
        };
        if (name)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (estimatedDeliveryDays !== undefined)
            updateData.estimatedDeliveryDays = parseInt(estimatedDeliveryDays);
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (order !== undefined)
            updateData.order = parseInt(order);
        const shippingMethod = yield index_1.prisma.shippingMethod.update({
            where: { id },
            data: updateData
        });
        res.json({
            message: 'Shipping method updated successfully',
            shippingMethod
        });
    }
    catch (error) {
        console.error('Error updating shipping method:', error);
        res.status(500).json({
            message: 'Error updating shipping method',
            error: error.message
        });
    }
}));
// Delete shipping method
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield index_1.prisma.shippingMethod.delete({
            where: { id }
        });
        res.json({ message: 'Shipping method deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting shipping method:', error);
        res.status(500).json({
            message: 'Error deleting shipping method',
            error: error.message
        });
    }
}));
// Update shipping method order
router.put('/:id/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { order } = req.body;
        if (order === undefined) {
            return res.status(400).json({ message: 'Order is required' });
        }
        const shippingMethod = yield index_1.prisma.shippingMethod.update({
            where: { id },
            data: {
                order: parseInt(order),
                updatedAt: new Date()
            }
        });
        res.json({
            message: 'Shipping method order updated successfully',
            shippingMethod
        });
    }
    catch (error) {
        console.error('Error updating shipping method order:', error);
        res.status(500).json({
            message: 'Error updating shipping method order',
            error: error.message
        });
    }
}));
// Toggle shipping method active status
router.put('/:id/toggle', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const currentMethod = yield index_1.prisma.shippingMethod.findUnique({
            where: { id }
        });
        if (!currentMethod) {
            return res.status(404).json({ message: 'Shipping method not found' });
        }
        const shippingMethod = yield index_1.prisma.shippingMethod.update({
            where: { id },
            data: {
                isActive: !currentMethod.isActive,
                updatedAt: new Date()
            }
        });
        res.json({
            message: 'Shipping method status updated successfully',
            shippingMethod
        });
    }
    catch (error) {
        console.error('Error toggling shipping method status:', error);
        res.status(500).json({
            message: 'Error toggling shipping method status',
            error: error.message
        });
    }
}));
exports.default = router;
