import { Router } from "express";
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  deleteProjectById,
} from "../controllers/project.controller";

import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", verifyToken, getWorkspaceProjects);
router.post("/", verifyToken, createProject);
router.get("/:id", verifyToken, getProjectById);
router.delete("/:id", verifyToken, deleteProjectById);

export default router;
