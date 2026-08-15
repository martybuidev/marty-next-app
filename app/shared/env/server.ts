import { serverEnvSchema } from "./server-env.schema";

export const serverEnv = serverEnvSchema.parse({
  apiBaseUrl: process.env.API_BASE_URL,
  refreshCookieMaxAgeSeconds: process.env.REFRESH_COOKIE_MAX_AGE_SECONDS,
  cookieSecure: process.env.COOKIE_SECURE,
});
