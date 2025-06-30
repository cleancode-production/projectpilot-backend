import { Router } from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  getLastUpdatedWorkspace,
  updateWorkspace,
  addWorkspaceMember,
  removeMember,
  updateMemberRole,
} from "../controllers/workspace.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { isWorkspaceOwner } from "../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.get("/", getAllWorkspaces);
router.get("/last", getLastUpdatedWorkspace);
router.patch("/:id", createWorkspace);
router.post("/", updateWorkspace);
router.post(
  "/:workspaceId/members",
  verifyToken,
  isWorkspaceOwner,
  addWorkspaceMember,
);
router.delete(
  "/:workspaceId/members/:userId",
  verifyToken,
  isWorkspaceOwner,
  removeMember,
);
router.patch(
  "/:wokrspaceId/members/:userId",
  verifyToken,
  isWorkspaceOwner,
  updateMemberRole,
);

export default router;
