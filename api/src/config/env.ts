import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  NOTIFICATIONS_MODE: z.enum(["MOCK", "LIVE"]).default("MOCK"),
  MTN_MOMO_API_KEY: z.string().optional(),
  VODAFONE_CASH_API_KEY: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  FCM_SERVER_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
