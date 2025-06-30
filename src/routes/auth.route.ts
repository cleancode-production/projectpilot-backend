import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";
import { verifyRefreshToken } from "../middleware/auth.middleware";
import { refreshTokenAccess } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", verifyRefreshToken, refreshTokenAccess);
router.post("/logout", verifyRefreshToken, logoutUser);

export default router;
