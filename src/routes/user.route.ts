import { Router } from "express";
import {
  getMe,
  deleteUserById,
  updateUserProfile,
} from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Authentifizierter User → Profil + Workspaces abrufen
router.get("/me", verifyToken, getMe);
router.delete("/me", verifyToken, deleteUserById);
router.patch("/me", verifyToken, updateUserProfile);

export default router;
