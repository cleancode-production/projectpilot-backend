import type { Request } from "express";

export interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

/** Request mit gesetztem user (nach verifyToken) */
export type AuthedRequest = Request & { user: JwtUser };
