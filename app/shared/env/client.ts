import { clientEnvSchema } from "./client-env.schema";

export const clientEnv = clientEnvSchema.parse({
  nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
});
