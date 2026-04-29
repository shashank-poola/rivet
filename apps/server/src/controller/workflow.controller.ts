import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createWorkflow = async(req: AuthenticatedRequest, res : Response) => {
    try {
        const { name , enabled , nodes , edges, flow } = req.body;

        const user = req.user;

        if(!name || !nodes || !edges || !flow){
            res.json({
                success : false,
                message : "Provide all inputs",
            })
            return;
        }

        // const isWebhook = nodes[0].data.type === "webhook-trigger";
        // console.log(isWebhook);

        const workflow = await prisma.workflow.create({
            data : {
                name,
                user_id : user.id,
                enabled,
                nodes,
                edges,
                flow
            }
        })

        if(!workflow){
            res.status(403).json({success : false, message : "Failed to create workflow!"})
        }

        res.status(200).json({
            success : true,
            message : "Workflow Created Successfully!",
            workflow : {
                id : workflow.id
            }
        })
        return;

    } catch (error : any) {
        console.log("Error while creating workflow")
        res.json({
            success : false,
            message : "Error while Creating Workflow",
            error : error.message
        })
        return;
    }
}

export const updateWorkflow = async(req: AuthenticatedRequest, res : Response) => {
    try {
        const workflowId = req.params.id;
        const { name, enabled, nodes, edges, flow } = req.body;
        const user_id = req.user.id;

        const existing = await prisma.workflow.findFirst({
            where: { id: workflowId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Workflow not found" });
            return;
        }

        const updated = await prisma.workflow.update({
            where: { id: workflowId },
            data: {
                name: name ,
                enabled: enabled ,
                nodes: nodes ,
                edges: edges ?? undefined,
                flow: flow ,
                updated_at: new Date(),
            },
        });

        res.status(200).json({ 
            success: true, 
            message: "Workflow updated successfully!",
            workflow: updated 
        });
        return;
    } catch (error: any) {
        console.log("Error while updating workflow");
        res.status(500).json({
            success: false,
            message: "Error while updating workflow",
            error: error?.message,
        });
        return;
    }
}

export const getWorkflow = async(req: AuthenticatedRequest, res : Response) => {
    try {

        const workflowId = req.params.id;

        if(!workflowId){
            res.json({
                success : false,
                message : "Provide Workflow ID!"
            })
            return;
        }

        const user_id = req.user.id;

        const workflow = await prisma.workflow.findFirst({
            where :{
                id : workflowId,
                user_id : user_id
            },
            select : {
                id : true,
                name : true,
                enabled : true,
                nodes : true,
                edges : true,
                flow : true
            }
        })

        if(!workflow){
            res.status(403).json({success : false, message : "Workflow not Found!"})
        }

        res.status(200).json({
            success: true,
            message : "Workflow Fetched!",
            workflow
        })
        return;
        
    } catch (error : any) {
        res.json({
            success : false,
            message : "Error while Getting Workflow Data",
            error : error.message
        })
        return;
    }
}

export const getAllWorkflow = async (req: AuthenticatedRequest, res : Response) => {
    try {
        const user_id = req.user.id;

        const workflows = await prisma.workflow.findMany({
            where :{
                user_id : user_id
            },
            select : {
                id : true,
                name : true,
                updated_at : true,
                created_at : true,
                enabled : true
            },
            orderBy : {
                updated_at: "desc"
            }
        })

        if(!workflows){
            res.status(403).json({success : false, message : "Workflow not Found!"})
        }

        res.status(200).json({
            success: true,
            message : "Workflows Fetched!",
            workflows
        })
        
    } catch (error : any) {
        res.json({
            success : false,
            message : "Error while Getting Workflow Data",
            error : error.message
        })
        return;
    }
}

export const deleteWorkflow = async (req: AuthenticatedRequest, res : Response) => {
    try {
        const workflowId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.workflow.findFirst({
            where: { id: workflowId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Workflow not found" });
            return;
        }

        const updated = await prisma.workflow.delete({
            where: { id: workflowId },
        });

        res.status(200).json({ 
            success: true, 
            message: "Workflow Deleted successfully!",
            workflow: updated 
        });
        return;
    } catch (error: any) {
        console.log("Error while Deleting workflow",error.message);
        res.status(500).json({
            success: false,
            message: "Error while Deleting workflow",
            error: error?.message,
        });
        return;
    }
}