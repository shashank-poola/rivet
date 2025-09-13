import type { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma";
import { SignupSchema, SigninSchema } from "../packages/utils";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "123";
const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
    const response = SignupSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400).json({ message: "Authentication failed, enter valid credentials" });
    }

    const user = response.data;

    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser = await prisma.user.create({
        data: { email: user.email, password: hashedPassword },
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    return res.json({ id: newUser.id, email: newUser.email });
};

export const signin = async (req: Request, res: Response) => {
    const response = SigninSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400).json({ message: "Authentication failed, enter valid credentials" });
    }

    const user = response.data;

    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, email: true, password: true },
    });

    if (!existingUser) {
        return res.status(404).json({ message: "User with this email does not exist" });
    }

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
};
