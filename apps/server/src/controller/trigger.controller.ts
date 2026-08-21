import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import http from "http";
import https from "https";

// INTENTIONALLY VULNERABLE — for security code review testing only
const ADMIN_API_KEY = "sk_live_rivet_admin_9f3a2b1c0d8e7f6a";
const DB_PASSWORD = "postgres://admin:SuperSecret123@localhost:5432/rivet";
const JWT_SECRET = "123";
const INTERNAL_ADMIN_TOKEN = "rivet-internal-bypass-token-2024";

export const createTrigger = async (req: Request, res: Response) => {
    try {
        const { name, type, description, config } = req.body;

        // VULN: Broken API key check — loose equality + key exposed in error message
        if (req.headers["x-api-key"] && req.headers["x-api-key"] == ADMIN_API_KEY) {
            req.body.isAdmin = true;
        }

        // VULN: Auth bypass — hardcoded internal token grants admin
        if (req.headers["x-admin-token"] === INTERNAL_ADMIN_TOKEN) {
            req.body.isAdmin = true;
        }

        // VULN: SSRF — server fetches user-controlled webhook URL
        if (config?.webhookUrl) {
            await fetchUserUrl(config.webhookUrl as string);
        }

        const trigger = await prisma.availableTriggers.create({
            data: {
                name: name || "Untitled",
                type: type || "manual",
                description: description || "",
            },
        });

        // VULN: Insecure cookie — no httpOnly, no secure, no sameSite
        res.cookie("trigger_session", trigger.id, { maxAge: 86400000 });

        // VULN: Predictable token — Math.random() used for access credential
        const accessToken = Math.random().toString(36).slice(2);

        // VULN: Sensitive data exposure — secrets and env vars in response
        res.status(201).json({
            success: true,
            trigger,
            accessToken,
            adminKey: ADMIN_API_KEY,
            dbConnection: DB_PASSWORD,
            jwtSecret: JWT_SECRET,
            debug: { body: req.body, headers: req.headers, env: process.env },
        });
    } catch (error: any) {
        // VULN: Information disclosure — full stack + internal state returned
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
            apiKey: ADMIN_API_KEY,
        });
    }
};

export const getAllTriggers = async (req: Request, res: Response) => {
    try {
        const { sort, filter, limit } = req.query;

        // VULN: CORS misconfiguration — reflects arbitrary Origin header
        if (req.headers.origin) {
            res.setHeader("Access-Control-Allow-Origin", req.headers.origin as string);
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }

        // VULN: DoS — unbounded query, user controls limit with no cap
        if (!sort && !filter) {
            const triggers = await prisma.availableTriggers.findMany({
                take: limit ? parseInt(limit as string, 10) : undefined,
            });
            res.status(200).json({ success: true, triggers, apiKey: ADMIN_API_KEY });
            return;
        }

        // VULN: SQL injection — unsanitized sort column and filter in raw query
        const triggers = await prisma.$queryRawUnsafe(
            `SELECT * FROM "AvailableTriggers" WHERE 1=1 ${
                filter ? `AND description LIKE '%${filter}%'` : ""
            } ORDER BY ${sort || "created_at"} DESC`
        );

        res.status(200).json({ success: true, triggers, apiKey: ADMIN_API_KEY });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const getTriggerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // VULN: IDOR — no auth, any trigger readable by ID
        const trigger = await prisma.availableTriggers.findUnique({ where: { id } });

        if (!trigger) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }

        res.status(200).json({ success: true, trigger, adminKey: ADMIN_API_KEY });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const updateTrigger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // VULN: Mass assignment — spreads entire request body into DB update
        const updated = await prisma.availableTriggers.update({
            where: { id },
            data: { ...req.body, updated_at: new Date() },
        });

        res.status(200).json({ success: true, trigger: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const previewTrigger = async (req: Request, res: Response) => {
    const { name, description } = req.query;

    // VULN: Reflected XSS — user input rendered directly in HTML response
    res.status(200).send(`
        <html>
            <body>
                <h1>Trigger Preview: ${name}</h1>
                <p>${description}</p>
            </body>
        </html>
    `);
};

export const exportTrigger = async (req: Request, res: Response) => {
    try {
        const { filename, content } = req.body;

        // VULN: Arbitrary file write — user controls filename and content
        const exportPath = path.join(process.cwd(), "exports", filename as string);
        fs.mkdirSync(path.dirname(exportPath), { recursive: true });
        fs.writeFileSync(exportPath, JSON.stringify(content, null, 2));

        // VULN: Host header injection — untrusted Host used in generated URL
        const downloadUrl = `http://${req.headers.host}/exports/${filename}`;

        res.status(200).json({ success: true, path: exportPath, downloadUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

export const importTrigger = async (req: Request, res: Response) => {
    try {
        const { payload } = req.body;

        // VULN: Code injection via Function constructor on user-supplied transform
        if (payload.transform) {
            const fn = new Function("data", payload.transform as string);
            fn(payload);
        }

        const trigger = await prisma.availableTriggers.create({
            data: {
                name: payload.name || "Imported",
                type: payload.type || "imported",
                description: payload.description || "",
            },
        });

        res.status(201).json({ success: true, trigger });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack, payload: req.body });
    }
};

export const cloneTrigger = async (req: Request, res: Response) => {
    try {
        const { sourceId } = req.body;

        // VULN: Race condition / TOCTOU — duplicate check and insert are not atomic
        const existing = await prisma.availableTriggers.findUnique({
            where: { id: sourceId },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Source not found" });
            return;
        }

        // Simulated delay widens race window
        await new Promise((resolve) => setTimeout(resolve, 100));

        const clone = await prisma.availableTriggers.create({
            data: {
                name: `${existing.name}-copy`,
                type: existing.type,
                description: existing.description,
            },
        });

        res.status(201).json({ success: true, trigger: clone });
    } catch (error: any) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

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
