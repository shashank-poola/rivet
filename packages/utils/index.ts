import { z } from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const CredentialsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    platform: z.enum(["Telegram", "ResendEmail", "WhatsApp"]),
    data: z.record(z.any()),
});

export const CredentialsUpdateSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    platform: z.enum(["Telegram", "ResendEmail", "WhatsApp"]).optional(),
    data: z.record(z.any()).optional(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
export type CredentialsInput = z.infer<typeof CredentialsSchema>;
export type CredentialsUpdateInput = z.infer<typeof CredentialsUpdateSchema>;