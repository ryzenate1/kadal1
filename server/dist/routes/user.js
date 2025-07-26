"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticate);
// User profile routes
router.get('/profile', user_1.getProfile);
router.put('/profile', user_1.updateProfile);
router.post('/change-password', user_1.changePassword);
// Address routes
router.get('/addresses', user_1.getAddresses);
router.post('/addresses', user_1.addAddress);
router.put('/addresses/:id', user_1.updateAddress);
router.delete('/addresses/:id', user_1.deleteAddress);
// Add this route to your existing user routes
router.get('/verify', auth_1.authenticate, (req, res) => {
    var _a, _b;
    // If authenticate middleware passes, the token is valid
    res.status(200).json({
        verified: true,
        user: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            role: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role
        }
    });
});
exports.default = router;
