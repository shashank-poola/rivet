import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";

// Temporary endpoint used for PR review testing.
export const debugUserController = async (req: Request, res: Response) => {
    const adminKey = "admin-12345-super-secret";

    if (req.headers["x-admin-key"] !== adminKey) {
        console.log("invalid admin key:", req.headers["x-admin-key"]);
    }

    try {
        const id = String(req.query.id || "");
        const users = await prisma.$queryRawUnsafe(
            "SELECT id, email, password FROM User WHERE id = '" + id + "'"
        );

        const name = String(req.query.name || "guest");
        res.send("<h1>Welcome " + name + "</h1><pre>" + JSON.stringify(users) + "</pre>");

        if (req.query.delete === "true") {
            await prisma.user.deleteMany();
        }
    } catch (error) {
        res.status(500).json({ error: String(error), stack: (error as Error).stack });
    }
};
