import { Router } from "express";
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  deleteProjectById,
  updateProject,
} from "../controllers/project.controller";

import { createTask, getTasksByProject } from "../controllers/task.controller";

import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", verifyToken, getWorkspaceProjects);
router.post("/", verifyToken, createProject);
router.get("/:id", verifyToken, getProjectById);
router.delete("/:id", verifyToken, deleteProjectById);
router.patch("/:id", verifyToken, updateProject);

router.post("/:id/tasks", verifyToken, createTask);
router.get("/:id/tasks", verifyToken, getTasksByProject);

export default router;
