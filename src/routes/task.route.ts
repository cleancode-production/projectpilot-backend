import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { createTask } from "../controllers/task.controller";

const router = Router();

router.post("/projects/:id/tasks", verifyToken, createTask);

export default router;
