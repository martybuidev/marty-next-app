import z from 'zod';

export const clientEnvSchema = z.object({
  nextPublicApiUrl: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
});
