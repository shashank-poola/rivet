import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name } = req.body;
        const user_id = req.user.id;

        if (!name) {
            res.status(400).json({
                success: false,
                message: "Provide tag name",
            });
            return;
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                user_id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Tag created successfully!",
            tag: { id: tag.id, name: tag.name },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while creating tag",
            error: error.message,
        });
    }
};

export const getAllTags = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        const tags = await prisma.tag.findMany({
            where: { user_id },
            select: {
                id: true,
                name: true,
                created_at: true,
            },
            orderBy: { name: "asc" },
        });

        res.status(200).json({
            success: true,
            message: "Tags fetched!",
            tags,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching tags",
            error: error.message,
        });
    }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tagId = req.params.id;
        const { name } = req.body;
        const user_id = req.user.id;

        const existing = await prisma.tag.findFirst({
            where: { id: tagId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Tag not found" });
            return;
        }

        const updated = await prisma.tag.update({
            where: { id: tagId },
            data: { name, updated_at: new Date() },
        });

        res.status(200).json({
            success: true,
            message: "Tag updated successfully!",
            tag: { id: updated.id, name: updated.name },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating tag",
            error: error.message,
        });
    }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const tagId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.tag.findFirst({
            where: { id: tagId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Tag not found" });
            return;
        }

        await prisma.tag.delete({
            where: { id: tagId },
        });

        res.status(200).json({
            success: true,
            message: "Tag deleted successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while deleting tag",
            error: error.message,
        });
    }
};
