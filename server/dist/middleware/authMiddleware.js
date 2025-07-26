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
exports.isCustomerOrAdmin = exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
// Middleware to authenticate users
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if user exists
        const user = yield index_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true }
        });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        // Add user to request object
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Not authorized' });
    }
});
exports.authenticate = authenticate;
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First authenticate the user
        (0, exports.authenticate)(req, res, () => {
            var _a;
            // Check if the user has admin role
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
            }
            next();
        });
    }
    catch (error) {
        console.error('Admin authorization error:', error);
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
});
exports.isAdmin = isAdmin;
// Middleware to check if user is a customer or admin
const isCustomerOrAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First authenticate the user
        (0, exports.authenticate)(req, res, () => {
            var _a, _b;
            // Check if the user has customer or admin role
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'customer' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
            }
            next();
        });
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(403).json({ message: 'Not authorized' });
    }
});
exports.isCustomerOrAdmin = isCustomerOrAdmin;
