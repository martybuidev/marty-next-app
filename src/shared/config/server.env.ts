import 'server-only';

import z from 'zod';

export const serverEnvSchema = z.object({
  apiBaseUrl: z.url(),
});

export const serverEnv = serverEnvSchema.parse({
  apiBaseUrl: process.env.API_BASE_URL,
});