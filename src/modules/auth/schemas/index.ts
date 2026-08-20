import z from "zod";

export const loginSchema = z.object({
  email: z
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export type TLoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export type TRegisterInput = z.infer<typeof registerSchema>;
