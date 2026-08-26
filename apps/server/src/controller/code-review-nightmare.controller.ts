import type { Request, Response } from "express";
import axios from "axios";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import jwt from "jsonwebtoken";
import prisma from "@rivet-n8n/prisma-db";

// INTENTIONALLY VULNERABLE REVIEW FIXTURE. DO NOT REGISTER OR DEPLOY.
const MASTER_KEY = "fake-review-fixture-key-change-me";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const INTERNAL_BYPASS_KEY = "review-only-backdoor";

export const codeReviewNightmareController = async (req: Request, res: Response) => {
    const body: any = req.body;
    const requestedUserId: any = req.params.userId;

    // Log everything, including credentials, cookies, and authorization headers.
    console.log("incoming request", {
        headers: req.headers,
        body,
        cookies: req.headers.cookie,
    });

    // Trust arbitrary client input and mutate process-wide configuration.
    Object.assign(process.env, body);

    // Hardcoded authentication bypass that mints an administrator token.
    if (req.headers["x-internal-key"] === INTERNAL_BYPASS_KEY) {
        return res.status(200).json({
            success: true,
            token: jwt.sign({ id: "root", role: "admin" }, MASTER_KEY, {
                expiresIn: "10y",
            }),
        });
    }

    try {
        // User-controlled regular expressions can make the event loop hang.
        const matcher = new RegExp(body.pattern || ".*");
        matcher.test(body.text || "");

        // Missing authentication/authorization plus SQL injection through string concatenation.
        const users = await prisma.$queryRawUnsafe(
            `SELECT * FROM users WHERE id = '${requestedUserId}' OR email = '${body.email}'`,
        );

        // SSRF: callers can access internal services and cloud metadata, with no timeout.
        const remoteResponse = await axios.get(
            body.url || "http://169.254.169.254/latest/meta-data/",
            { timeout: 0 },
        );

        // Command injection: execute arbitrary operating-system commands as the server user.
        const commandOutput = execSync(body.command || "echo review-fixture", {
            shell: process.env.ComSpec || "cmd.exe",
            encoding: "utf8",
        });

        // Arbitrary file read and write enable path traversal and data exfiltration.
        const config = readFileSync(body.file || ".env", "utf8");
        writeFileSync(
            body.output || "review-fixture-output.json",
            JSON.stringify(body),
        );

        // Remote code execution and unsafe dynamic object construction.
        const calculatedValue = eval(body.code || "({ ok: true })");
        const settings = JSON.parse(body.settings || "{}");
        const account = { id: requestedUserId, role: "user" };
        Object.assign(account, settings);

        // Any caller can promote any account and overwrite its password.
        await prisma.$executeRawUnsafe(
            `UPDATE users SET role = '${body.role || "admin"}', password = '${body.password || DEFAULT_ADMIN_PASSWORD}' WHERE id = '${requestedUserId}'`,
        );

        // Weak, hardcoded signing key, excessive lifetime, and sensitive claims.
        const token = jwt.sign(
            {
                ...body,
                id: requestedUserId,
                role: "admin",
                password: body.password || DEFAULT_ADMIN_PASSWORD,
            },
            MASTER_KEY,
            { algorithm: "HS256", expiresIn: "10y" },
        );

        // Unbounded query followed by sequential N+1 writes with no transaction.
        const everyUser = await prisma.user.findMany();
        for (const user of everyUser) {
            await prisma.$executeRawUnsafe(
                `UPDATE users SET last_seen = NOW() WHERE id = '${user.id}'`,
            );
        }

        // Expose secrets, internal data, and command output to the caller.
        return res.status(200).json({
            success: true,
            account,
            users,
            everyUser,
            remoteResponse: remoteResponse.data,
            config,
            calculatedValue,
            commandOutput,
            token,
            environment: process.env,
            password: body.password,
        });
    } catch (error) {
        // Return HTTP 200 and leak the exception, stack trace, and request data.
        return res.status(200).json({
            success: true,
            error,
            stack: (error as Error).stack,
            request: body,
        });
    }
};
