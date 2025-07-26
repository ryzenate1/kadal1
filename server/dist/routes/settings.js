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
// Get all store settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield index_1.prisma.storeSetting.findMany({
            orderBy: { key: 'asc' }
        });
        // Convert array to object for easier usage
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.json({ settings: settingsMap, raw: settings });
    }
    catch (error) {
        console.error('Error fetching store settings:', error);
        res.status(500).json({
            message: 'Error fetching store settings',
            error: error.message
        });
    }
}));
// Get specific setting by key
router.get('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const setting = yield index_1.prisma.storeSetting.findUnique({
            where: { key }
        });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    }
    catch (error) {
        console.error('Error fetching store setting:', error);
        res.status(500).json({
            message: 'Error fetching store setting',
            error: error.message
        });
    }
}));
// Create or update store setting
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value, description } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: 'Key and value are required' });
        }
        const setting = yield index_1.prisma.storeSetting.upsert({
            where: { key },
            update: {
                value: String(value),
                description,
                updatedAt: new Date()
            },
            create: {
                key,
                value: String(value),
                description
            }
        });
        res.json({ message: 'Setting updated successfully', setting });
    }
    catch (error) {
        console.error('Error updating store setting:', error);
        res.status(500).json({
            message: 'Error updating store setting',
            error: error.message
        });
    }
}));
// Update multiple settings
router.put('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ message: 'Settings object is required' });
        }
        const promises = Object.entries(settings).map(([key, value]) => index_1.prisma.storeSetting.upsert({
            where: { key },
            update: {
                value: String(value),
                updatedAt: new Date()
            },
            create: {
                key,
                value: String(value)
            }
        }));
        const updatedSettings = yield Promise.all(promises);
        res.json({
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    }
    catch (error) {
        console.error('Error updating store settings:', error);
        res.status(500).json({
            message: 'Error updating store settings',
            error: error.message
        });
    }
}));
// Delete setting
router.delete('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        yield index_1.prisma.storeSetting.delete({
            where: { key }
        });
        res.json({ message: 'Setting deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting store setting:', error);
        res.status(500).json({
            message: 'Error deleting store setting',
            error: error.message
        });
    }
}));
exports.default = router;
