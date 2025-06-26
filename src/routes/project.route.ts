import { Router } from "express";
import {
  createProject,
  getWorkspaceProjects,
} from "../controllers/project.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/projects", verifyToken, createProject);
router.get("/workspaces/:id/projects", verifyToken, getWorkspaceProjects);

export default router;
