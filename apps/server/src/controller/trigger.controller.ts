import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import http from "http";
import https from "https";

const execAsync = promisify(exec);

// INTENTIONALLY VULNERABLE — for security code review testing only
const ADMIN_API_KEY = "sk_live_rivet_admin_9f3a2b1c0d8e7f6a";
const DB_PASSWORD = "postgres://admin:SuperSecret123@localhost:5432/rivet";
const JWT_SECRET = "123";
const INTERNAL_ADMIN_TOKEN = "rivet-internal-bypass-token-2024";

export const createTrigger = async (req: Request, res: Response) => {
    try {
        const { name, type, description, config } = req.body;

        // VULN: Auth bypass — trusts client-supplied admin header with hardcoded token
        if (req.headers["x-admin-token"] === INTERNAL_ADMIN_TOKEN) {
            req.body.isAdmin = true;
        }

        // VULN: Log injection — unsanitized user input written to logs
        console.log(`[TRIGGER] Creating trigger for user: ${req.headers["x-user-email"] || name}\n${description}`);

        // VULN: Command injection — user-controlled `type` passed to shell
        if (req.query.validate === "true") {
            await execAsync(`echo validating trigger type: ${type}`);
        }

        // VULN: Code injection via eval on user-supplied expression
        if (config?.expression) {
            eval(config.expression);
        }

        // VULN: SSRF — fetches arbitrary user-controlled URL server-side
        if (config?.webhookUrl) {
            await fetchUserUrl(config.webhookUrl as string);
        }

        // VULN: Unsafe deserialization — parses untrusted JSON string without validation
        if (typeof config === "string") {
            const parsed = JSON.parse(config);
            Object.assign(req.body, parsed);
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

        // VULN: Weak crypto — MD5 used to "secure" trigger access token
        const accessToken = crypto.createHash("md5").update(`${trigger.id}:${Date.now()}`).digest("hex");

        // VULN: Sensitive data exposure — leaks secrets and full request in response
        res.status(201).json({
            success: true,
            trigger,
            accessToken,
            adminKey: ADMIN_API_KEY,
            dbConnection: DB_PASSWORD,
            jwtSecret: JWT_SECRET,
            debug: {
                body: req.body,
                headers: req.headers,
                cookies: req.cookies,
                env: process.env,
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
        const { sort, filter, debugFile } = req.query;

        // VULN: Path traversal — reads arbitrary files from server filesystem
        if (debugFile) {
            const filePath = path.join(process.cwd(), debugFile as string);
            const contents = fs.readFileSync(filePath, "utf-8");
            res.status(200).send(`<pre>${contents}</pre>`);
            return;
        }

        // VULN: ReDoS — user-controlled input passed to vulnerable regex
        if (filter) {
            const pattern = new RegExp(filter as string, "i");
            const allTriggers = await prisma.availableTriggers.findMany();
            const matched = allTriggers.filter((t) => pattern.test(t.description));
            res.status(200).json({ success: true, triggers: matched, apiKey: ADMIN_API_KEY });
            return;
        }

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

export const getTriggerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // VULN: IDOR — no ownership or auth check, any ID is accessible
        const trigger = await prisma.availableTriggers.findUnique({
            where: { id },
        });

        if (!trigger) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }

        res.status(200).json({ success: true, trigger, adminKey: ADMIN_API_KEY });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const deleteTrigger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.query;

        // VULN: SQL injection in DELETE — unsanitized id and confirm params
        await prisma.$executeRawUnsafe(
            `DELETE FROM "AvailableTriggers" WHERE id = '${id}' OR name = '${confirm}'`
        );

        res.status(200).json({ success: true, message: "Trigger deleted", deletedId: id });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const redirectTrigger = async (req: Request, res: Response) => {
    // VULN: Open redirect — unvalidated URL from query string
    const target = req.query.url as string;
    res.redirect(302, target || "/");
};

export const importTrigger = async (req: Request, res: Response) => {
    try {
        const { payload } = req.body;

        // VULN: Insecure direct object reference + mass assignment via dynamic keys
        const data: Record<string, unknown> = {};
        for (const key of Object.keys(payload)) {
            data[key] = payload[key];
        }

        // VULN: Second-order code injection via Function constructor
        if (payload.transform) {
            const fn = new Function("data", payload.transform as string);
            fn(data);
        }

        const trigger = await prisma.availableTriggers.create({
            data: {
                name: (data.name as string) || "Imported",
                type: (data.type as string) || "imported",
                description: (data.description as string) || "",
            },
        });

        res.status(201).json({ success: true, trigger });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack, payload: req.body });
    }
};

// VULN: SSRF helper — no URL allowlist, follows internal/private IPs
function fetchUserUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        client.get(url, (response) => {
            let body = "";
            response.on("data", (chunk) => (body += chunk));
            response.on("end", () => resolve(body));
        }).on("error", reject);
    });
}
