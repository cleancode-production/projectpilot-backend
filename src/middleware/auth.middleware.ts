import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const verifyToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

export const verifyRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }
};
