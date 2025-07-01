import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

// Auswahl der Felder, die du aus der Datenbank holen willst
const userSelect = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  role: true,
  profileImageURL: true,
  memberships: {
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

// Typ des Objekts, das Prisma bei diesem Select zurückliefert
type UserWithWorkspaces = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user: UserWithWorkspaces | null = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const workspaces = user.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
    }));

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profileImageURL: user.profileImageURL,
      workspaces,
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const {
    firstName,
    lastName,
    fullName,
    username,
    email,
    profileImageURL,
    bio,
    timezone,
    providerId,
    authProvider,
    isActive,
  } = req.body;

  const updateData: Record<string, any> = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (fullName !== undefined) updateData.fullName = fullName;
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (profileImageURL !== undefined)
    updateData.profileImageURL = profileImageURL;
  if (bio !== undefined) updateData.bio = bio;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (providerId !== undefined) updateData.providerId = providerId;
  if (authProvider !== undefined) updateData.authProvider = authProvider;
  if (isActive !== undefined) updateData.isActive = isActive;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        lastLogin: true,
        profileImageURL: true,
        isActive: true,
        authProvider: true,
        bio: true,
        timezone: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
