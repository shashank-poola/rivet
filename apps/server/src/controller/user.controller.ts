import type { Request, Response } from "express";
import { signUpSchema, signInSchema } from "../schema/auth.schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@rivet-n8n/prisma-db";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const JWT_SECRET = process.env.JWT_SECRET || "123";

export const signUpController = async (req: Request, res: Response) => {
    try {
        const response = signUpSchema.safeParse(req.body);

        if (!response.success) {
            return res.status(400).json({
                status: "failed",
                message: "Authentication failed, enter valid credentials"
            });
        }

        const user = response.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email
            }
        });

        if (existingUser) {
            res.status(409).json({
                status: "failed",
                message: "USER_ALREADY_EXISTS"
            });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({
            id: newUser.id,
            email: newUser.email
        }, JWT_SECRET, {
            expiresIn: "7d"
        });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            status: "success",
            message: "SIGNUP_SUCCESSFULL",
            token,
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            status: "failed",
            message: "INTERNAL_SERVER_ERROR"
        });
    }
};

export const signInController = async (req: Request, res: Response) => {
    try {
        const response = signInSchema.safeParse(req.body);

        if (!response.success) {
            res.status(400).json({
                status: "failed",
                message: "Authentication failed, enter valid credentials"
            });
            return;
        }

        const user = response.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email
            }
        });

        if (!existingUser) {
            res.status(404).json({
                status: "failed",
                message: "USER_DOESN'T_EXIST"
            });
            return;
        }

        const verifyPassword = await bcrypt.compare(user.password, existingUser.password);

        if (!verifyPassword) {
            res.status(401).json({
                status: "failed",
                message: "INVALID_PASSWORD"
            });
            return;
        }

        const token = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, JWT_SECRET, { expiresIn: "7d" });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            status: "success",
            message: "SIGNIN_SUCCESSFULL",
            token,
            user: {
                id: existingUser.id,
                email: existingUser.email
            }
        });

    } catch (error) {
        console.error("Signin error:", error);

        return res.status(500).json({
            status: "failed",
            message: "SIGNIN_SERVER_ERROR"
        });
    }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    try {
        return res.status(200).json({
            status: "success",
            user: {
                id: req.user.id,
                email: req.user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export const logout = async (_req: Request, res: Response) => {
    try {
        res.clearCookie("auth_token");

        return res.json({
            status: "success",
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            status: "failed",
            message: "Internal server error"
        });
    }
};
