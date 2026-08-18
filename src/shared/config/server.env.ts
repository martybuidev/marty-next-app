import 'server-only';

import z from 'zod';

export const serverEnvSchema = z.object({
  apiBaseUrl: z.url(),
  refreshCookieMaxAgeSeconds: z.coerce.number().int().positive(),
  cookieSecure: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export const serverEnv = serverEnvSchema.parse({
  apiBaseUrl: process.env.API_BASE_URL,
  refreshCookieMaxAgeSeconds: process.env.REFRESH_COOKIE_MAX_AGE_SECONDS,
  cookieSecure: process.env.COOKIE_SECURE,
});
