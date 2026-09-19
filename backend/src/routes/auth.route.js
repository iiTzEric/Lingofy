import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, onboard, logout, googleAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Limits how often one IP can hit the sign-in endpoints (shared across signup, login and Google)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleAuth);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

// check if user is logged in and return user data
router.get("/me", protectRoute, (req, res) => {
  if (!req.user.profilePicture) {
    // in-memory fallback only, nothing is saved from a GET request
    req.user.profilePicture = `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.user._id}`;
  }

  res.status(200).json({ user: req.user });
});

export default router;