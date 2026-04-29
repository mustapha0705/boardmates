import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { signup, validateChessUsername } from "../controllers/authController.js";

const router = Router();

router.post("/validate-chess-username", validateChessUsername);
router.post("/signup", requireAuth, signup);

export default router;
