import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { createTask, getTasksByProject } from "../controllers/task.controller";

const router = Router();

router.post("/projects/:id/tasks", verifyToken, createTask);
router.get("/projects/:id/tasks", verifyToken, getTasksByProject);

export default router;
