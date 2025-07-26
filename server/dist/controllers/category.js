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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const index_1 = require("../index");
const generateSlug = (name) => {
    if (!name)
        return '';
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};
// Get all categories
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield index_1.prisma.category.findMany({
            orderBy: { order: 'asc' }
        });
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllCategories = getAllCategories;
// Get category by ID
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield index_1.prisma.category.findUnique({ where: { id } });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error('Get category by id error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryById = getCategoryById;
// Create category (admin only)
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { name, slug, description, imageUrl, order, isActive, type, icon } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        if (!slug) {
            slug = generateSlug(name);
        }
        const category = yield index_1.prisma.category.create({
            data: {
                name,
                slug,
                description,
                imageUrl,
                order,
                isActive,
                type: type || 'Fish',
                icon: icon || 'Fish'
            }
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slug'))) {
            return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
        }
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCategory = createCategory;
// Update category (admin only)
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        let { name, slug, description, imageUrl, order, isActive, type, icon } = req.body;
        if (name && !slug) { // If name is being updated and slug is not provided, regenerate slug
            slug = generateSlug(name);
        }
        else if (!name && slug) { // If only slug is provided, ensure there is a name associated or fetch existing
            const existingCategory = yield index_1.prisma.category.findUnique({ where: { id } });
            if (!(existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.name) && !name) {
                return res.status(400).json({ message: 'Category name is required when updating slug without providing a new name.' });
            }
        }
        else if (name && slug) {
            // both provided, use them
        }
        else { // Neither name nor slug provided for update, retain existing slug (if any operation needs it)
            const existingCategory = yield index_1.prisma.category.findUnique({ where: { id } });
            slug = existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.slug; // Keep existing slug if not updating name/slug
        }
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (slug !== undefined)
            dataToUpdate.slug = slug;
        if (description !== undefined)
            dataToUpdate.description = description;
        if (imageUrl !== undefined)
            dataToUpdate.imageUrl = imageUrl;
        if (order !== undefined)
            dataToUpdate.order = order;
        if (isActive !== undefined)
            dataToUpdate.isActive = isActive;
        if (type !== undefined)
            dataToUpdate.type = type;
        if (icon !== undefined)
            dataToUpdate.icon = icon;
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields to update.' });
        }
        const category = yield index_1.prisma.category.update({
            where: { id },
            data: dataToUpdate
        });
        res.status(200).json(category);
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('slug'))) {
            return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
        }
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCategory = updateCategory;
// Delete category (admin only)
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield index_1.prisma.category.delete({ where: { id } });
        res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;
