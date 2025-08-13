import { Router } from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  getLastUpdatedWorkspace,
  updateWorkspace,
  addWorkspaceMember,
  removeMember,
  updateMemberRole,
  getWorkspaceById,
} from "../controllers/workspace.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { isWorkspaceOwner } from "../middleware/role.middleware";

const router = Router();

router.get("/", verifyToken, getAllWorkspaces);
router.get("/last", verifyToken, getLastUpdatedWorkspace);
router.get("/:id", verifyToken, getWorkspaceById);
router.post("/", verifyToken, createWorkspace);
router.patch("/", verifyToken, updateWorkspace);
router.post(
  "/:workspaceId/members",
  verifyToken,
  isWorkspaceOwner,
  addWorkspaceMember
);
router.delete(
  "/:workspaceId/members/:userId",
  verifyToken,
  isWorkspaceOwner,
  removeMember
);
router.patch(
  "/:workspaceId/members/:userId",
  verifyToken,
  isWorkspaceOwner,
  updateMemberRole
);

export default router;
