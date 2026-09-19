import express from 'express';
import { signup, login, onboard, logout, googleAuth } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

// check if user is logged in and return user data
router.get("/me", protectRoute, async (req, res) => {
  if (!req.user.profilePicture) {
    req.user.profilePicture = `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.user._id}`;
    try {
      await req.user.save();
    } catch (error) {
      console.error("Error saving default profile picture:", error);
    }
  }

  res.status(200).json({ user: req.user });
});

export default router;