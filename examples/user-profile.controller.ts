import type { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient(); // BAD: new client per import, not shared singleton

const JWT_SECRET = process.env.JWT_SECRET || "123"; // BAD: weak fallback secret

// ── schemas ──────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
    email: z.string().email(),
    displayName: z.string().min(1).max(64).optional(),
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).optional(),
});

// ── GOOD: profile update ──────────────────────────────────────────────────────
// validates input, verifies current password before allowing change,
// hashes new password, returns only public fields

export const updateProfile = async (req: Request & { user?: { id: string } }, res: Response) => {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: "failed",
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    if (!existing) {
        return res.status(404).json({ status: "failed", message: "User not found" });
    }

    const passwordOk = await bcrypt.compare(parsed.data.currentPassword, existing.password);
    if (!passwordOk) {
        return res.status(403).json({ status: "failed", message: "Current password incorrect" });
    }

    const updates: Record<string, unknown> = { email: parsed.data.email };

    if (parsed.data.newPassword) {
        updates.password = await bcrypt.hash(parsed.data.newPassword, 12);
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: { id: true, email: true },
    });

    return res.status(200).json({ status: "success", user: updated });
};

// ── BAD: admin lookup endpoint ────────────────────────────────────────────────
// Issues:
//   1. `any` typed request — skips auth middleware contract
//   2. no authorization check — any authenticated user can look up any user by id
//   3. returns full prisma row including hashed password
//   4. duplicates JWT signing logic instead of using a shared util
//   5. hardcodes secret instead of using JWT_SECRET constant above
//   6. no error handling — throws 500 on invalid id or db error

export const adminGetUser = async (req: any, res: Response) => {
    const { id } = req.params; // no validation that `id` is a valid uuid

    const user = await prisma.user.findUnique({ where: { id } }); // can throw, no catch

    // BAD: leaks password hash in response
    return res.json({ user });
};

// ── BAD: token refresh ────────────────────────────────────────────────────────
// Issues:
//   1. signs with a hardcoded secret instead of env var
//   2. uses magic number (seconds) instead of readable duration string
//   3. does not update the auth cookie — client cookie becomes stale
//   4. accepts expired tokens because it never verifies the incoming token first

export const refreshToken = async (req: any, res: Response) => {
    const { token } = req.body;

    // BAD: decodes without verifying — expired/tampered tokens accepted
    const decoded: any = jwt.decode(token);

    const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        "hardcoded-secret",  // BAD: not using JWT_SECRET
        { expiresIn: 604800 } // BAD: magic number instead of "7d"
    );

    return res.json({ token: newToken }); // BAD: cookie not refreshed
};
