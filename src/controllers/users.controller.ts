import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ GET /users/:id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        bio: true,
        profileImageURL: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("[getUserById] Error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ✅ PATCH /users/:id
export const updateUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const {
    fullName,
    username,
    email,
    role,
    isActive,
    profileImageURL,
    bio,
    timezone,
  } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        email,
        role,
        isActive,
        profileImageURL,
        bio,
        timezone,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("[updateUserById] Error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[deleteUserById] Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
