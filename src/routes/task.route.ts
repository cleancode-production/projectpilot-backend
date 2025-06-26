import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { createTask, getTasksByProject } from "../controllers/task.controller";

const router = Router();

router.post("/project/:id/tasks", verifyToken, createTask);
router.get("/project/:id/tasks", verifyToken, getTasksByProject);

export default router;
