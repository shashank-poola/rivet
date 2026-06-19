import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createVariable = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { key, value } = req.body;
        const user_id = req.user.id;

        if (!key || !value) {
            res.status(400).json({
                success: false,
                message: "Provide all required fields",
            });
            return;
        }

        const variable = await prisma.variable.create({
            data: {
                key,
                value,
                user_id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Variable created successfully!",
            variable: { id: variable.id, key: variable.key },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while creating variable",
            error: error.message,
        });
    }
};

export const getAllVariables = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        const variables = await prisma.variable.findMany({
            where: { user_id },
            select: {
                id: true,
                key: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: { created_at: "desc" },
        });

        res.status(200).json({
            success: true,
            message: "Variables fetched!",
            variables,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching variables",
            error: error.message,
        });
    }
};

export const updateVariable = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const variableId = req.params.id;
        const { key, value } = req.body;
        const user_id = req.user.id;

        const existing = await prisma.variable.findFirst({
            where: { id: variableId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Variable not found" });
            return;
        }

        const updated = await prisma.variable.update({
            where: { id: variableId },
            data: { key, value, updated_at: new Date() },
        });

        res.status(200).json({
            success: true,
            message: "Variable updated successfully!",
            variable: { id: updated.id, key: updated.key },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating variable",
            error: error.message,
        });
    }
};

export const deleteVariable = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const variableId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.variable.findFirst({
            where: { id: variableId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Variable not found" });
            return;
        }

        await prisma.variable.delete({
            where: { id: variableId },
        });

        res.status(200).json({
            success: true,
            message: "Variable deleted successfully!",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while deleting variable",
            error: error.message,
        });
    }
};
