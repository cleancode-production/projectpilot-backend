import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Cookie bevorzugen
  const cookieToken = req.cookies?.accessToken;

  // 2) Fallback: Authorization-Header
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = cookieToken || headerToken;

  if (!token || token === "undefined" || token === "null") {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    // Abgelaufen? -> 401, damit der Client refreshen kann
    if (err?.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    // Sonst malformed/invalid
    res.status(403).json({ message: "Invalid token" });
  }
};

export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  try {
    const storedToken = await prisma.refreshToken.findFirst({
      where: { token, revoked: false },
      include: { user: true },
    });

    if (!storedToken) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    if (!storedToken.user) {
      res.status(403).json({ message: "User not found" });
      return;
    }

    req.user = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
