import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export const registerUser = async (req: Request, res: Response) => {
  const { password, firstName, lastName, username } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const fullName = firstName + " " + lastName;

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      fullName,
      username,
      role: "USER",
      lastLogin: new Date(),
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "My Workspace",
      userId: newUser.id,
      members: {
        create: {
          userId: newUser.id,
          role: "OWNER",
        },
      },
    },
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );

  res.status(201).json({
    message: "User registered",
    userId: newUser.id,
    token,
    workspaceId: workspace.id,
  });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ userId: user.id }, { members: { some: { userId: user.id } } }],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      message: "Login successful",
      token,
      workspaceId: workspace?.id || null,
      userId: user.id,
    });
  } catch (err) {
    next(err);
  }
};
