import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createTask = async (req: Request, res: Response) => {
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    assignedTo,
    position,
  } = req.body;

  const projectId = req.params.id;

  if (!req.user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  try {
    // 1. Projekt holen → um workspaceId zu bekommen
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
        userId: req.user.userId,
        workspaceId: project.workspaceId,
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // 3. Task erstellen
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || null,
        status: status || null,
        position: position || null,
        projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user.userId,
      },
    });

    res.status(201).json(newTask);
    return;
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;

  if (!req.user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  try {
    // 1. Projekt holen → workspaceId herausfinden
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // 2. Prüfen, ob User Mitglied im Workspace ist
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: req.user.userId,
        workspaceId: project.workspaceId,
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // 3. Tasks abrufen
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: "asc" }, // Board-Sortierung
    });

    res.status(200).json(tasks);
    return;
  } catch (err) {
    console.error("Error in getTasksByProject:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const taskId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (!taskId) {
    res.status(400).json({ message: "Task ID is required" });
    return;
  }
  try {
    // 1. Task holen
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { workspaceId: true },
        },
      },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // 2. Prüfen, ob User Mitglied im Workspace ist
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: task.project.workspaceId,
      },
    });

    if (!isMember) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error in getTaskById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const taskId = req.params.id;

  const {
    title,
    description,
    dueDate,
    priority,
    status,
    assignedTo,
    tags,
    comments,
  } = req.body;

  if (!userId) {
    res.status(401).json({ message: "invalid Token" });
    return;
  }

  if (!taskId) {
    res.status(400).json({ message: "taskID is required" });
    return;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { workspaceId: true },
      },
    },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const isMember = await prisma.workspaceMember.findFirst({
    where: {
      id: userId,
      workspaceId: task?.project.workspaceId,
    },
  });

  if (!isMember) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  const dataToUpdate: Record<string, any> = {};
  if (title) dataToUpdate.title = title;
  if (description) dataToUpdate.description = description;
  if (dueDate) dataToUpdate.dueDate = new Date(dueDate);
  if (priority) dataToUpdate.priority = priority;
  if (status) dataToUpdate.status = status;
  if (assignedTo) dataToUpdate.assignedTo = assignedTo;
  if (tags) dataToUpdate.tags = tags;
  if (comments) dataToUpdate.comments = comments;

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: dataToUpdate,
  });
};
