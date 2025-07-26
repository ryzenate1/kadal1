import express from 'express';
import { register, login, sendOtp, verifyOtp } from '../controllers/auth';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Send OTP
router.post('/send-otp', sendOtp);

// Verify OTP
router.post('/verify-otp', verifyOtp);

export default router;
