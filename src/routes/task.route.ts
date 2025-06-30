import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { getTaskById, updateTask } from "../controllers/task.controller";

const router = Router();

router.get("/:id", verifyToken, getTaskById);
router.patch("/:id", verifyToken, updateTask); // Assuming you want to update a task by ID

export default router;
