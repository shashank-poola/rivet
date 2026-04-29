import type { Request, Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import executeNodes from "../engine/execute.engine.js";
import type { Flow } from "../types/execution.type.js";
import { ExecutionStatus } from "@prisma/client";
import { executionEvents } from "../events.js";

export const webhookTrigger = async (req: Request, res: Response) => {
    try {
        const { workflowId } = req.params;

        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            select: {
                flow: true,
                enabled: true,
                name: true,
            },
        });

        if (!workflow) {
            res.status(404).json({
                success: false,
                message: "Workflow not found"
            });
            return;
        }

        if (!workflow.enabled) {
            res.status(400).json({
                success: false,
                message: "Workflow is not enabled"
            });
            return;
        }

        const flow = workflow.flow as Flow;
        const { nodes } = flow;

        console.log(`Webhook triggered for workflow ${workflowId}:`);

        const execution = await prisma.execution.create({
            data: {
                workflow_id: workflowId as string
            }
        });

        if (!execution) {
            res.status(403).json({ success: false, message: "Failed to create execution" });
            return;
        }

        try {
            const triggerNode = nodes.find((n: any) => n.type === 'trigger');
            if (triggerNode) {
                executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "RUNNING", ts: Date.now() });
            }
            const hasActionNodes = (nodes || []).some((n: any) => n.type !== 'trigger');
            await executeNodes(workflowId as string, nodes, execution.id, triggerNode?.id);
            if (!hasActionNodes && triggerNode) {
                await new Promise(resolve => setTimeout(resolve, 500));
                executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "SUCCESS", ts: Date.now() });
            }
            await prisma.execution.update({
                where: { id: execution.id },
                data: { status: ExecutionStatus.SUCCESS, ended_at: new Date() }
            });

            res.status(200).json({ success: true, message: "Workflow executed successfully" });
            return;
        } catch (err: any) {
            const triggerNode = nodes.find((n: any) => n.type === 'trigger');
            if (triggerNode) {
                executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "FAILED", ts: Date.now() });
            }
            await prisma.execution.update({
                where: { id: execution.id },
                data: { status: ExecutionStatus.FAILED, ended_at: new Date() }
            });
            res.status(400).json({ success: false, message: err?.message || "Workflow execution failed" });
            return;
        }
    } catch (error) {
        console.log("Error while processing webhook:", error);
        res.status(500).json({
            success: false,
            message: "Error while processing webhook"
        });
        return;
    }
};
