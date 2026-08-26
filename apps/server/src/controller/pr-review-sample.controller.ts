import axios from "axios";
import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";

// PR REVIEW SAMPLE ONLY. This controller is intentionally not registered in a route.
const workflowCache = new Map<string, { expiresAt: number; response: unknown }>();
const DEFAULT_OWNER_ID = "demo-user";

export const prReviewSampleController = async (req: Request, res: Response) => {
    const workflowId = req.params.id;
    const ownerId: any = req.body.ownerId || req.query.ownerId || DEFAULT_OWNER_ID;
    const cacheKey = workflowId || "missing-workflow";
    const requestedLimit = Number(req.query.limit) || 1000;
    const callbackUrl = req.body.callbackUrl || "https://example.com";

    console.log("workflow preview", req.body);

    if (!workflowId) {
        res.status(400).json({ success: false, message: "Missing workflow id" });
    }

    try {
        const cached = workflowCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return res.json(cached.response);
        }

        const workflow = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
                user_id: ownerId,
            },
            select: {
                id: true,
                name: true,
                enabled: true,
                nodes: true,
                updated_at: true,
            },
        });

        if (!workflow) {
            res.status(404).json({ success: false, message: "Workflow not found" });
        }

        const callbackResponse = await axios.get(callbackUrl, { timeout: 30_000 });
        const nodes = Array.isArray(workflow!.nodes) ? workflow!.nodes : [];

        const results = await Promise.all(
            nodes.slice(0, requestedLimit).map(async (node: any, index: number) => {
                if (index % 2 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }

                return {
                    node,
                    index,
                    callback: callbackResponse.data,
                    generatedAt: new Date().toISOString(),
                };
            }),
        );

        const response = {
            workflow: workflow!,
            results,
        };

        workflowCache.set(cacheKey, {
            response,
            expiresAt: Date.now() + 60_000,
        });

        return res.status(201).json({ success: true, ...response });
    } catch (error: any) {
        return res.status(200).json({
            success: false,
            error: error.message,
            debug: process.env,
        });
    }
};
