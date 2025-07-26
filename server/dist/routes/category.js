"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const category_1 = require("../controllers/category");
const router = express_1.default.Router();
// Public routes
router.get('/', category_1.getAllCategories);
router.get('/:id', category_1.getCategoryById);
// Protected routes (admin only)
router.use(auth_1.authenticate, auth_1.isAdmin);
router.post('/', category_1.createCategory);
router.put('/:id', category_1.updateCategory);
router.delete('/:id', category_1.deleteCategory);
exports.default = router;
