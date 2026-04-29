import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { ExecutionStatus } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import executeNodes from "../engine/execute.engine.js";
import { executionEvents } from "../events.js";
import { Flow } from "../types/execution.type.js";

export const execute = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workflowId } = req.body;
        const user_id = req.user.id;

        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId , user_id },
            select : {
                flow: true,
                enabled: true,
            },
        });

        if (!workflow) {
            res.status(404).json({ success: false, message: "Workflow not found" });
            return;
        }

        if(!workflow?.enabled){
            res.status(203).json({ success: false, message: "Workflow is not enabled" });
            return;
        }

        const flow = workflow?.flow as Flow;

        const { nodes } = flow;

        // console.log("workflowId",workflowId ,"-----------------");
        // console.log(nodes);

        const execution = await prisma.execution.create({
            data : {
                workflow_id : workflowId
            }
        })

        if(!execution){
            res.status(403).json({ success: false, message: "Failed to create execution" });
            return;
        }

        // Kick off execution asynchronously and return executionId immediately
        (async () => {
            try {
                // emit trigger start and success for UI feedback
                const triggerNode = nodes.find((n: any) => n.type === 'trigger');
                if (triggerNode) {
                    executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "RUNNING", ts: Date.now() });
                }
                
                // If there are action nodes, engine will emit trigger SUCCESS when first action starts
                const hasActionNodes = (nodes || []).some((n: any) => n.type !== 'trigger');
                await executeNodes(workflowId, nodes, execution.id, triggerNode?.id);

                if (!hasActionNodes && triggerNode) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "SUCCESS", ts: Date.now() });
                }
                await prisma.execution.update({
                    where: { id: execution.id },
                    data: { status: ExecutionStatus.SUCCESS, ended_at: new Date() }
                });
            } catch (err: any) {
                // Mark trigger as failed if there's an error
                const triggerNode = nodes.find((n: any) => n.type === 'trigger');
                if (triggerNode) {
                    executionEvents.emit("update", { executionId: execution.id, nodeId: triggerNode.id, status: "FAILED", ts: Date.now() });
                }
                await prisma.execution.update({
                    where: { id: execution.id },
                    data: { status: ExecutionStatus.FAILED, ended_at: new Date() }
                });
            }
        })();

        res.status(202).json({ success: true, message: "Workflow execution started", executionId: execution.id });
        return;
    } catch (error) {
        console.log("Error while executing workflow", error);
        res.status(500).json({ success: false, message: "Error while executing workflow" });
        return;
    }
}

export const getExecutions = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user.id;

    try {
        const executions = await prisma.execution.findMany({
            where:{
                workflow: { user_id }
            },
            select: {
                id: true,
                status: true,
                started_at: true,
                ended_at: true,
                workflow: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                ended_at: "desc",
            }
        });

        if(!executions){
            res.status(404).json({ success: false, message: "Executions not found" });
            return;
        }
        
        res.status(200).json({ success: true, message: "Executions fetched successfully", executions });
        return;

    } catch (error) {
        res.status(500).json({ success: false, message: "Error while fetching execution" });
        return;
    }
}