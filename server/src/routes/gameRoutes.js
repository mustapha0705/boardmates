import { Router } from "express";
import { requireAuth, requireProfile } from "../middleware/auth.js";
import {
  listGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  claimGame,
  completeReview,
  unclaimGame,
  listComments,
  upsertComment,
} from "../controllers/gameController.js";

const router = Router();
const auth = [requireAuth, requireProfile];

// CRUD
router.get("/", listGames);
router.get("/:id", getGame);
router.post("/", auth, createGame);
router.patch("/:id", auth, updateGame);
router.delete("/:id", auth, deleteGame);

// Review workflow
router.post("/:id/claim", auth, claimGame);
router.post("/:id/complete", auth, completeReview);
router.post("/:id/unclaim", auth, unclaimGame);

// Comments
router.get("/:id/comments", listComments);
router.put("/:id/comments", auth, upsertComment);

export default router;
