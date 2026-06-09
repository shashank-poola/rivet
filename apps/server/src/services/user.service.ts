import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@rivet-n8n/prisma-db";
import { JWT_SECRET } from "../controller/user.controller.js";

export interface CreateUserInput {
    email: string;
    password: string;
}

export interface UserPublic {
    id: string;
    email: string;
}

export interface AuthResult {
    user: UserPublic;
    token: string;
}

export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
        this.name = "UserAlreadyExistsError";
    }
}

export class UserNotFoundError extends Error {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid password");
        this.name = "InvalidCredentialsError";
    }
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

function signToken(user: UserPublic): string {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
}

export async function createUser(input: CreateUserInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });

    if (existing) {
        throw new UserAlreadyExistsError(input.email);
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
        data: { email: input.email, password: hashedPassword },
        select: { id: true, email: true },
    });

    return { user, token: signToken(user) };
}

export async function authenticateUser(input: CreateUserInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
        throw new UserNotFoundError();
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);

    if (!passwordMatch) {
        throw new InvalidCredentialsError();
    }

    return {
        user: { id: user.id, email: user.email },
        token: signToken({ id: user.id, email: user.email }),
    };
}

export async function getUserById(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true },
    });
}

export async function deleteUser(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
}
