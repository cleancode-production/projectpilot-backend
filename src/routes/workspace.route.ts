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

router.use(verifyToken);

router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.get("/last", getLastUpdatedWorkspace);
router.post("/:id", createWorkspace);
router.patch("/", updateWorkspace);
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
  "/:wokrspaceId/members/:userId",
  verifyToken,
  isWorkspaceOwner,
  updateMemberRole
);

export default router;
