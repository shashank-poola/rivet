import { z } from "zod";

export const signUpSchema = z.object({
    email: z.string().email("Incorrect mail format"),
    password: z.string().min(8).max(100)
});

export const signInSchema = z.object({
    email: z.string().email("Incorrect mail format"),
    password: z.string().min(8).max(100)
})