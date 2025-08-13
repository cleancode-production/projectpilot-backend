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
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

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

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: "asc" },
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
    position,
  } = req.body;

  const dataToUpdate: Record<string, any> = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (description !== undefined) dataToUpdate.description = description;
  if (dueDate !== undefined) dataToUpdate.dueDate = new Date(dueDate);
  if (priority !== undefined) dataToUpdate.priority = priority;
  if (status !== undefined) dataToUpdate.status = status;
  if (assignedTo !== undefined) dataToUpdate.assignedTo = assignedTo;
  if (position !== undefined) dataToUpdate.position = position;

  if (!userId) {
    res.status(401).json({ message: "invalid Token" });
    return;
  }

  if (!taskId) {
    res.status(400).json({ message: "taskID is required" });
    return;
  }

  try {
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

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedTask);
    return;
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const deleteTask = async (req: Request, res: Response) => {
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

    const isOwner = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: task.project.workspaceId,
        role: "OWNER",
      },
    });

    if (!isOwner) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
