import { Router } from "express";
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
} from "../controllers/project.controller";
import { createTask } from "../controllers/task.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/projects", verifyToken, createProject);
router.get("/workspaces/:id/projects", verifyToken, getWorkspaceProjects);
router.get("/projects/:id", verifyToken, getProjectById);
router.post("/projects/:id/tasks", verifyToken, createTask);

export default router;
