import type { Request, Response } from "express";
import { signUpSchema, signInSchema } from "../schema/auth.schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@rivet-n8n/prisma-db";

export const JWT_SECRET = process.env.JWT_SECRET || "123";

export const signUpController = async (req: Request, res: Response) => {
    try {
        const response = signUpSchema.safeParse(req.body);

        if (!response.success) {
            return res.status(400).json({ 
                status: "failed",
                message: "Authentication failed, enter valid credentials" });
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
            })
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ 
            id: newUser.id 
        }, JWT_SECRET, { 
            expiresIn: "1h" 
        });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
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
            })
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
        }

        const verifyPassword = await bcrypt.compare(user.password, existingUser.password);

        if (!verifyPassword) {
            res.status(401).json({
                status: "failed", 
                message: "INVALID_PASSWORD" 
            })
            return;
        }

        const token = jwt.sign({ id: existingUser.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(201).json({
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
    
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("access_token");

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

