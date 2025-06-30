import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { RequestHandler } from "react-router-dom";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};

export const isWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.userId;
  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  if (!userId || !workspaceId) {
    res.status(403).json({ message: "User ID or Workspace ID missing" });
    return;
  }
  try {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
        role: {
          in: ["MEMBER", "OWNER"],
        },
      },
    });

    if (!membership) {
      res.status(403).json({ message: "Owner access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("isWorkspaceOwner error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const isWorkspaceOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.userId;
  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  if (!userId || !workspaceId) {
    res.status(400).json({ message: "User ID or Workspace ID missing" });
    return;
  }

  try {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
        role: {
          in: ["MEMBER", "OWNER"], // GUEST darf nicht rein
        },
      },
    });

    if (!membership) {
      res.status(403).json({ message: "Owner access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("isWorkspaceOwner error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const isAdminOrSelf = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.user?.userId;
  const targetUserId = req.params.id;

  if (req.user?.role === "ADMIN" || currentUserId === targetUserId) {
    next();
  }

  res.status(403).json({ message: "Forbidden" });
  return;
};

export const isProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = req.params.id;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: project.workspaceId,
      role: { not: "GUEST" },
    },
  });

  if (!membership) {
    res.status(403).json({ message: "You are not a member of this project" });
    return;
  }

  next();
};
