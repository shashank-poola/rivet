import { z } from "zod";

export const CredentialsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    platform: z.enum(["TELEGRAM", "RESEND_EMAIL", "GEMINI", "GROQ"]),
    data: z.record(z.string(), z.any()),
});

export const CredentialsUpdateSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    platform: z.enum(["TELEGRAM", "RESEND_EMAIL", "GEMINI", "GROQ"]).optional(),
    data: z.record(z.string(), z.any()).optional(),
});

export type CredentialsInput = z.infer<typeof CredentialsSchema>;
export type CredentialsUpdateInput = z.infer<typeof CredentialsUpdateSchema>;