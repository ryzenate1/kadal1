"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
// Register a new user
router.post('/register', auth_1.register);
// Login user
router.post('/login', auth_1.login);
// Send OTP
router.post('/send-otp', auth_1.sendOtp);
// Verify OTP
router.post('/verify-otp', auth_1.verifyOtp);
exports.default = router;
