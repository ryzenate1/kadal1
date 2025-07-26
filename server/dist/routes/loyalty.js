"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loyalty_1 = require("../controllers/loyalty");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticate);
// Loyalty routes
router.get('/info', loyalty_1.getLoyaltyInfo);
router.get('/activity', loyalty_1.getLoyaltyActivity);
router.post('/redeem', loyalty_1.redeemPoints);
exports.default = router;
