import { Router } from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  getLastUpdatedWorkspace,
  updateWorkspace,
} from "../controllers/workspace.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.use(verifyToken);

router.get("/", getAllWorkspaces);
router.get("/last", getLastUpdatedWorkspace);
router.patch("/:id", createWorkspace);
router.post("/", updateWorkspace);

export default router;
