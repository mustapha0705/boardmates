import { Router } from "express";
import { requireAuth, requireProfile } from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/authController.js";
import { getStats, getUserGames, getUserReviews } from "../controllers/profileController.js";

const router = Router();
const auth = [requireAuth, requireProfile];

router.get("/", requireAuth, getProfile);
router.patch("/", requireAuth, updateProfile);
router.get("/stats", auth, getStats);
router.get("/games", auth, getUserGames);
router.get("/reviews", auth, getUserReviews);

export default router;
