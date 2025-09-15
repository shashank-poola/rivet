import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "123";

export interface JwtUserPayload {
  id: string;
  email?: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.["access_token"] || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    // @ts-expect-error augment
    req.user = { id: payload.id, email: payload.email ?? "" };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}


