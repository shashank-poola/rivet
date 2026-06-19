import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, description, nodes, edges, flow } = req.body;
        const user_id = req.user.id;

        if (!name || !nodes || !edges || !flow) {
            res.status(400).json({
                success: false,
                message: "Provide all required fields",
            });
            return;
        }

        const template = await prisma.template.create({
            data: {
                name,
                description,
                nodes,
                edges,
                flow,
                user_id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Template created successfully!",
            template: { id: template.id },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while creating template",
            error: error.message,
        });
    }
};

export const getAllTemplates = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        const templates = await prisma.template.findMany({
            where: { user_id },
            select: {
                id: true,
                name: true,
                description: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { updated_at: "desc" },
        });

        res.status(200).json({
            success: true,
            message: "Templates fetched!",
            templates,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching templates",
            error: error.message,
        });
    }
};

export const getTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const templateId = req.params.id;
        const user_id = req.user.id;

        if (!templateId) {
            res.status(400).json({ success: false, message: "Provide template ID" });
            return;
        }

        const template = await prisma.template.findFirst({
            where: { id: templateId, user_id },
            select: {
                id: true,
                name: true,
                description: true,
                nodes: true,
                edges: true,
                flow: true,
            },
        });

        if (!template) {
            res.status(404).json({ success: false, message: "Template not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Template fetched!",
            template,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching template",
            error: error.message,
        });
    }
};

export const updateTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const templateId = req.params.id;
        const { name, description, nodes, edges, flow } = req.body;
        const user_id = req.user.id;

        const existing = await prisma.template.findFirst({
            where: { id: templateId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Template not found" });
            return;
        }

        const updated = await prisma.template.update({
            where: { id: templateId },
            data: {
                name,
                description,
                nodes,
                edges,
                flow,
                updated_at: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            message: "Template updated successfully!",
            template: updated,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating template",
            error: error.message,
        });
    }
};

export const deleteTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const templateId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.template.findFirst({
            where: { id: templateId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Template not found" });
            return;
        }

        await prisma.template.delete({
            where: { id: templateId },
        });

        res.status(200).json({
            success: true,
            message: "Template deleted successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while deleting template",
            error: error.message,
        });
    }
};
