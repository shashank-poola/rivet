import { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthRequest } from "../routes/credentials.js";

export const getWorkflows = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const workflows = await prisma.workflow.findMany({
        where: { userId },
        include: {
            nodes: true,
            webhook: true,
            executions: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    return res.json({
        message: "Workflows fetched successfully",
        workflows,
    });
};

export const createWorkflow = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const { title, triggerType, nodesJson, connections } = req.body;

    const workflow = await prisma.workflow.create({
        data: {
            title,
            userId,
            triggerType: triggerType || "MANUAL",
            nodesJson,
            connections,
            enabled: false,
        },
    });

    return res.json({
        message: "Workflow created successfully",
        workflow,
    });
};

export const updateWorkflow = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const { workflowId } = req.params;
    const { title, nodesJson, connections, enabled } = req.body;

    // Verify the workflow belongs to the user
    const existingWorkflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
    });

    if (!existingWorkflow) {
        return res.status(404).json({ message: "Workflow not found" });
    }

    const workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: {
            ...(title && { title }),
            ...(nodesJson && { nodesJson }),
            ...(connections && { connections }),
            ...(enabled !== undefined && { enabled }),
        },
    });

    return res.json({
        message: "Workflow updated successfully",
        workflow,
    });
};

export const getWorkflowById = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const { workflowId } = req.params;

    const workflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
        include: {
            nodes: true,
            webhook: true,
            executions: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
    }

    return res.json({
        message: "Workflow fetched successfully",
        workflow,
    });
};

export const deleteWorkflow = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const { workflowId } = req.params;

    // Verify the workflow belongs to the user
    const existingWorkflow = await prisma.workflow.findFirst({
        where: { id: workflowId, userId },
    });

    if (!existingWorkflow) {
        return res.status(404).json({ message: "Workflow not found" });
    }

    await prisma.workflow.delete({
        where: { id: workflowId },
    });

    return res.json({
        message: "Workflow deleted successfully",
    });
};
