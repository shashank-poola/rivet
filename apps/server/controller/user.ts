import type { Request, Response } from "express";
import { SignupSchema, SigninSchema } from "../types/schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

export const JWT_SECRET = process.env.JWT_SECRET || "123";

let prisma: PrismaClient | null = null;

const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const signup = async (req: Request, res: Response) => {
    try {
        const response = SignupSchema.safeParse(req.body);
        if (!response.success) {
            return res.status(400).json({ message: "Authentication failed, enter valid credentials" });
        }

        const user = response.data;

        // Check if user already exists
        const existingUser = await getPrisma().user.findUnique({
            where: { email: user.email }
        });
        
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Create new user in database
        const newUser = await getPrisma().user.create({
            data: {
                email: user.email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        return res.json({ id: newUser.id, email: newUser.email });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const signin = async (req: Request, res: Response) => {
    try {
        const response = SigninSchema.safeParse(req.body);
        if (!response.success) {
            return res.status(400).json({ message: "Authentication failed, enter valid credentials" });
        }

        const user = response.data;

        // Find user in database
        const existingUser = await getPrisma().user.findUnique({
            where: { email: user.email }
        });
        
        if (!existingUser) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(user.password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password, enter the correct password" });
        }

        const token = jwt.sign({ id: existingUser.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        return res.json({ id: existingUser.id, email: existingUser.email });
    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
    export const logout = async (req: Request, res: Response) => {
        try {
            res.clearCookie("access_token");
            return res.json({ message: "Logged out successfully"});
        } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({ message: "Internal server error"});
        }
    }

