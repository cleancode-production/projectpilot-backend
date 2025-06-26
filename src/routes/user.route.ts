import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Authentifizierter User → Profil + Workspaces abrufen
router.get("/me", verifyToken, getMe);

export default router;
