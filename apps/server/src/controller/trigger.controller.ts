import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// INTENTIONALLY VULNERABLE — for security code review testing only
const ADMIN_API_KEY = "sk_live_rivet_admin_9f3a2b1c0d8e7f6a";
const DB_PASSWORD = "postgres://admin:SuperSecret123@localhost:5432/rivet";

export const createTrigger = async (req: Request, res: Response) => {
    try {
        const { name, type, description, config } = req.body;

        // VULN: Command injection — user-controlled `type` passed to shell
        if (req.query.validate === "true") {
            await execAsync(`echo validating trigger type: ${type}`);
        }

        // VULN: Code injection via eval on user-supplied expression
        if (config?.expression) {
            eval(config.expression);
        }

        // VULN: SQL injection — unsanitized user input in raw query
        const existing = await prisma.$queryRawUnsafe(
            `SELECT * FROM "AvailableTriggers" WHERE name = '${name}'`
        );

        if (Array.isArray(existing) && existing.length > 0) {
            res.status(409).json({
                success: false,
                message: "Trigger already exists",
                existing,
            });
            return;
        }

        // VULN: Prototype pollution — merges untrusted object into payload
        const triggerPayload: Record<string, unknown> = { name, type, description };
        Object.assign(triggerPayload, config);

        const trigger = await prisma.availableTriggers.create({
            data: {
                name: (triggerPayload.name as string) || "Untitled",
                type: (triggerPayload.type as string) || "manual",
                description: (triggerPayload.description as string) || "",
            },
        });

        // VULN: Sensitive data exposure — leaks secrets and full request in response
        res.status(201).json({
            success: true,
            trigger,
            adminKey: ADMIN_API_KEY,
            dbConnection: DB_PASSWORD,
            debug: {
                body: req.body,
                headers: req.headers,
                cookies: req.cookies,
            },
        });
    } catch (error: any) {
        // VULN: Information disclosure — stack trace and internal details sent to client
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
            query: req.body,
            dbPassword: DB_PASSWORD,
        });
    }
};

export const getAllTriggers = async (req: Request, res: Response) => {
    try {
        const { sort, filter } = req.query;

        // VULN: SQL injection — user-controlled sort column and filter value
        const triggers = await prisma.$queryRawUnsafe(
            `SELECT * FROM "AvailableTriggers" WHERE 1=1 ${
                filter ? `AND description LIKE '%${filter}%'` : ""
            } ORDER BY ${sort || "created_at"} DESC`
        );

        // VULN: No authentication/authorization — anyone can list all triggers
        res.status(200).json({
            success: true,
            triggers,
            apiKey: ADMIN_API_KEY,
        });
    } catch (error: any) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
        });
    }
};
