import { Request, Response } from "express";
import prisma from "../lib/prisma";

// Alle Workspaces des eingeloggten Users holen
export const getAllWorkspaces = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } }, // auch als Mitglied
        ],
      },
      include: {
        members: true,
        projects: true,
      },
    });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Fehler beim Abrufen der Workspaces:", error);
    res
      .status(500)
      .json({ message: "Serverfehler beim Abrufen der Workspaces" });
  }
};

// Neuen Workspace anlegen
export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ message: "invalid Token" });
      return;
    }

    if (!name?.trim()) {
      res.status(400).json({ message: "Name ist erforderlich" });
      return;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Fehler beim Erstellen des Workspaces:", error);
    res
      .status(500)
      .json({ message: "Serverfehler beim Erstellen des Workspaces" });
  }
};

export const getLastUpdatedWorkspace = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(400).json({ message: "Invalid token" });
    return;
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } }, // auch als Mitglied
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        members: true,
        projects: true,
      },
    });

    if (!workspace) {
      res.status(404).json({ message: "Kein Workspace gefunden" });
      return;
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error("Fehler beim Laden des letzten Workspaces:", error);
    res.status(500).json({ message: "Serverfehler" });
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const workspaceId = req.params.id;
  const { name } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (!name?.trim()) {
    res.status(400).json({ message: "Name is required" });
    return;
  }

  try {
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, updatedAt: new Date() },
      include: {
        members: true,
        projects: true,
      },
    });

    res.status(200).json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Server error while updating workspace" });
  }
};

export const addWorkspaceMember = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const workspaceId = req.params.id;
  const { email } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    // Check if the user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email } },
    });

    if (existingMember) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    // Find the user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Add the new member to the workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: userToAdd.id,
        workspaceId,
        role: "MEMBER",
      },
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding workspace member:", error);
    res.status(500).json({ message: "Server error while adding member" });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const workspaceId = req.params.workspaceId;
  const memberId = req.params.userId;

  if (!userId) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (!memberId) {
    res.status(400).json({ message: "Member ID is required" });
    return;
  }

  try {
    // Check if the user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: memberId },
    });

    if (!membership) {
      res.status(404).json({ message: "Member not found in workspace" });
      return;
    }

    // Remove the member from the workspace
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing workspace member:", error);
    res.status(500).json({ message: "Server error while removing member" });
  }
};
