import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  FRONTEND_ORIGIN: z.string().url().optional(),
  N8N_WEBHOOK_REDDIT: z.string().url().optional(),
  N8N_WEBHOOK_LINKEDIN: z.string().url().optional(),
  N8N_WEBHOOK_TWITTER: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
