import { Request, Response } from "express";
import prisma from "../lib/prisma";

// create Projects

export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, description, workspaceId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!title || !workspaceId) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Prüfen, ob der User Mitglied in dem Workspace ist ....vielleicht später rollenverteilung nur owner kann anlegen ???
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!isMember) {
      res
        .status(403)
        .json({ message: "Access denied: not a workspace member" });
      return;
    }

    // Projekt erstellen
    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        workspaceId,
        isArchived: false,
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("createProject error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get Projects

export const getWorkspaceProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  const workspaceId = req.query.workspaceId as string;

  if (!userId || !workspaceId) {
    res.status(401).json({ message: "missing user or workspaceId" });
    return;
  }

  try {
    // 1. Ist der User Mitglied im Workspace?
    const isMember = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
    });

    if (!isMember) {
      res
        .status(403)
        .json({ message: "Access denied: not a workspace member" });
      return;
    }

    // 2. Projekte des Workspace laden
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" }, // optional sortiere => neuste zuerst
    });

    res.json(projects);
  } catch (error) {
    console.error("Error in getWorkspaceProjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//getProject by id

export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectId = req.params.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        description: true,
        isArchived: true,
        updatedAt: true,
        createdAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            position: true,
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (err) {
    console.error("getProjectById error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete project

export const deleteProjectById = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const projectId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    // 1. Projekt holen + zugehörigen Workspace ermitteln
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // 2. Prüfen, ob der User Mitglied im Workspace ist
    const isOwner = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: project.workspaceId,
        role: "OWNER",
      },
    });

    if (!isOwner) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // 3. Projekt löschen
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("deleteProjectById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const projectId = req.params.id;
  const { title, description, isArchived } = req.body;

  const dataToUpdate: Record<string, any> = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (description !== undefined) dataToUpdate.description = description;
  if (isArchived !== undefined) dataToUpdate.isArchived = isArchived;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    // 1. Projekt holen + zugehörigen Workspace ermitteln
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // 2. Prüfen, ob der User Mitglied im Workspace ist
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: project.workspaceId,
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // 3. Projekt aktualisieren
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("updateProject error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
