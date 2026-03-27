import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "./http-errors.js";

type AuthPayload = {
  sub: string;
  schoolId: string;
  role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "ACCOUNTANT";
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError("Unauthorized", 401);
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    throw new HttpError("Unauthorized", 401);
  }
}

export function requireRole(allowedRoles: AuthPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw new HttpError("Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.auth.role)) {
      throw new HttpError("Forbidden", 403);
    }

    next();
  };
}
