import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { getTaskById } from "../controllers/task.controller";

const router = Router();

router.get("/:id", verifyToken, getTaskById);

export default router;
