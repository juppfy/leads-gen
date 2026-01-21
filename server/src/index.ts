import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config.js";
import { prisma } from "./prisma.js";
import searchRouter from "./routes/search.js";
import webhookRouter from "./routes/webhook.js";
import authRouter from "./routes/auth.js";


const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
// Also accept application/x-www-form-urlencoded bodies (used by some n8n HTTP Request nodes)
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// CORS configuration - supports comma-separated origins and normalizes trailing slashes
const getAllowedOrigins = (): (string | RegExp)[] | string | undefined => {
  if (!env.FRONTEND_ORIGIN) return "*";
  
  // Split by comma and normalize (remove trailing slashes)
  const origins = env.FRONTEND_ORIGIN.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter((origin) => origin.length > 0);
  
  // If only one origin, return as string; otherwise return array
  return origins.length === 1 ? origins[0] : origins;
};

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);
app.use(morgan("dev"));

// Auth endpoints
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/search", searchRouter);
app.use("/api/webhook", webhookRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Basic prisma connectivity check on startup
async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📊 Health check: http://localhost:${env.PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${env.PORT}/api/auth/*`);
      console.log(`🔍 Search API: http://localhost:${env.PORT}/api/search`);
      console.log(`📥 Webhook API: http://localhost:${env.PORT}/api/webhook/n8n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing server...");
  await prisma.$disconnect();
  process.exit(0);
});

start();
