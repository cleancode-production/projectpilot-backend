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
    res.status(401).json({ message: "invalid Token" });
    return;
  }

  try {
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
  } catch (error) {
    console.log("error in createTask", error);
    res.status(500).json({ message: "Internal server error " });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;

  if (!req.user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: "asc" }, // sortiere fürs Board
    });

    res.json(tasks);
  } catch (err) {
    console.error("Error in getTasksByProject:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
