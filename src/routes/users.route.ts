// routes/users.route.ts
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/users.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { isAdmin, isAdminOrSelf } from "../middleware/role.middleware";

const router = Router();

router.get("/", verifyToken, isAdmin, getAllUsers); // GET /users
router.get("/:id", verifyToken, isAdminOrSelf, getUserById); // GET /users/:id
router.patch("/:id", verifyToken, isAdminOrSelf, updateUserById); // PATCH /users/:id
router.delete("/:id", verifyToken, isAdmin, deleteUserById); // DELETE /users/:id

export default router;
