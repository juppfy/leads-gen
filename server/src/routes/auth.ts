import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { env } from "../config.js";

const router = Router();

const SESSION_COOKIE_NAME = "session";
const SESSION_DAYS = 30;

function signSessionToken(userId: string) {
  const expiresInSeconds = SESSION_DAYS * 24 * 60 * 60;
  return jwt.sign({ sub: userId }, env.BETTER_AUTH_SECRET, { expiresIn: expiresInSeconds });
}

function setSessionCookie(res: any, token: string, req: any) {
  // Detect if we're in production (HTTPS) or behind a proxy (Railway, etc.)
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.NODE_ENV === "production";
  
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isSecure ? "none" : "lax", // "none" required for cross-origin HTTPS, "lax" for same-site
    secure: isSecure, // true for HTTPS (production), false for local dev
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

router.get("/session", async (req, res) => {
  try {
    const token =
      req.cookies?.[SESSION_COOKIE_NAME] ||
      (typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : null);

    if (!token) return res.json({ user: null });

    const payload = jwt.verify(token, env.BETTER_AUTH_SECRET) as any;
    const userId = payload?.sub as string | undefined;
    if (!userId) return res.json({ user: null });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.json({ user: null });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        searchCount: user.searchCount,
      },
    });
  } catch {
    return res.json({ user: null });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });
  if (!password || typeof password !== "string" || password.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: typeof name === "string" ? name.trim() : null,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: normalizedEmail,
            password: passwordHash,
          },
        },
      },
    });

    const token = signSessionToken(user.id);
    setSessionCookie(res, token, req);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
        searchCount: user.searchCount,
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: "Failed to sign up" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });
  if (!password || typeof password !== "string") return res.status(400).json({ error: "Password is required" });

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "credentials", providerAccountId: normalizedEmail },
  });
  if (!account?.password) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, account.password);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signSessionToken(user.id);
  setSessionCookie(res, token, req);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan,
      searchCount: user.searchCount,
    },
  });
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});

export default router;

