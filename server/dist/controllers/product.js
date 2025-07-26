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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductByIdOrSlug = exports.getAllProducts = void 0;
const index_1 = require("../index");
const generateProductSlug = (name) => {
    if (!name)
        return Math.random().toString(36).substring(2, 15); // Fallback for safety
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};
// Get all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId, featured, tag } = req.query;
        const where = {};
        if (categoryId)
            where.categoryId = String(categoryId);
        if (featured === 'true')
            where.featured = true;
        if (featured === 'false')
            where.featured = false;
        if (tag)
            where.tag = String(tag);
        const products = yield index_1.prisma.product.findMany({
            where,
            include: { category: true }, // To include category details
            orderBy: { name: 'asc' }
        });
        res.status(200).json(products);
    }
    catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllProducts = getAllProducts;
// Get product by ID or SLUG
const getProductByIdOrSlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idOrSlug } = req.params;
        // Try finding by ID first, then by slug
        let product = yield index_1.prisma.product.findUnique({
            where: { id: idOrSlug },
            include: { category: true }
        });
        if (!product) {
            product = yield index_1.prisma.product.findUnique({
                where: { slug: idOrSlug },
                include: { category: true }
            });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error('Get product by id/slug error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProductByIdOrSlug = getProductByIdOrSlug;
// Create product (admin only)
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { name, slug, description, price, originalPrice, imageUrl, weight, tag, featured, stock, categoryId } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (!slug) {
            slug = generateProductSlug(name);
        }
        if (price === undefined || price === null) {
            return res.status(400).json({ message: 'Product price is required' });
        }
        // Add validation for product creation
        const { name: reqName, price: reqPrice, categoryId: reqCategoryId } = req.body;
        if (!reqName || !reqPrice || !reqCategoryId) {
            return res.status(400).json({ message: 'Name, price, and categoryId are required' });
        }
        const product = yield index_1.prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
                imageUrl,
                weight,
                tag,
                featured: Boolean(featured), stock: parseInt(stock, 10) || 0,
                categoryId
            },
            include: { category: true }
        });
        res.status(201).json(product);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slug'))) {
            return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
        }
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createProduct = createProduct;
// Update product (admin only)
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        let { name, slug, description, price, originalPrice, imageUrl, weight, tag, featured, stock, categoryId } = req.body;
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (description !== undefined)
            dataToUpdate.description = description;
        if (price !== undefined)
            dataToUpdate.price = parseFloat(price);
        if (originalPrice !== undefined)
            dataToUpdate.originalPrice = originalPrice ? parseFloat(originalPrice) : null; // Allow clearing originalPrice
        if (imageUrl !== undefined)
            dataToUpdate.imageUrl = imageUrl;
        if (weight !== undefined)
            dataToUpdate.weight = weight;
        if (tag !== undefined)
            dataToUpdate.tag = tag;
        if (featured !== undefined)
            dataToUpdate.featured = Boolean(featured);
        if (stock !== undefined)
            dataToUpdate.stock = parseInt(stock, 10);
        if (categoryId !== undefined)
            dataToUpdate.categoryId = categoryId;
        if (name && (!slug || slug === dataToUpdate.slug)) { // If name is updated and slug is not, or slug is the same as old one (from potentially previous payload)
            dataToUpdate.slug = generateProductSlug(name);
        }
        else if (slug) {
            dataToUpdate.slug = slug;
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }
        const product = yield index_1.prisma.product.update({
            where: { id },
            data: dataToUpdate,
            include: { category: true }
        });
        res.status(200).json(product);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slug'))) {
            return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
        }
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProduct = updateProduct;
// Delete product (admin only)
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield index_1.prisma.product.delete({ where: { id } });
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteProduct = deleteProduct;
