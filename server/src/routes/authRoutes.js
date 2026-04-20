import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { signup, getProfile, updateProfile } from "../controllers/authController.js";

const router = Router();

router.post("/signup", requireAuth, signup);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;
