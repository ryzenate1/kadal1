"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const product_1 = require("../controllers/product");
const router = express_1.default.Router();
// Public routes
router.get('/', product_1.getAllProducts);
router.get('/:idOrSlug', product_1.getProductByIdOrSlug);
// Protected routes (admin only)
router.use(auth_1.authenticate, auth_1.isAdmin);
router.post('/', product_1.createProduct);
router.put('/:id', product_1.updateProduct);
router.delete('/:id', product_1.deleteProduct);
exports.default = router;
