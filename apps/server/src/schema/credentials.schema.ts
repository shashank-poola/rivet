import { z } from "zod";

export const credentialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    application: z.string(),
    data: z.object({
      apikey: z.string().optional(),
      accessToken: z.string().optional(),
      businessAccountId: z.string().optional(),
      privateKey: z.string().optional(),
    }),
});

export const updateCredentialSchema = z.object({
    name: z.string().min(1).optional(),
    data: z
      .object({
        apikey: z.string().optional(),
        accessToken: z.string().optional(),
        businessAccountId: z.string().optional(),
      })
      .partial()
      .optional(),
  });