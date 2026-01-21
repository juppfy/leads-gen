import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";
import { prisma } from "../prisma.js";

const SESSION_COOKIE_NAME = "session";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        plan: string;
        searchCount: number;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Better Auth
 * Checks for session token in cookies or Authorization header
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      (req as any).cookies?.[SESSION_COOKIE_NAME] ||
      (typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : null);

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = jwt.verify(token, env.BETTER_AUTH_SECRET) as any;
    const userId = payload?.sub as string | undefined;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || null,
      image: user.image || null,
      plan: user.plan,
      searchCount: user.searchCount,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

/**
 * Optional auth middleware - attaches user if authenticated but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      (req as any).cookies?.[SESSION_COOKIE_NAME] ||
      (typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : null);

    if (token) {
      const payload = jwt.verify(token, env.BETTER_AUTH_SECRET) as any;
      const userId = payload?.sub as string | undefined;
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            plan: user.plan,
            searchCount: user.searchCount,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Just continue without user
    next();
  }
};
