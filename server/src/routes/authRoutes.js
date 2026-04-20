import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { signup } from "../controllers/authController.js";

const router = Router();

router.post("/signup", requireAuth, signup);

export default router;
