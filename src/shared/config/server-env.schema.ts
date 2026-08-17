import 'server-only';

import z from 'zod';

export const serverEnvSchema = z.object({
  apiBaseUrl: z.url(),
  refreshCookieMaxAgeSeconds: z.coerce.number().int().positive(),
  cookieSecure: z.enum(['true', 'false']).transform((v) => v === 'true'),
});
