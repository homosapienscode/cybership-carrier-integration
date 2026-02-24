import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  UPS_CLIENT_ID: z.string(),
  UPS_CLIENT_SECRET: z.string(),
  UPS_TOKEN_URL: z.url(),
  UPS_RATING_URL: z.url(),
  UPS_ACCOUNT_NUMBER: z
    .string()
    .regex(/^\d{6}$/, "Account number must be a 6 digit number"),
  UPS_SHIPPER_NUMBER: z
    .string()
    .regex(/^\d{1,12}$/, "Shipper number must be numeric (up to 12 digits)"),
  UPS_API_VERSION: z.string().default("v1"),
  UPS_REQUEST_OPTION: z.string().default("Rate"),

  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("3000"),

  HTTP_TIMEOUT_MS: z.string().default("5000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

const env = parsed.data;

export const config = {
  ups: {
    clientId: env.UPS_CLIENT_ID,
    clientSecret: env.UPS_CLIENT_SECRET,
    tokenUrl: env.UPS_TOKEN_URL,
    accountNumber: env.UPS_ACCOUNT_NUMBER,
    shipperNumber: env.UPS_SHIPPER_NUMBER,
    ratingUrl: env.UPS_RATING_URL,
    apiVersion: env.UPS_API_VERSION,
    requestOption: env.UPS_REQUEST_OPTION,
  },

  app: {
    env: env.NODE_ENV,
    port: Number(env.PORT),
  },

  http: {
    timeoutMs: Number(env.HTTP_TIMEOUT_MS),
  },
};
