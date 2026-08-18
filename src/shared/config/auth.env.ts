import z from "zod"

export const authSchema = z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
})

export const authEnv = authSchema.parse({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
})