import { z } from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;