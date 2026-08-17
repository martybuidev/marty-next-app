import z from 'zod';

export const clientEnvSchema = z.object({
  nextPublicApiUrl: z.url(),
});
