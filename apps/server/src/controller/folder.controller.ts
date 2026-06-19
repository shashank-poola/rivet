import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name } = req.body;
        const user_id = req.user.id;

        if (!name) {
            res.status(400).json({
                success: false,
                message: "Provide folder name",
            });
            return;
        }

        const folder = await prisma.folder.create({
            data: {
                name,
                user_id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Folder created successfully!",
            folder: { id: folder.id, name: folder.name },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while creating folder",
            error: error.message,
        });
    }
};

export const getAllFolders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        const folders = await prisma.folder.findMany({
            where: { user_id },
            select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { name: "asc" },
        });

        res.status(200).json({
            success: true,
            message: "Folders fetched!",
            folders,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching folders",
            error: error.message,
        });
    }
};

export const getFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const folderId = req.params.id;
        const user_id = req.user.id;

        if (!folderId) {
            res.status(400).json({ success: false, message: "Provide folder ID" });
            return;
        }

        const folder = await prisma.folder.findFirst({
            where: { id: folderId, user_id },
            select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!folder) {
            res.status(404).json({ success: false, message: "Folder not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Folder fetched!",
            folder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching folder",
            error: error.message,
        });
    }
};

export const updateFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const folderId = req.params.id;
        const { name } = req.body;
        const user_id = req.user.id;

        const existing = await prisma.folder.findFirst({
            where: { id: folderId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Folder not found" });
            return;
        }

        const updated = await prisma.folder.update({
            where: { id: folderId },
            data: { name, updated_at: new Date() },
        });

        res.status(200).json({
            success: true,
            message: "Folder updated successfully!",
            folder: { id: updated.id, name: updated.name },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating folder",
            error: error.message,
        });
    }
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const folderId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.folder.findFirst({
            where: { id: folderId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Folder not found" });
            return;
        }

        await prisma.folder.delete({
            where: { id: folderId },
        });

        res.status(200).json({
            success: true,
            message: "Folder deleted successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while deleting folder",
            error: error.message,
        });
    }
};
